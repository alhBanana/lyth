import { Link } from 'react-router-dom'
import type { StorySummary } from '../types'

type StoryCardProps = {
  story: StorySummary
}

export default function StoryCard({ story }: StoryCardProps) {
  return (
    <Link to={`/stories/${story.id}`} className="group block rounded-[1.75rem] border border-[#E8E4DD] bg-white/95 p-5 transition hover:-translate-y-0.5 hover:border-[#2F5D50]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{story.status}</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">{story.title}</h3>
        </div>
        <span className="rounded-full bg-[#E9F1EE] px-3 py-1 text-xs font-semibold text-[#2F5D50]">{story.pages} pages</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{story.excerpt}</p>
    </Link>
  )
}
