import { Routes, Route } from 'react-router-dom'
import Container from './components/Container'
import MainLayout from './layout/Main'
import Home, { type SectionKey } from './pages/Home'

function SectionRoute({ section }: { section: SectionKey }) {
  return <Home focusSection={section} />
}

export default function App() {
  return (
    <MainLayout>
      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/acceso" element={<SectionRoute section="acceso" />} />
          <Route path="/productos" element={<SectionRoute section="productos" />} />
          <Route path="/contacto" element={<SectionRoute section="contacto" />} />
        </Routes>
      </Container>
    </MainLayout>
  )
}
