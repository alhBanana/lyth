export default function TopBar() {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-[#E8E4DD] bg-white/95 p-5 shadow-sm shadow-slate-200/20 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#2F5D50]/90">Good morning</p>
        <h2 className="text-xl font-semibold text-slate-950">Continue your practice.</h2>
      </div>
      <div className="inline-flex items-center gap-3 rounded-full border border-[#E8E4DD] bg-[#FAF8F4] px-4 py-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2F5D50] text-sm font-semibold text-white">LY</div>
        <div>
          <p className="text-sm font-semibold text-slate-950">Lyth Creator</p>
          <p className="text-xs text-slate-500">Profile avatar placeholder</p>
        </div>
      </div>
    </div>
  )
}
