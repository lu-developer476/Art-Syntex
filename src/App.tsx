import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

export default function App() {
  return (
    <div className="min-h-screen bg-[#090912] px-4 py-8 text-slate-100 md:px-10">
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  )
}
