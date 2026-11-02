import { Buffer } from 'node:buffer'

const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842
const MARGIN = 48

function safeText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^\x20-\x7e]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapePdfText(value) {
  return safeText(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function textCommand(value, x, y, size = 10, font = 'F1', color = '0.12 0.08 0.18') {
  return color + ' rg\nBT /' + font + ' ' + size + ' Tf ' + x + ' ' + y + ' Td (' + escapePdfText(value) + ') Tj ET\n'
}

function lineCommand(x1, y1, x2, y2, color = '0.78 0.73 0.84', width = 0.7) {
  return color + ' RG ' + width + ' w ' + x1 + ' ' + y1 + ' m ' + x2 + ' ' + y2 + ' l S\n'
}

function wrapText(value, maxLength = 43) {
  const words = safeText(value).split(' ').filter(Boolean)
  const lines = []
  let current = ''

  for (const word of words) {
    const next = current ? current + ' ' + word : word
    if (next.length > maxLength && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }

  if (current) lines.push(current)
  return lines.length ? lines : ['-']
}

function formatMoney(value) {
  return 'USD ' + new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return safeText(value) || 'No disponible'
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(date)
}

function makePage(continuation = false) {
  const commands = []
  commands.push('0.16 0.04 0.25 rg 0 786 595 56 re f\n')
  commands.push(textCommand('ART-SYNTEX  |  A/S NEXUS', MARGIN, 810, 14, 'F2', '1 1 1'))
  commands.push(textCommand(continuation ? 'ORDEN DE COMPRA - CONTINUACION' : 'ORDEN DE COMPRA', MARGIN, 752, continuation ? 17 : 23, 'F2'))
  if (!continuation) {
    commands.push(textCommand('Documento informativo - no constituye factura ni acredita un pago', MARGIN, 730, 9, 'F1', '0.38 0.32 0.43'))
  }
  commands.push(lineCommand(MARGIN, continuation ? 724 : 712, PAGE_WIDTH - MARGIN, continuation ? 724 : 712))
  return { commands, y: continuation ? 690 : 684 }
}

function addTableHeader(page) {
  const y = page.y
  page.commands.push('0.94 0.91 0.97 rg 48 ' + (y - 7) + ' 499 24 re f\n')
  page.commands.push(textCommand('Producto', 54, y, 8, 'F2'))
  page.commands.push(textCommand('Cant.', 354, y, 8, 'F2'))
  page.commands.push(textCommand('Unitario', 405, y, 8, 'F2'))
  page.commands.push(textCommand('Subtotal', 495, y, 8, 'F2'))
  page.y -= 29
}

function makePdf(pages) {
  const objects = []
  const pageRefs = pages.map((_, index) => (5 + index * 2) + ' 0 R')
  objects.push('<< /Type /Catalog /Pages 2 0 R >>')
  objects.push('<< /Type /Pages /Kids [ ' + pageRefs.join(' ') + ' ] /Count ' + pages.length + ' >>')
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')

  pages.forEach((page, index) => {
    page.commands.push(lineCommand(MARGIN, 64, PAGE_WIDTH - MARGIN, 64, '0.78 0.73 0.84', 0.6))
    page.commands.push(textCommand('Art-Syntex - Orden pendiente de confirmacion', MARGIN, 46, 8, 'F1', '0.38 0.32 0.43'))
    page.commands.push(textCommand('Pagina ' + (index + 1) + ' de ' + pages.length, 485, 46, 8, 'F1', '0.38 0.32 0.43'))

    const stream = page.commands.join('')
    const pageObjectId = 5 + index * 2
    const streamObjectId = pageObjectId + 1

    objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PAGE_WIDTH + ' ' + PAGE_HEIGHT + '] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ' + streamObjectId + ' 0 R >>')
    objects.push('<< /Length ' + Buffer.byteLength(stream, 'ascii') + ' >>\nstream\n' + stream + 'endstream')
  })

  const chunks = [Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'binary')]
  const offsets = [0]
  let length = chunks[0].length

  objects.forEach((body, index) => {
    offsets.push(length)
    const objectChunk = Buffer.from((index + 1) + ' 0 obj\n' + body + '\nendobj\n', 'binary')
    chunks.push(objectChunk)
    length += objectChunk.length
  })

  const xrefOffset = length
  let xref = 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n'
  for (const offset of offsets.slice(1)) {
    xref += String(offset).padStart(10, '0') + ' 00000 n \n'
  }
  xref += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF'
  chunks.push(Buffer.from(xref, 'binary'))
  return Buffer.concat(chunks)
}

export function createPurchaseOrderPdf(order) {
  if (!order || typeof order.orderId !== 'string' || !Array.isArray(order.items) || order.items.length === 0) {
    throw new TypeError('A valid purchase order is required to create its PDF.')
  }
  if (!Number.isFinite(order.total) || order.total < 0) {
    throw new TypeError('The purchase order total is invalid.')
  }

  const pages = []
  let page = makePage(false)

  page.commands.push(textCommand('Orden', MARGIN, page.y, 8, 'F2', '0.38 0.32 0.43'))
  page.commands.push(textCommand(safeText(order.orderId), MARGIN, page.y - 18, 12, 'F2'))
  page.commands.push(textCommand('Fecha de emision', 340, page.y, 8, 'F2', '0.38 0.32 0.43'))
  page.commands.push(textCommand(formatDate(order.createdAt), 340, page.y - 18, 10, 'F2'))
  page.y -= 44
  page.commands.push(textCommand('Cliente', MARGIN, page.y, 8, 'F2', '0.38 0.32 0.43'))
  page.commands.push(textCommand(order.customerName || 'Cliente de Art-Syntex', MARGIN, page.y - 16, 10, 'F2'))
  page.commands.push(textCommand('Correo', 340, page.y, 8, 'F2', '0.38 0.32 0.43'))
  page.commands.push(textCommand(order.customerEmail || 'No disponible', 340, page.y - 16, 9, 'F1'))
  page.y -= 48
  page.commands.push(textCommand('Estado: PENDIENTE DE CONFIRMACION / PAGO', MARGIN, page.y, 9, 'F2', '0.48 0.19 0.61'))
  page.y -= 28
  addTableHeader(page)

  for (const item of order.items) {
    const nameLines = wrapText(item.name, 42)
    const rowHeight = Math.max(1, nameLines.length) * 12 + 10

    if (page.y - rowHeight < 92) {
      pages.push(page)
      page = makePage(true)
      page.y -= 16
      addTableHeader(page)
    }

    nameLines.forEach((line, index) => {
      page.commands.push(textCommand(line, 54, page.y - index * 12, 8.5, 'F1'))
    })
    page.commands.push(textCommand(String(item.quantity), 354, page.y, 8.5, 'F1'))
    page.commands.push(textCommand(formatMoney(Number(item.unitPrice)), 405, page.y, 8, 'F1'))
    page.commands.push(textCommand(formatMoney(Number(item.lineTotal)), 495, page.y, 8, 'F1'))
    page.y -= rowHeight
    page.commands.push(lineCommand(MARGIN, page.y + 3, PAGE_WIDTH - MARGIN, page.y + 3, '0.89 0.86 0.92', 0.45))
  }

  if (page.y < 142) {
    pages.push(page)
    page = makePage(true)
    page.y -= 16
  }

  page.commands.push(lineCommand(340, page.y - 4, PAGE_WIDTH - MARGIN, page.y - 4, '0.48 0.19 0.61', 1))
  page.commands.push(textCommand('TOTAL DE LA ORDEN', 340, page.y - 25, 10, 'F2'))
  page.commands.push(textCommand(formatMoney(order.total), 455, page.y - 25, 11, 'F2', '0.36 0.10 0.48'))
  page.commands.push(textCommand('La orden queda registrada con estado pendiente. No se ha confirmado ningun pago.', MARGIN, page.y - 58, 8.5, 'F1', '0.38 0.32 0.43'))

  pages.push(page)
  return makePdf(pages)
}
