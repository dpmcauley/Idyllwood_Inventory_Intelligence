import React, { useState, useEffect } from 'react'
import { Menu, X, ArrowLeft } from 'lucide-react'
import { Logo } from './Logo'

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass-panel py-2.5' : 'bg-transparent py-3'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Logo onClick={() => window.location.href = 'https://idyllwoodlab.com'} />

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <span className="text-taupe-400 tracking-widest uppercase text-xs font-semibold">
            Inventory Intelligence
          </span>
          <a
            href="https://idyllwoodlab.com"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Idyllwood Lab
          </a>
        </div>

        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full glass-panel border-t border-white/10 p-6 flex flex-col gap-4">
          <a href="https://idyllwoodlab.com" className="flex items-center gap-2 text-gray-300 hover:text-white">
            <ArrowLeft size={14} />
            Back to Idyllwood Lab
          </a>
        </div>
      )}
    </nav>
  )
}
