import React from 'react'
import { Logo } from './Logo'

export const Footer: React.FC = () => (
  <footer className="bg-slate-900 border-t border-white/5 mt-20 py-12">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-8">
      <div>
        <Logo />
        <p className="text-slate-500 text-sm mt-3 max-w-xs">Ideas Worth Amplifying.</p>
      </div>
      <div className="text-sm text-slate-500 space-y-2">
        <p className="text-slate-400 font-medium">Inventory Intelligence</p>
        <p>A tool by <a href="https://idyllwoodlab.com" className="text-taupe-400 hover:text-white transition-colors">Idyllwood Lab</a></p>
        <a href="/sample-template.csv" download className="block hover:text-white transition-colors">Download CSV Template</a>
      </div>
    </div>
  </footer>
)
