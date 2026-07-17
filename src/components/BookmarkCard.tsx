import type { BookmarkSummary } from '../types'

type BookmarkCardProps = {
  bookmark: BookmarkSummary
}

export default function BookmarkCard({ bookmark }: BookmarkCardProps) {
  return (
    <div className="rounded-[1.75rem] border border-[#E8E4DD] bg-white/95 p-5">
      <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
        <span>{bookmark.due}</span>
        <span className="rounded-full bg-[#F3EFE9] px-3 py-1 text-xs font-semibold text-[#B89162]">Bookmark</span>
      </div>
      <h3 className="mt-3 text-base font-semibold text-slate-950">{bookmark.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{bookmark.location}</p>
    </div>
  )
}
