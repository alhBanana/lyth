import { Link } from 'react-router-dom'
import type { CollectionSummary } from '../types'

type CollectionCardProps = {
  collection: CollectionSummary
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link
      to={`/collections/${collection.id}`}
      className="group block rounded-[1.75rem] border border-[#E8E4DD] bg-white/95 p-5 transition hover:-translate-y-0.5 hover:border-[#2F5D50]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">{collection.title}</p>
          <p className="mt-3 text-base font-semibold text-slate-950">{collection.detail}</p>
        </div>
        <span className="rounded-full bg-[#F8F4EE] px-4 py-2 text-sm font-semibold text-[#B89162]">{collection.count}</span>
      </div>
    </Link>
  )
}
