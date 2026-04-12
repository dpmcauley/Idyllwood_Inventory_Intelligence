import React, { useState, useRef, useEffect } from 'react'
import { Menu, X, ArrowLeft, ChevronDown } from 'lucide-react'
import { Logo } from './Logo'

const TOOLS = [
  { label: "Buyer's Dashboard", href: "https://inventory.idyllwoodlab.com", live: true, id: "buyers" },
  { label: "Spend Analytics", href: "https://spend.idyllwoodlab.com", live: true, id: "spend" },
  { label: "Inventory Intelligence", href: "https://intelligence.idyllwoodlab.com", live: true, id: "inventory" },
  { label: "Claude Workflows", href: "https://walkthroughs.idyllwoodlab.com", live: true, id: "walkthroughs" },
  { label: "Demand Signal", href: null, live: false, id: "demand" },
]
const CURRENT_TOOL = "inventory"

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const toolsRef = useRef<HTMLDivElement>(null)
  const [toolsOpen, setToolsOpen] = useState(false)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/90 backdrop-blur-md border-b border-white/5 py-3">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Logo onClick={() => window.location.href = 'https://idyllwoodlab.com'} />

        <div className="hidden md:flex items-center gap-4 text-sm font-medium">
          {/* Tools Dropdown */}
          <div className="relative" ref={toolsRef}>
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-taupe-400 transition-colors px-3 py-1.5 rounded-md border border-slate-800 hover:border-taupe-500/30 bg-slate-900"
            >
              Tools
              <ChevronDown size={12} className={`transition-transform duration-150 ${toolsOpen ? 'rotate-180' : ''}`} />
            </button>
            {toolsOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-50 py-1.5 overflow-hidden">
                {TOOLS.map((tool) =>
                  tool.href ? (
                    <a
                      key={tool.id}
                      href={tool.href}
                      className={`flex items-center justify-between px-4 py-2.5 text-xs transition-colors hover:bg-slate-800/60 ${tool.id === CURRENT_TOOL ? 'text-taupe-400' : 'text-slate-300 hover:text-white'}`}
                      onClick={() => setToolsOpen(false)}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                        {tool.label}
                      </span>
                      {tool.id === CURRENT_TOOL && <span className="text-[9px] font-bold uppercase tracking-wider text-taupe-500">here</span>}
                    </a>
                  ) : (
                    <div key={tool.id} className="flex items-center justify-between px-4 py-2.5 text-xs text-slate-600 cursor-default">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50 flex-shrink-0" />
                        {tool.label}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600/60">soon</span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-950/95 backdrop-blur-md border-t border-white/10 p-6 flex flex-col gap-4">
          <a href="https://idyllwoodlab.com" className="flex items-center gap-2 text-gray-300 hover:text-white">
            <ArrowLeft size={14} />
            Back to Idyllwood Lab
          </a>
          <div className="border-t border-white/10 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-3">Tools</p>
            {TOOLS.map((tool) =>
              tool.href ? (
                <a
                  key={tool.id}
                  href={tool.href}
                  className={`flex items-center gap-2 py-2 text-sm transition-colors ${tool.id === CURRENT_TOOL ? 'text-taupe-400' : 'text-gray-300 hover:text-white'}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  {tool.label}
                  {tool.id === CURRENT_TOOL && <span className="text-[9px] font-bold uppercase tracking-wider text-taupe-500 ml-auto">here</span>}
                </a>
              ) : (
                <div key={tool.id} className="flex items-center gap-2 py-2 text-sm text-slate-600 cursor-default">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50 flex-shrink-0" />
                  {tool.label}
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600/60 ml-auto">soon</span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
