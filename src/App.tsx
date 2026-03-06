import { Routes, Route } from 'react-router-dom'
import Container from './components/Container'
import MainLayout from './layout/Main'
import Home from './pages/Home'

export default function App() {
  return (
    <MainLayout>
      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Container>
    </MainLayout>
  )
}
