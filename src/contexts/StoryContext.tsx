import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { story as builtInStory } from '../data/story'
import { pages as initialPages } from '../data/pages'
import { tasks as initialTasks } from '../data/tasks'
import type { AppStory, ChapterEntry, CollectionEntry, EntityId, PageEntry, PageBookmark, PagePhoto, StoryCollectionLinkEntry, TaskEntry } from '../types'
import { createCollection, createPageBookmark, createPagePhoto, createPageTask, fetchAppData, linkCollectionToStory, savePageNotes, savePageReflection, toggleTask, unlinkCollectionFromStory } from '../services/api'
import { getTodayLocalDateIdentifier } from '../utils/date'
import { StoryContext } from './story-context'

/**
 * Browser storage keys used for local fallback state persistence.
 */
const STORAGE_KEYS = {
  pages: 'lyth-pages',
  tasks: 'lyth-tasks',
}

/**
 * Creates an in-memory Page placeholder for the current local day.
 */
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

/**
 * Parses JSON from storage and falls back safely when storage is empty or invalid.
 */
const parseStorage = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

/**
 * Normalizes legacy page payloads to ensure required array fields exist.
 */
const migratePageData = (pages: PageEntry[]): PageEntry[] => {
  return pages.map((page) => ({
    ...page,
    tasks: page.tasks || [],
    bookmarks: page.bookmarks || [],
    photos: page.photos || [],
  }))
}

/**
 * Provides Story-scoped state and actions for Pages, Tasks, Bookmarks,
 * Photos, and Library Collection linking.
 */
export function StoryProvider({ children }: { children: ReactNode }) {
  const todayDateIdentifier = getTodayLocalDateIdentifier()

  const [story, setStory] = useState<AppStory>(builtInStory)
  const [chapters, setChapters] = useState<ChapterEntry[]>([])
  const [collections, setCollections] = useState<CollectionEntry[]>([])
  const [storyCollectionLinks, setStoryCollectionLinks] = useState<StoryCollectionLinkEntry[]>([])
  const [pages, setPages] = useState<PageEntry[]>(() => {
    const stored = migratePageData(parseStorage<PageEntry[]>(window.localStorage.getItem(STORAGE_KEYS.pages), initialPages))
    if (!stored.some((page) => page.date === todayDateIdentifier && page.storyId === builtInStory.id)) {
      return [createPage(todayDateIdentifier, builtInStory.id), ...stored]
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
        setChapters(data.chapters)
        setCollections(data.collections)
        setStoryCollectionLinks(data.storyCollectionLinks)
        const hydratedPages = migratePageData(data.pages)
        if (!hydratedPages.some((page) => page.date === todayDateIdentifier && page.storyId === data.story.id)) {
          setPages([createPage(todayDateIdentifier, data.story.id), ...hydratedPages])
        } else {
          setPages(hydratedPages)
        }
        setTasks(data.tasks)
      } catch {
        // Keep existing local fallback state if API is unavailable.
      }
    }

    void hydrate()
  }, [todayDateIdentifier])

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

  const createNewCollection = async (input: { name: string; description: string; category?: string; linkToStoryId?: string }) => {
    const result = await createCollection(input)
    setCollections((previous) => {
      if (previous.some((item) => item.id === result.collection.id)) {
        return previous
      }
      return [...previous, result.collection]
    })

    if (result.storyCollectionLink) {
      const createdLink = result.storyCollectionLink
      setStoryCollectionLinks((previous) => {
        if (previous.some((link) => link.id === createdLink.id)) {
          return previous
        }
        return [...previous, createdLink]
      })
    }

    return result.collection
  }

  const linkCollection = async (collectionId: string, storyId: string) => {
    const link = await linkCollectionToStory(collectionId, storyId)
    setStoryCollectionLinks((previous) => {
      if (previous.some((item) => item.storyId === link.storyId && item.collectionId === link.collectionId)) {
        return previous
      }
      return [...previous, link]
    })
  }

  const unlinkCollection = async (collectionId: string, storyId: string) => {
    await unlinkCollectionFromStory(collectionId, storyId)
    setStoryCollectionLinks((previous) =>
      previous.filter((item) => !(item.storyId === storyId && item.collectionId === collectionId)),
    )
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
        chapters,
        collections,
        storyCollectionLinks,
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
        createNewCollection,
        linkCollection,
        unlinkCollection,
      }}
    >
      {children}
    </StoryContext.Provider>
  )
}
