import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

export default function App() {
  return (
    <div className="min-h-screen bg-white px-4 py-8 text-purple-900 md:px-10">
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  )
}
