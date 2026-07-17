import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '../components/Card'
import SectionHeading from '../components/SectionHeading'
import PageCard from '../components/PageCard'
import CollectionCard from '../components/CollectionCard'
import { useStoryContext } from '../contexts/useStoryContext'
import { formatDateIdentifierFriendly, getStoryPageNumber, getTodayLocalDateIdentifier } from '../utils/date'

/**
 * Story hub page showing chapter progress, Today's Page, and linked Collections.
 */
export default function Story() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { story, chapters, collections, storyCollectionLinks, pages, progress, tasks, toggleTaskCompletion } = useStoryContext()
  const todayDateIdentifier = getTodayLocalDateIdentifier()

  const currentStory = useMemo(() => {
    if (id === story.id) return story
    return null
  }, [id, story])

  if (!currentStory) {
    return (
      <div className="space-y-6">
        <SectionHeading title="Story not found" subtitle="Choose a story from the list and continue." />
      </div>
    )
  }

  const todayPage = pages.find((page) => page.storyId === currentStory.id && page.date === todayDateIdentifier)
  const todayPageNumber = todayPage ? getStoryPageNumber(todayPage.date, currentStory.startDateId) : null
  const linkedCollections = collections.filter((collection) =>
    storyCollectionLinks.some(
      (link) => link.storyId === currentStory.id && link.collectionId === collection.id,
    ),
  )

  return (
    <div className="space-y-8">
      <SectionHeading title={currentStory.title} subtitle={currentStory.subtitle} />

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <Card className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">Story overview</p>
              <p className="text-sm leading-7 text-slate-600">{story.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-[#F8F5EF] p-4 text-sm font-medium text-slate-950">Status · {currentStory.status}</div>
              <div className="rounded-[1.5rem] bg-[#F8F5EF] p-4 text-sm font-medium text-slate-950">Progress · {progress}%</div>
              <div className="rounded-[1.5rem] bg-[#F8F5EF] p-4 text-sm font-medium text-slate-950">Started · {currentStory.startDate}</div>
              <div className="rounded-[1.5rem] bg-[#F8F5EF] p-4 text-sm font-medium text-slate-950">Target · {currentStory.targetDate}</div>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <p>Use this hub to review your current plan, open today’s page, and keep the right collections close at hand.</p>
            </div>

            <div>
              <button
                onClick={() => navigate('/diary', { state: { storyId: currentStory.id } })}
                className="rounded-xl bg-[#2F5D50] px-6 py-3 text-white hover:bg-[#264B40] transition"
              >
                Continue Story
              </button>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">Today's Page</p>
                <p className="mt-3 text-sm text-slate-600">Review or add notes for today’s progress.</p>
              </div>
            </div>
            <div className="mt-5">
              {todayPage ? (
                <PageCard
                  title={formatDateIdentifierFriendly(todayPage.date)}
                  subtitle={todayPageNumber ? `Page ${todayPageNumber}` : 'Pre-Story test page'}
                  value={todayPage.notes || 'Open your notes'}
                />
              ) : (
                <div className="rounded-[1.5rem] bg-[#FAF8F4] p-5 text-sm leading-7 text-slate-600">No page is available for today yet.</div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">Action plan</p>
            <div className="mt-5 space-y-3">
              {tasks.filter((task) => task.storyId === currentStory.id && !task.pageId).map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => toggleTaskCompletion(task.id)}
                  className="flex w-full items-center justify-between rounded-[1.5rem] border border-[#E8E4DD] bg-white p-4 text-left text-sm text-slate-700 transition hover:border-[#2F5D50]"
                >
                  <span className="flex items-center gap-3">
                    <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${task.completed ? 'border-[#2F5D50] bg-[#2F5D50]' : 'border-[#CBD5E1] bg-white'}`}>
                      {task.completed ? '✓' : ''}
                    </span>
                    {task.title}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#2F5D50]/80">
                    {task.completed ? 'Done' : 'Todo'}
                  </span>
                </button>
              ))}
              {tasks.filter((task) => task.storyId === currentStory.id && !task.pageId).length === 0 ? (
                <div className="rounded-[1.5rem] bg-[#FAF8F4] p-4 text-sm leading-7 text-slate-600">
                  No actions have been added to this story yet.
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">Chapters</p>
            <div className="mt-5">
              {chapters.length === 0 ? (
                <div className="rounded-[1.5rem] bg-[#FAF8F4] p-5 text-sm leading-7 text-slate-600">
                  <p>No Chapters yet.</p>
                  <p>Chapters are the stages that shape your Story.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="rounded-[1.5rem] border border-[#E8E4DD] bg-white p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#2F5D50]/80">
                        Stage {chapter.order}
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-900">{chapter.title}</p>
                      {chapter.description ? (
                        <p className="mt-1 text-sm text-slate-600">{chapter.description}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">Collections</p>
            <div className="mt-5 space-y-4">
              {linkedCollections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
              {linkedCollections.length === 0 ? (
                <div className="rounded-[1.5rem] bg-[#FAF8F4] p-4 text-sm leading-7 text-slate-600">
                  No collections are linked to this story yet.
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">Recent Bookmarks</p>
            <div className="mt-5 rounded-[1.5rem] border border-dashed border-[#E8E4DD] bg-[#FAF8F4] p-8 text-center text-sm leading-7 text-slate-600">
              No bookmarks yet. Add a milestone or highlight to keep this section active.
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
