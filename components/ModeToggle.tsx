import React from 'react'
import { Upload } from 'lucide-react'

type Mode = 'demo' | 'upload'

interface Props {
  mode: Mode
  onDemo: () => void
  onUpload: (file: File) => void
  isLoading: boolean
}

export const ModeToggle: React.FC<Props> = ({ mode, onDemo, onUpload, isLoading }) => {
  const fileRef = React.useRef<HTMLInputElement>(null)

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onDemo}
        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
          mode === 'demo'
            ? 'bg-slate-700 text-white border border-white/10'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Sample Data
      </button>
      <button
        onClick={() => fileRef.current?.click()}
        disabled={isLoading}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
          mode === 'upload'
            ? 'bg-taupe-400 text-slate-900 font-bold'
            : 'bg-taupe-400/20 text-taupe-400 hover:bg-taupe-400/30'
        } disabled:opacity-50`}
      >
        <Upload size={12} />
        {isLoading ? 'Analyzing...' : 'Upload CSV'}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])}
      />
    </div>
  )
}
