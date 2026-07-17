import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { story as builtInStory } from '../data/story'
import { pages as initialPages } from '../data/pages'
import { tasks as initialTasks } from '../data/tasks'
import type { AppStory, EntityId, PageEntry, PageBookmark, PagePhoto, TaskEntry } from '../types'
import { createPageBookmark, createPagePhoto, createPageTask, fetchAppData, savePageNotes, savePageReflection, toggleTask } from '../services/api'

const STORAGE_KEYS = {
  pages: 'lyth-pages',
  tasks: 'lyth-tasks',
}

export const TODAY_PAGE_DATE = '2026-07-28'

const createPage = (date: string, storyId: string): PageEntry => ({
  id: Date.now(),
  date,
  storyId,
  notes: '',
  reflection: '',
  bookmarks: [],
  photos: [],
  tasks: [],
  running: '30-minute morning run with gentle recovery.',
  meals: 'Breakfast: porridge and berries. Lunch: grilled salmon salad. Dinner: roasted vegetables.',
  yoga: 'A gentle 20-minute stretch and breathing session.',
})

const parseStorage = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

const migratePageData = (pages: PageEntry[]): PageEntry[] => {
  return pages.map((page) => ({
    ...page,
    tasks: page.tasks || [],
    bookmarks: page.bookmarks || [],
    photos: page.photos || [],
  }))
}

type StoryContextValue = {
  story: AppStory
  pages: PageEntry[]
  tasks: TaskEntry[]
  progress: number
  updatePageNotes: (pageId: EntityId, notes: string) => void
  updatePageReflection: (pageId: EntityId, reflection: string) => void
  addPageBookmark: (pageId: EntityId, title: string) => void
  addPagePhoto: (pageId: EntityId) => void
  addPageTask: (pageId: EntityId, title: string) => void
  togglePageTask: (pageId: EntityId, taskId: EntityId) => void
  toggleTaskCompletion: (taskId: EntityId) => void
}

const StoryContext = createContext<StoryContextValue | undefined>(undefined)

export function StoryProvider({ children }: { children: ReactNode }) {
  const [story, setStory] = useState<AppStory>(builtInStory)
  const [pages, setPages] = useState<PageEntry[]>(() => {
    const stored = migratePageData(parseStorage<PageEntry[]>(window.localStorage.getItem(STORAGE_KEYS.pages), initialPages))
    if (!stored.some((page) => page.date === TODAY_PAGE_DATE && page.storyId === builtInStory.id)) {
      return [createPage(TODAY_PAGE_DATE, builtInStory.id), ...stored]
    }
    return stored
  })

  const [tasks, setTasks] = useState<TaskEntry[]>(() =>
    parseStorage<TaskEntry[]>(window.localStorage.getItem(STORAGE_KEYS.tasks), initialTasks),
  )

  useEffect(() => {
    const hydrate = async () => {
      try {
        const data = await fetchAppData()
        setStory(data.story)
        const hydratedPages = migratePageData(data.pages)
        if (!hydratedPages.some((page) => page.date === TODAY_PAGE_DATE && page.storyId === data.story.id)) {
          setPages([createPage(TODAY_PAGE_DATE, data.story.id), ...hydratedPages])
        } else {
          setPages(hydratedPages)
        }
        setTasks(data.tasks)
      } catch {
        // Keep existing local fallback state if API is unavailable.
      }
    }

    void hydrate()
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.pages, JSON.stringify(pages))
  }, [pages])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks))
  }, [tasks])

  const updatePageNotes = (pageId: EntityId, notes: string) => {
    setPages((previous) =>
      previous.map((page) => (page.id === pageId ? { ...page, notes } : page)),
    )

    if (typeof pageId === 'string') {
      void savePageNotes(pageId, notes)
    }
  }

  const updatePageReflection = (pageId: EntityId, reflection: string) => {
    setPages((previous) =>
      previous.map((page) => (page.id === pageId ? { ...page, reflection } : page)),
    )

    if (typeof pageId === 'string') {
      void savePageReflection(pageId, reflection)
    }
  }

  const addPageBookmark = (pageId: EntityId, title: string) => {
    const optimisticId = Date.now()
    const bookmark: PageBookmark = {
      id: optimisticId,
      title,
      createdAt: new Date().toISOString(),
    }
    setPages((previous) =>
      previous.map((page) =>
        page.id === pageId
          ? { ...page, bookmarks: [bookmark, ...page.bookmarks] }
          : page,
      ),
    )

    if (typeof pageId === 'string') {
      void createPageBookmark(pageId, title)
        .then((createdBookmark) => {
          setPages((previous) =>
            previous.map((page) =>
              page.id === pageId
                ? {
                    ...page,
                    bookmarks: page.bookmarks.map((item) =>
                      item.id === optimisticId ? createdBookmark : item,
                    ),
                  }
                : page,
            ),
          )
        })
        .catch(() => {
          // Keep optimistic local bookmark even if persistence fails.
        })
    }
  }

  const addPagePhoto = (pageId: EntityId) => {
    const optimisticId = Date.now()
    const photo: PagePhoto = {
      id: optimisticId,
      label: 'Today’s photo',
      source: 'placeholder',
    }
    setPages((previous) =>
      previous.map((page) =>
        page.id === pageId
          ? { ...page, photos: [photo, ...page.photos] }
          : page,
      ),
    )

    if (typeof pageId === 'string') {
      void createPagePhoto(pageId)
        .then((createdPhoto) => {
          setPages((previous) =>
            previous.map((page) =>
              page.id === pageId
                ? {
                    ...page,
                    photos: page.photos.map((item) =>
                      item.id === optimisticId ? createdPhoto : item,
                    ),
                  }
                : page,
            ),
          )
        })
        .catch(() => {
          // Keep optimistic local photo even if persistence fails.
        })
    }
  }

  const addPageTask = (pageId: EntityId, title: string) => {
    const optimisticId = Date.now()
    const task = {
      id: optimisticId,
      title,
      completed: false,
    }
    setPages((previous) =>
      previous.map((page) =>
        page.id === pageId
          ? { ...page, tasks: [task, ...page.tasks] }
          : page,
      ),
    )

    if (typeof pageId === 'string') {
      void createPageTask(pageId, title)
        .then((createdTask) => {
          setPages((previous) =>
            previous.map((page) =>
              page.id === pageId
                ? {
                    ...page,
                    tasks: page.tasks.map((item) =>
                      item.id === optimisticId
                        ? {
                            id: createdTask.id,
                            title: createdTask.title,
                            completed: createdTask.completed,
                          }
                        : item,
                    ),
                  }
                : page,
            ),
          )

          setTasks((previous) => {
            if (previous.some((item) => item.id === createdTask.id)) {
              return previous
            }
            return [createdTask, ...previous]
          })
        })
        .catch(() => {
          // Keep optimistic local task even if persistence fails.
        })
    }
  }

  const togglePageTask = (pageId: EntityId, taskId: EntityId) => {
    setPages((previous) =>
      previous.map((page) =>
        page.id === pageId
          ? {
              ...page,
              tasks: page.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, completed: !task.completed }
                  : task,
              ),
            }
          : page,
      ),
    )

    if (typeof taskId === 'string') {
      void toggleTask(taskId).then((updatedTask) => {
        setTasks((previous) =>
          previous.map((item) =>
            item.id === updatedTask.id
              ? { ...item, completed: updatedTask.completed }
              : item,
          ),
        )
      })
    }
  }

  const toggleTaskCompletion = (taskId: EntityId) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    )

    if (typeof taskId === 'string') {
      void toggleTask(taskId)
    }
  }

  const progress = useMemo(() => {
    const storyTasks = tasks.filter((task) => task.storyId === story.id)
    if (storyTasks.length === 0) return story.progress
    const completedCount = storyTasks.filter((task) => task.completed).length
    return Math.round((completedCount / storyTasks.length) * 100)
  }, [tasks, story.id, story.progress])

  return (
    <StoryContext.Provider
      value={{
        story,
        pages,
        tasks,
        progress,
        updatePageNotes,
        updatePageReflection,
        addPageBookmark,
        addPagePhoto,
        addPageTask,
        togglePageTask,
        toggleTaskCompletion,
      }}
    >
      {children}
    </StoryContext.Provider>
  )
}

export function useStoryContext() {
  const context = useContext(StoryContext)
  if (!context) {
    throw new Error('useStoryContext must be used within a StoryProvider')
  }
  return context
}
