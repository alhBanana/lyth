import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import PageCard from '../components/PageCard'
import SectionHeading from '../components/SectionHeading'
import WeatherWidget from '../components/WeatherWidget'
import { TODAY_PAGE_DATE, useStoryContext } from '../contexts/StoryContext'

export default function Dashboard() {
  const navigate = useNavigate()
  const { story, pages, tasks } = useStoryContext()

  const todayPage = useMemo(() => {
    return pages.find((page) => page.storyId === story.id && page.date === TODAY_PAGE_DATE)
  }, [pages, story.id])

  const taskSummary = useMemo(() => {
    const storyTasks = tasks.filter((task) => task.storyId === story.id && !task.pageId)
    const completedTasks = storyTasks.filter((task) => task.completed).length
    return { completed: completedTasks, total: storyTasks.length }
  }, [tasks, story.id])

  return (
    <div className="space-y-8">
      <SectionHeading
        title="Dashboard"
        subtitle="The hub for your current goal, daily page, and progress overview."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <PageCard
              title="Current Story"
              subtitle={story.subtitle}
              value={story.title}
            />
            <button
              type="button"
              onClick={() => navigate('/diary', { state: { storyId: story.id } })}
              className="text-left"
            >
              <div className="rounded-[1.5rem] border border-[#E8E4DD] bg-[#F8F5EF] p-5">
                <p className="text-sm font-medium text-[#2F5D50]/95">Today's Page</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">
                  {taskSummary.completed} of {taskSummary.total} tasks
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {todayPage?.notes ? 'Notes saved for today' : 'No notes yet.'}
                </p>
              </div>
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
            <div className="rounded-[1.75rem] border border-[#E8E4DD] bg-[#F8F5EF] p-6">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">
                Current Story
              </p>

              <h2 className="mt-4 text-2xl font-semibold text-slate-950">
                {story.title}
              </h2>

              <p className="mt-2 text-lg text-slate-600">
                {story.subtitle}
              </p>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {story.description}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-white p-4 text-sm font-medium text-slate-950">Status · {story.status}</div>
                <div className="rounded-[1.5rem] bg-white p-4 text-sm font-medium text-slate-950">Progress · {story.progress}%</div>
                <div className="rounded-[1.5rem] bg-white p-4 text-sm font-medium text-slate-950">Started · {story.startDate}</div>
                <div className="rounded-[1.5rem] bg-white p-4 text-sm font-medium text-slate-950">Target · {story.targetDate}</div>
              </div>

              <button
                onClick={() => navigate(`/stories/${story.id}`)}
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#2F5D50] px-6 py-3 text-white hover:bg-[#264B40] transition"
              >
                Continue Story
              </button>
            </div>

            <WeatherWidget />
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">
              Bookmarks
            </p>
            <div className="mt-6 rounded-2xl border border-dashed border-[#E8E4DD] p-6 text-center text-slate-500">
              No bookmarks yet. Your milestones will appear here as you add them.
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
