import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

export default function App() {
  return (
    <div className="min-h-screen bg-darkbg text-neon p-10">
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  )
}