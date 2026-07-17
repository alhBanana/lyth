import SectionHeading from '../components/SectionHeading'
import StoryCard from '../components/StoryCard'
import { storySummaries } from '../utils/constants'

export default function Stories() {
  return (
    <div className="space-y-8">
      <SectionHeading title="Stories" subtitle="Browse your current journeys and active plans." />
      <div className="grid gap-6 lg:grid-cols-2">
        {storySummaries.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  )
}
