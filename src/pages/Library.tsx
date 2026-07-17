import CollectionCard from '../components/CollectionCard'
import SectionHeading from '../components/SectionHeading'
import { collections } from '../utils/constants'

export default function Library() {
  return (
    <div className="space-y-8">
      <SectionHeading title="Library" subtitle="Your reference collection for story ideas and world building." />
      <div className="grid gap-6 lg:grid-cols-3">
        {collections.map((collection) => (
          <CollectionCard key={collection.title} collection={collection} />
        ))}
      </div>
      <div className="rounded-[1.75rem] border border-[#E8E4DD] bg-white/95 p-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">Notes</p>
        <p className="mt-4 text-sm leading-7 text-slate-600">A minimal library keeps your ideas easy to find. This shell is ready for the next layer of reading lists and story assets.</p>
      </div>
    </div>
  )
}
