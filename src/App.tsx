import { Routes, Route } from 'react-router-dom'
import Container from './components/Container'
import MainLayout from './layout/Main'
import Access from './pages/Access'
import Contact from './pages/Contact'
import Home from './pages/Home'
import Products from './pages/Products'

export default function App() {
  return (
    <MainLayout>
      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/acceso" element={<Access />} />
          <Route path="/productos" element={<Products />} />
          <Route path="/contacto" element={<Contact />} />
        </Routes>
      </Container>
    </MainLayout>
  )
}
