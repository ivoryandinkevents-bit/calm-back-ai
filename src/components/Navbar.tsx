import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-cream border-b border-cream-dark sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-chocolate tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Calm Back <span className="text-sage">AI</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={`text-sm font-medium hover:text-sage transition ${isActive('/') ? 'text-sage' : 'text-chocolate'}`}>Home</Link>
          <Link to="/about" className={`text-sm font-medium hover:text-sage transition ${isActive('/about') ? 'text-sage' : 'text-chocolate'}`}>About</Link>

          <div className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
            <button className="text-sm font-medium text-chocolate hover:text-sage transition flex items-center gap-1">
              Services
              <svg className={`w-3 h-3 transition ${servicesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {servicesOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg py-2 min-w-[200px]">
                <Link to="/workshops" className="block px-4 py-2 text-sm hover:bg-cream transition">Workshops</Link>
                <Link to="/agent-builds" className="block px-4 py-2 text-sm hover:bg-cream transition">Agent Builds</Link>
              </div>
            )}
          </div>

          <div className="relative" onMouseEnter={() => setResourcesOpen(true)} onMouseLeave={() => setResourcesOpen(false)}>
            <button className="text-sm font-medium text-chocolate hover:text-sage transition flex items-center gap-1">
              Resources
              <svg className={`w-3 h-3 transition ${resourcesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {resourcesOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg py-2 min-w-[220px]">
                <Link to="/what-things-are" className="block px-4 py-2 text-sm hover:bg-cream transition">What Things Are</Link>
                <Link to="/gdpr-ai-safety" className="block px-4 py-2 text-sm hover:bg-cream transition">GDPR & AI Safety</Link>
                <Link to="/authenticity-and-ai" className="block px-4 py-2 text-sm hover:bg-cream transition">Authenticity & AI</Link>
                <Link to="/environmental-impact" className="block px-4 py-2 text-sm hover:bg-cream transition">Environmental Impact</Link>
                <Link to="/tech-stack" className="block px-4 py-2 text-sm hover:bg-cream transition">My Tech Stack</Link>
                <Link to="/people-to-follow" className="block px-4 py-2 text-sm hover:bg-cream transition">People to Follow</Link>
              </div>
            )}
          </div>

          <Link to="/contact" className="bg-sage text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-sage-dark transition">
            Book a Discovery Call
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-chocolate" onClick={() => setMobileOpen(!mobileOpen)}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-cream-dark px-6 py-4 space-y-3">
          <Link to="/" className="block text-sm font-medium py-1" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/about" className="block text-sm font-medium py-1" onClick={() => setMobileOpen(false)}>About</Link>
          <p className="text-xs font-semibold text-sage uppercase tracking-wide pt-2">Services</p>
          <Link to="/workshops" className="block text-sm py-1 pl-3" onClick={() => setMobileOpen(false)}>Workshops</Link>
          <Link to="/agent-builds" className="block text-sm py-1 pl-3" onClick={() => setMobileOpen(false)}>Agent Builds</Link>
          <p className="text-xs font-semibold text-sage uppercase tracking-wide pt-2">Resources</p>
          <Link to="/what-things-are" className="block text-sm py-1 pl-3" onClick={() => setMobileOpen(false)}>What Things Are</Link>
          <Link to="/gdpr-ai-safety" className="block text-sm py-1 pl-3" onClick={() => setMobileOpen(false)}>GDPR & AI Safety</Link>
          <Link to="/authenticity-and-ai" className="block text-sm py-1 pl-3" onClick={() => setMobileOpen(false)}>Authenticity & AI</Link>
          <Link to="/environmental-impact" className="block text-sm py-1 pl-3" onClick={() => setMobileOpen(false)}>Environmental Impact</Link>
          <Link to="/tech-stack" className="block text-sm py-1 pl-3" onClick={() => setMobileOpen(false)}>My Tech Stack</Link>
          <Link to="/people-to-follow" className="block text-sm py-1 pl-3" onClick={() => setMobileOpen(false)}>People to Follow</Link>
          <Link to="/contact" className="block bg-sage text-white text-center px-5 py-2 rounded-lg text-sm font-medium mt-3" onClick={() => setMobileOpen(false)}>Book a Discovery Call</Link>
        </div>
      )}
    </nav>
  )
}
