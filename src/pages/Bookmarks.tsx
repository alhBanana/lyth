import BookmarkCard from '../components/BookmarkCard'
import SectionHeading from '../components/SectionHeading'
import { bookmarkSummaries } from '../utils/constants'

export default function Bookmarks() {
  return (
    <div className="space-y-8">
      <SectionHeading title="Bookmarks" subtitle="Track highlights and story reminders in one place." />
      <div className="grid gap-6 lg:grid-cols-2">
        {bookmarkSummaries.map((bookmark) => (
          <BookmarkCard key={bookmark.title} bookmark={bookmark} />
        ))}
      </div>
      <div className="rounded-[1.75rem] border border-[#E8E4DD] bg-[#F8F5EF] p-6 text-slate-600">
        <p className="font-medium text-[#2F5D50]/90">No more bookmarks for now.</p>
        <p className="mt-3 text-sm leading-7">These placeholders keep your story reminders visible while you move between pages.</p>
      </div>
    </div>
  )
}
