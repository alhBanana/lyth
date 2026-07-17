/**
 * Navigation item rendered in the global shell sidebar.
 */
export type NavItem = {
  label: string
  to: string
  icon: string
}

/**
 * Generic identifier used by optimistic client state and persisted records.
 */
export type EntityId = string | number

/**
 * Active Story summary used across dashboard, hub, and API hydration payloads.
 */
export type AppStory = {
  id: string
  title: string
  subtitle: string
  description: string
  startDateId: string
  startDate: string
  targetDate: string
  age: number
  progress: number
  status: string
}

/**
 * A Chapter stage within a Story.
 */
export type ChapterEntry = {
  id: string
  storyId: string
  title: string
  description: string
  order: number
  startDate: string | null
  endDate: string | null
  status: string
}

/**
 * Compact card model for dashboard summary blocks.
 */
export type SummaryCard = {
  title: string
  subtitle: string
  value: string
  accent?: string
}

/**
 * Lightweight Story representation used in Story lists.
 */
export type StorySummary = {
  id: string
  title: string
  excerpt: string
  pages: number
  status: string
}

/**
 * Lightweight bookmark data for list-style bookmark sections.
 */
export type BookmarkSummary = {
  title: string
  due: string
  location: string
}

/**
 * Represents a Collection stored in the Library.
 *
 * Collections exist independently and may be linked to
 * zero, one, or many Stories.
 */
export type CollectionEntry = {
  id: string
  name: string
  slug: string
  description: string
  category?: string | null
}

/**
 * Join record linking a Story to a Collection.
 */
export type StoryCollectionLinkEntry = {
  id: string
  storyId: string
  collectionId: string
  linkedAt: string
}

/**
 * Rich Story view model used by detail and planning screens.
 */
export type StoryDetail = {
  id: string
  title: string
  excerpt: string
  pages: number
  milestones: number
  outcome: string
  description?: string
  progress?: number
  status?: string
  startDate?: string
  targetDate?: string
}

/**
 * Bookmark stored on a specific Page.
 */
export type PageBookmark = {
  id: EntityId
  title: string
  createdAt: string
}

/**
 * Photo metadata stored on a specific Page.
 */
export type PagePhoto = {
  id: EntityId
  label: string
  source: 'placeholder' | 'camera'
}

/**
 * A task item embedded inside a Page payload.
 */
export type PageTask = {
  id: EntityId
  title: string
  completed: boolean
}

/**
 * A single day within a Story.
 */
export type PageEntry = {
  id: EntityId
  date: string
  storyId: string
  chapterId?: string | null
  notes: string
  reflection: string
  bookmarks: PageBookmark[]
  photos: PagePhoto[]
  tasks: PageTask[]
  running: string
  meals: string
  yoga: string
}

/**
 * Persisted task model used for both story-level and page-level tasks.
 */
export type TaskEntry = {
  id: EntityId
  title: string
  completed: boolean
  storyId: string
  pageId?: string | null
}
