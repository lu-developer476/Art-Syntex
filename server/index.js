import express from 'express'
import nodemailer from 'nodemailer'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

app.post('/send', async (req, res) => {
  const { name, email, message } = req.body

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

  await transporter.sendMail({
    from: email,
    to: process.env.EMAIL_USER,
    subject: `New message from ${name}`,
    text: message
  })

  res.json({ success: true })
})

app.listen(3001, () => console.log('Mail server running on 3001'))
