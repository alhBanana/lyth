import { createContext } from 'react'
import type {
  AppStory,
  ChapterEntry,
  CollectionEntry,
  EntityId,
  PageEntry,
  StoryCollectionLinkEntry,
  TaskEntry,
} from '../types'

/**
 * Public interface exposed by StoryContext.
 *
 * This contract centralizes Story state, Page state, and Collection linking
 * actions used throughout the app shell.
 */
export type StoryContextValue = {
  story: AppStory
  chapters: ChapterEntry[]
  collections: CollectionEntry[]
  storyCollectionLinks: StoryCollectionLinkEntry[]
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
  createNewCollection: (input: {
    name: string
    description: string
    category?: string
    linkToStoryId?: string
  }) => Promise<CollectionEntry>
  linkCollection: (collectionId: string, storyId: string) => Promise<void>
  unlinkCollection: (collectionId: string, storyId: string) => Promise<void>
}

/**
 * React context carrying Story-oriented app state and actions.
 */
export const StoryContext = createContext<StoryContextValue | undefined>(undefined)
