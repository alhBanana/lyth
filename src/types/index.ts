export type NavItem = {
  label: string
  to: string
  icon: string
}

export type EntityId = string | number

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

export type SummaryCard = {
  title: string
  subtitle: string
  value: string
  accent?: string
}

export type StorySummary = {
  id: string
  title: string
  excerpt: string
  pages: number
  status: string
}

export type BookmarkSummary = {
  title: string
  due: string
  location: string
}

export type CollectionEntry = {
  id: string
  name: string
  slug: string
  description: string
  category?: string | null
}

export type StoryCollectionLinkEntry = {
  id: string
  storyId: string
  collectionId: string
  linkedAt: string
}

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

export type PageBookmark = {
  id: EntityId
  title: string
  createdAt: string
}

export type PagePhoto = {
  id: EntityId
  label: string
  source: 'placeholder' | 'camera'
}

export type PageTask = {
  id: EntityId
  title: string
  completed: boolean
}

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

export type TaskEntry = {
  id: EntityId
  title: string
  completed: boolean
  storyId: string
  pageId?: string | null
}
