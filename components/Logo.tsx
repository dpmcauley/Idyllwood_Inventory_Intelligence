import React from 'react'
import { Terminal } from 'lucide-react'

interface LogoProps { className?: string; onClick?: () => void }

export const Logo: React.FC<LogoProps> = ({ className = '', onClick }) => (
  <div className={`flex items-center gap-2 group cursor-pointer select-none ${className}`} onClick={onClick}>
    <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center group-hover:border-taupe-400 transition-colors bg-slate-950/50 backdrop-blur-sm">
      <Terminal size={20} className="text-taupe-400" />
    </div>
    <div className="flex flex-col items-start">
      <span className="font-sans font-bold text-lg tracking-widest text-white uppercase leading-none">Idyllwood</span>
      <span className="font-sans text-[10px] tracking-[0.3em] text-gray-400 uppercase leading-none mt-1 pl-0.5">LAB</span>
    </div>
  </div>
)
