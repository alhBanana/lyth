import type { PropsWithChildren } from 'react'

export default function Card({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`rounded-[1.75rem] border border-[#E8E4DD] bg-white/95 p-5 shadow-sm shadow-slate-200/40 ${className}`}>
      {children}
    </div>
  )
}
