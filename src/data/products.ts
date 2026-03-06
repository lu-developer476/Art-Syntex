export interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  category: 'Neural' | 'Combat' | 'Optics' | 'Interface'
  featured?: boolean
}

export const productsSeed: Product[] = [
  {
    id: 'sandevistan',
    name: 'Sandevistan Mk.4',
    price: 3200,
    image: '/images/sandevistan.png',
    description: 'Acelera tu percepción temporal para ataques y evasión instantáneos.',
    category: 'Neural',
    featured: true,
  },
  {
    id: 'disk-ram',
    name: 'Ex-Disk + mejora de RAM',
    price: 850,
    image: '/images/disk-ram.png',
    description: 'Expansión de memoria neuronal para ejecutar más quickhacks sin latencia.',
    category: 'Neural',
  },
  {
    id: 'mantis-blades',
    name: 'Garras Mantis',
    price: 2600,
    image: '/images/mantis-blades.png',
    description: 'Cuchillas retráctiles de titanio con sistema de estabilización giroscópica.',
    category: 'Combat',
    featured: true,
  },
  {
    id: 'gorilla-arms',
    name: 'Brazos gorila',
    price: 2400,
    image: '/images/gorilla-arms.png',
    description: 'Aumenta tu fuerza física para combate cuerpo a cuerpo y tareas de alto impacto.',
    category: 'Combat',
  },
  {
    id: 'facial-cyberware',
    name: 'Cyberware facial',
    price: 1490,
    image: '/images/facial-cyberware.png',
    description: 'Reemplazo facial modular con protección balística y expresividad digital.',
    category: 'Interface',
  },
  {
    id: 'synaptic-reflector',
    name: 'Acelerador sináptico + sintonizador de reflejos',
    price: 1750,
    image: '/images/synaptic-reflector.png',
    description: 'Refuerzo sináptico que reduce el tiempo de reacción ante amenazas cercanas.',
    category: 'Neural',
  },
  {
    id: 'projectile-ls',
    name: 'Sistema de lanzamiento de proyectiles',
    price: 2800,
    image: '/images/proyectile-ls.png',
    description: 'Lanzador de proyectiles integrado en brazo con control de trayectoria inteligente.',
    category: 'Combat',
  },
  {
    id: 'kiroshi-optics',
    name: 'Ópticas Kiroshi oráculo',
    price: 1320,
    image: '/images/kiroshi-optics.png',
    description: 'Visión aumentada con zoom táctico, escaneo térmico y mejora de contraste.',
    category: 'Optics',
    featured: true,
  },
  {
    id: 'atomic-sensors',
    name: 'Sensores atómicos',
    price: 1190,
    image: '/images/atomic-sensors.png',
    description: 'Sensores de entorno para detección de bioseñales, ruido y anomalías químicas.',
    category: 'Optics',
  },
  {
    id: 'visual-interface',
    name: 'Soporte de corteza visual',
    price: 990,
    image: '/images/visual-interface.png',
    description: 'Conecta HUD y comunicaciones en tiempo real con tus implantes principales.',
    category: 'Interface',
  },
]
