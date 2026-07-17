import SectionHeading from '../components/SectionHeading'
import StoryCard from '../components/StoryCard'
import { useStoryContext } from '../contexts/useStoryContext'

/**
 * Displays the user's Stories.
 *
 * Story data is provided by StoryContext and ultimately loaded from
 * Lyth's local SQLite database. Using persisted Story data here ensures
 * that Story cards link to the real database-backed Story IDs rather
 * than legacy static or mock IDs.
 *
 * @returns The Stories overview page.
 */
export default function Stories() {
  const { story } = useStoryContext()

  return (
    <div className="space-y-8">
      <SectionHeading
        title="Stories"
        subtitle="Browse your current journeys and active plans."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <StoryCard
          key={story.id}
          story={story}
        />
      </div>
    </div>
  )
}