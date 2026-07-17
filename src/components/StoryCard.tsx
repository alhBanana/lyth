import { Link } from 'react-router-dom'
import type { AppStory } from '../types'

/**
 * Props for the StoryCard component.
 */
type StoryCardProps = {
  /** The persisted Story to display. */
  story: AppStory
}

/**
 * Displays a summary card for a Story and links to its detail page.
 *
 * The Story ID comes from the persisted database record, ensuring
 * navigation uses the real Prisma-generated ID rather than a legacy
 * static or mock Story ID.
 *
 * @param props - The component props.
 * @param props.story - The Story to display.
 * @returns A clickable card linking to the Story detail page.
 */
export default function StoryCard({ story }: StoryCardProps) {
  return (
    <Link
      to={`/stories/${story.id}`}
      className="group block rounded-[1.75rem] border border-[#E8E4DD] bg-white/95 p-5 transition hover:-translate-y-0.5 hover:border-[#2F5D50]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            {story.status}
          </p>

          <h3 className="mt-2 text-lg font-semibold text-slate-950">
            {story.title}
          </h3>
        </div>

        <span className="rounded-full bg-[#E9F1EE] px-3 py-1 text-xs font-semibold text-[#2F5D50]">
          {story.progress}% complete
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        {story.description}
      </p>
    </Link>
  )
}