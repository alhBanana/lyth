import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import SectionHeading from '../components/SectionHeading'
import { useStoryContext } from '../contexts/useStoryContext'
import { ApiError } from '../services/api'
import { collectionCategories } from '../utils/constants'

/**
 * Generates a URL-safe slug from a Collection name.
 */
const toSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  /**
   * Collection creation form for adding a new Library Collection.
   *
   * The form optionally links the created Collection to the active Story.
   */
export default function CreateCollection() {
  const navigate = useNavigate()
  const { story, createNewCollection } = useStoryContext()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [linkToStory, setLinkToStory] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const generatedSlug = toSlug(name)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setErrorMessage('')

    const trimmedName = name.trim()
    if (!trimmedName) {
      setErrorMessage('Collection name is required.')
      return
    }

    if (!generatedSlug) {
      setErrorMessage('Please enter a collection name that includes letters or numbers.')
      return
    }

    setIsSubmitting(true)
    try {
      const created = await createNewCollection({
        name: trimmedName,
        description: description.trim(),
        category: category || undefined,
        linkToStoryId: linkToStory ? story.id : undefined,
      })
      navigate(`/collections/${created.slug}`)
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Unable to create collection. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeading title="Create Collection" subtitle="Add a reusable Collection to your Library and optionally link it to your active Story." />

      <Card>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="collection-name" className="text-sm font-medium text-slate-800">
              Name
            </label>
            <input
              id="collection-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-[#D8D2C7] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#2F5D50]"
              placeholder="Running"
              maxLength={80}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="collection-description" className="text-sm font-medium text-slate-800">
              Description
            </label>
            <textarea
              id="collection-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-24 w-full rounded-xl border border-[#D8D2C7] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#2F5D50]"
              placeholder="Track training and progress over time."
              maxLength={240}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="collection-category" className="text-sm font-medium text-slate-800">
              Category (optional)
            </label>
            <select
              id="collection-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-[#D8D2C7] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#2F5D50]"
            >
              <option value="">No category</option>
              {collectionCategories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-[#E8E4DD] bg-[#FAF8F4] px-4 py-3 text-sm text-slate-700">
            <p className="font-medium text-slate-900">Slug</p>
            <p className="mt-1">{generatedSlug || 'A slug will be generated from the name.'}</p>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-[#E8E4DD] bg-white px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={linkToStory}
              onChange={(event) => setLinkToStory(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[#CBD5E1] text-[#2F5D50] focus:ring-[#2F5D50]"
            />
            <span>Link this Collection to {story.title}</span>
          </label>

          {errorMessage ? (
            <div className="rounded-xl border border-[#E6B9B9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8A2E2E]">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#2F5D50] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#264B40] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Saving...' : 'Save Collection'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/library')}
              className="rounded-xl border border-[#D8D2C7] px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#2F5D50] hover:text-[#2F5D50]"
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
