import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Card from '../components/Card'
import FeatureSection from '../components/FeatureSection'
import PageCard from '../components/PageCard'
import SectionHeading from '../components/SectionHeading'
import TaskList from '../components/TaskList'
import { useStoryContext } from '../contexts/StoryContext'
import { formatDateIdentifierFriendly, getStoryPageNumber, getTodayLocalDateIdentifier } from '../utils/date'

export default function Diary() {
  const location = useLocation()
  const state = location.state as { storyId?: string } | null
  const {
    story,
    pages,
    tasks,
    updatePageNotes,
    updatePageReflection,
    addPageBookmark,
    addPagePhoto,
    addPageTask,
    togglePageTask,
    toggleTaskCompletion,
  } = useStoryContext()
  const todayDateIdentifier = getTodayLocalDateIdentifier()

  const currentStory = state?.storyId === story.id ? story : story

  const today = useMemo(
    () => pages.find((page) => page.storyId === story.id && page.date === todayDateIdentifier) ?? pages[0],
    [pages, story.id, todayDateIdentifier],
  )

  const [notes, setNotes] = useState(today?.notes ?? '')
  const [reflection, setReflection] = useState(today?.reflection ?? '')
  const [bookmarkText, setBookmarkText] = useState('')
  const [newTaskText, setNewTaskText] = useState('')

  const storyTasks = useMemo(
    () => tasks.filter((task) => task.storyId === story.id && !task.pageId),
    [tasks, story.id],
  )

  useEffect(() => {
    setNotes(today?.notes ?? '')
    setReflection(today?.reflection ?? '')
  }, [today?.notes, today?.reflection])

  const formattedDate = useMemo(() => {
    if (!today) return ''
    return formatDateIdentifierFriendly(today.date)
  }, [today])

  const pageNumber = useMemo(() => {
    if (!today) return null
    return getStoryPageNumber(today.date, story.startDateId)
  }, [today, story.startDateId])

  const handleSaveNotes = () => {
    if (today) {
      updatePageNotes(today.id, notes)
    }
  }

  const handleSaveReflection = () => {
    if (today) {
      updatePageReflection(today.id, reflection)
    }
  }

  const handleAddBookmark = () => {
    if (!today || !bookmarkText.trim()) return
    addPageBookmark(today.id, bookmarkText.trim())
    setBookmarkText('')
  }

  const handleAddPhoto = () => {
    if (!today) return
    addPagePhoto(today.id)
  }

  const handleAddPageTask = () => {
    if (!today || !newTaskText.trim()) return
    addPageTask(today.id, newTaskText.trim())
    setNewTaskText('')
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        title="Today's Page"
        subtitle={currentStory ? `A day within ${currentStory.title}` : 'Open the page for your current story.'}
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <PageCard title="Date" subtitle={today?.date ?? 'No date'} value={formattedDate || 'No date available'} />
            <PageCard
              title="Current Story"
              subtitle={pageNumber ? `Page ${pageNumber}` : 'Pre-Story test page'}
              value={currentStory.title}
            />
          </div>

          <FeatureSection title="Tasks" subtitle="Tick tasks complete as you move through the day.">
            <div className="space-y-4">
              {storyTasks.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#2F5D50]/80">Story Tasks</p>
                  <TaskList tasks={storyTasks} onToggle={toggleTaskCompletion} />
                </div>
              )}
              {today?.tasks.length ? (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#2F5D50]/80">Today's Custom Tasks</p>
                  <div className="space-y-3">
                    {today.tasks.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => togglePageTask(today.id, task.id)}
                        className="flex w-full items-center justify-between rounded-[1.5rem] border border-[#E8E4DD] bg-white p-4 text-left text-sm text-slate-700 transition hover:border-[#2F5D50]"
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              task.completed ? 'border-[#2F5D50] bg-[#2F5D50]' : 'border-[#CBD5E1] bg-white'
                            }`}
                          >
                            {task.completed ? '✓' : ''}
                          </span>
                          {task.title}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#2F5D50]/80">
                          {task.completed ? 'Done' : 'Todo'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={newTaskText}
                  onChange={(event) => setNewTaskText(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && handleAddPageTask()}
                  className="min-w-0 flex-1 rounded-[1.25rem] border border-[#E8E4DD] bg-white p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#2F5D50] focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/10"
                  placeholder="Add a task for today"
                />
                <button
                  type="button"
                  onClick={handleAddPageTask}
                  className="rounded-xl bg-[#2F5D50] px-5 py-3 text-sm font-semibold text-white hover:bg-[#264B40] transition"
                >
                  Add task
                </button>
              </div>
            </div>
          </FeatureSection>

          <div className="grid gap-6 lg:grid-cols-3">
            <FeatureSection title="Running" subtitle="A quick record of today’s movement.">
              <p className="text-sm leading-7 text-slate-600">{today?.running || 'No run details yet.'}</p>
            </FeatureSection>
            <FeatureSection title="Meals" subtitle="What supported your energy today.">
              <p className="text-sm leading-7 text-slate-600">{today?.meals || 'No meals recorded yet.'}</p>
            </FeatureSection>
            <FeatureSection title="Yoga" subtitle="A simple practice to stay present.">
              <p className="text-sm leading-7 text-slate-600">{today?.yoga || 'No yoga notes yet.'}</p>
            </FeatureSection>
          </div>

          <FeatureSection title="Notes" subtitle="Capture the day’s key details and simple reminders.">
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={8}
              className="mt-4 w-full rounded-[1.25rem] border border-[#E8E4DD] bg-white p-4 text-sm leading-6 text-slate-700 placeholder:text-slate-400 focus:border-[#2F5D50] focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/10"
              placeholder="Record practical details about today."
            />
            <button
              type="button"
              onClick={handleSaveNotes}
              className="mt-4 rounded-xl bg-[#2F5D50] px-6 py-3 text-sm font-semibold text-white hover:bg-[#264B40] transition"
            >
              Save notes
            </button>
          </FeatureSection>

          <FeatureSection title="Reflection" subtitle="Note what felt most helpful or important today.">
            <textarea
              value={reflection}
              onChange={(event) => setReflection(event.target.value)}
              rows={6}
              className="mt-4 w-full rounded-[1.25rem] border border-[#E8E4DD] bg-white p-4 text-sm leading-6 text-slate-700 placeholder:text-slate-400 focus:border-[#2F5D50] focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/10"
              placeholder="Write a few lines about today’s progress and insight."
            />
            <button
              type="button"
              onClick={handleSaveReflection}
              className="mt-4 rounded-xl bg-[#2F5D50] px-6 py-3 text-sm font-semibold text-white hover:bg-[#264B40] transition"
            >
              Save reflection
            </button>
          </FeatureSection>

          <div className="grid gap-6 lg:grid-cols-2">
            <FeatureSection title="Bookmarks" subtitle="Save memorable moments from today.">
              <div className="space-y-4">
                {today?.bookmarks.length ? (
                  <div className="space-y-3">
                    {today.bookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id}
                        className="rounded-[1.5rem] border border-[#E8E4DD] bg-[#F8F5EF] p-4 text-sm text-slate-700"
                      >
                        {bookmark.title}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] bg-[#FAF8F4] p-4 text-sm leading-7 text-slate-600">
                    No bookmarks yet. Add a memorable detail from today.
                  </div>
                )}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={bookmarkText}
                    onChange={(event) => setBookmarkText(event.target.value)}
                    className="min-w-0 flex-1 rounded-[1.25rem] border border-[#E8E4DD] bg-white p-3 text-sm text-slate-700 focus:border-[#2F5D50] focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/10"
                    placeholder="Add a new bookmark"
                  />
                  <button
                    type="button"
                    onClick={handleAddBookmark}
                    className="rounded-xl bg-[#2F5D50] px-5 py-3 text-sm font-semibold text-white hover:bg-[#264B40] transition"
                  >
                    Add bookmark
                  </button>
                </div>
              </div>
            </FeatureSection>

            <FeatureSection title="Photos" subtitle="Add a placeholder photo for today’s page.">
              <div className="grid grid-cols-3 gap-3">
                {today?.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="flex h-24 flex-col items-center justify-center rounded-[1.5rem] border border-[#E8E4DD] bg-[#F8F5EF] p-3 text-center text-sm text-slate-700"
                  >
                    <span className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg text-slate-700">
                      📷
                    </span>
                    {photo.label}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="flex h-24 items-center justify-center rounded-[1.5rem] border border-dashed border-[#CBD5E1] bg-white/80 text-sm font-semibold text-slate-700 transition hover:border-[#2F5D50] hover:text-[#2F5D50]"
                >
                  + Add photo
                </button>
              </div>
            </FeatureSection>
          </div>
        </div>

        <aside className="space-y-6">
          <Card>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">Story summary</p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>{currentStory.description}</p>
              <div className="rounded-[1.5rem] bg-[#FAF8F4] p-4 text-sm text-slate-700">
                <p><strong>Status:</strong> {currentStory.status}</p>
                <p className="mt-2"><strong>Target:</strong> {currentStory.targetDate}</p>
              </div>
            </div>
          </Card>

          <Card>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">Day overview</p>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <p>{today?.notes ? 'You have notes saved for today.' : 'Start by capturing today’s most important details.'}</p>
              <p>{today?.reflection ? 'Reflection is saved for this page.' : 'Use reflection to close the day with clarity.'}</p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
