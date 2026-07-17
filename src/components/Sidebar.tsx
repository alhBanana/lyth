import Navigation from './Navigation'
import { navItems } from '../utils/constants'

export default function Sidebar() {
  return (
    <aside className="sticky top-0 z-20 w-full border-b border-[#E8E4DD] bg-[#FAF8F4] p-4 lg:h-screen lg:max-w-[280px] lg:border-b-0 lg:border-r lg:p-6">
      <div className="mb-6 space-y-3 lg:mb-8">
        <div className="inline-flex items-center gap-3 rounded-3xl border border-[#E8E4DD] bg-white/95 px-4 py-3 text-lg font-semibold text-[#2F5D50]">
          <span className="rounded-full bg-[#2F5D50] px-3 py-2 text-sm text-white">lyth</span>
          <span>Paper</span>
        </div>
        <p className="max-w-[220px] text-sm leading-6 text-slate-600">one page at a time.</p>
      </div>

      <Navigation items={navItems} />
    </aside>
  )
}
