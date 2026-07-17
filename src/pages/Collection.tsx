import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Card from '../components/Card'
import SectionHeading from '../components/SectionHeading'
import { useStoryContext } from '../contexts/useStoryContext'
import { ApiError } from '../services/api'

/**
 * Displays a single Library Collection identified by slug.
 *
 * From this page, the user can link or unlink the Collection from
 * the active Story without duplicating Collection records.
 */
export default function Collection() {
  const { id } = useParams()
  const { story, collections, storyCollectionLinks, linkCollection, unlinkCollection } = useStoryContext()
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const collection = useMemo(() => {
    return collections.find((item) => item.slug === id)
  }, [id, collections])

  const isLinkedToActiveStory = useMemo(() => {
    if (!collection) return false
    return storyCollectionLinks.some(
      (link) => link.collectionId === collection.id && link.storyId === story.id,
    )
  }, [collection, storyCollectionLinks, story.id])

  const linkedStories = useMemo(() => {
    if (!collection) return []
    if (!isLinkedToActiveStory) return []
    return [story]
  }, [collection, isLinkedToActiveStory, story])

  /**
   * Toggles the Collection link to the active Story.
   */
  const toggleActiveStoryLink = async () => {
    if (!collection) return

    setIsSaving(true)
    setErrorMessage('')
    try {
      if (isLinkedToActiveStory) {
        await unlinkCollection(collection.id, story.id)
      } else {
        await linkCollection(collection.id, story.id)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Unable to update story link. Please try again.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (!collection) {
    return (
      <div className="space-y-6">
        <SectionHeading title="Collection not found" subtitle="Choose a collection from the current story hub." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <SectionHeading title={collection.name} subtitle={collection.description || 'Reusable collection'} />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">Overview</p>
            <p className="text-sm leading-7 text-slate-600">
              This collection is a focused workspace for {collection.name.toLowerCase()}, including practical notes and progress signals.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-[#F8F5EF] p-4 text-sm font-medium text-slate-950">Slug · {collection.slug}</div>
              <div className="rounded-[1.5rem] bg-[#F8F5EF] p-4 text-sm font-medium text-slate-950">Focus · {collection.name}</div>
              <div className="rounded-[1.5rem] bg-[#F8F5EF] p-4 text-sm font-medium text-slate-950 sm:col-span-2">
                Category · {collection.category || 'None'}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">Story links</p>
          <div className="mt-5 space-y-4">
            <button
              type="button"
              onClick={() => void toggleActiveStoryLink()}
              disabled={isSaving}
              className="w-full rounded-xl bg-[#2F5D50] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#264B40] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLinkedToActiveStory ? `Unlink from ${story.title}` : `Link to ${story.title}`}
            </button>

            {errorMessage ? (
              <div className="rounded-xl border border-[#E6B9B9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8A2E2E]">
                {errorMessage}
              </div>
            ) : null}

            {linkedStories.length === 0 ? (
              <div className="rounded-[1.5rem] bg-[#FAF8F4] p-5 text-sm leading-7 text-slate-600">
                This collection is not linked to any Stories yet.
              </div>
            ) : (
              <div className="space-y-3">
                {linkedStories.map((linkedStory) => (
                  <div
                    key={linkedStory.id}
                    className="rounded-[1.5rem] border border-[#E8E4DD] bg-white p-4 text-sm text-slate-700"
                  >
                    {linkedStory.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
