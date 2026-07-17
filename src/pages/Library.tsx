import { Link } from 'react-router-dom'
import CollectionCard from '../components/CollectionCard'
import SectionHeading from '../components/SectionHeading'
import { useStoryContext } from '../contexts/StoryContext'

export default function Library() {
  const { collections } = useStoryContext()

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeading title="Library" subtitle="The permanent home of reusable Collections that support your Stories." />
        <Link
          to="/library/collections/new"
          className="rounded-xl bg-[#2F5D50] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#264B40]"
        >
          Create Collection
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
      <div className="rounded-[1.75rem] border border-[#E8E4DD] bg-white/95 p-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">Notes</p>
        <p className="mt-4 text-sm leading-7 text-slate-600">Collections live here once and can be linked to one or more Stories without duplication.</p>
      </div>
    </div>
  )
}
