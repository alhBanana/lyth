import type { NavItem, StorySummary, BookmarkSummary, StoryDetail } from '../types'

export const collectionCategories = [
  'Fitness',
  'Food',
  'Wellbeing',
  'Learning',
  'Travel',
  'Finance',
  'Home',
  'Creative',
  'Other',
] as const

export const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: '🏠' },
  { label: 'Stories', to: '/stories', icon: '📚' },
  { label: 'Calendar', to: '/calendar', icon: '🗓️' },
  { label: 'Diary', to: '/diary', icon: '✍️' },
  { label: 'Library', to: '/library', icon: '📖' },
  { label: 'Bookmarks', to: '/bookmarks', icon: '🔖' },
  { label: 'Settings', to: '/settings', icon: '⚙️' },
]

export const dashboardStory: StorySummary = {
  id: 'lost-grove',
  title: 'The Lost Grove',
  excerpt: 'A personal plan to improve clarity, focus, and daily habits through small actions.',
  pages: 8,
  status: 'active',
}

export const storySummaries: StorySummary[] = [
  {
    id: '4t',
    title: '4T',
    excerpt: 'My journey to becoming the healthiest, happiest and strongest version of myself before I turn 40.',
    pages: 0,
    status: 'Not Started',
  },
  {
    id: 'lost-grove',
    title: 'The Lost Grove',
    excerpt: 'A personal plan to improve clarity, focus, and daily habits through small actions.',
    pages: 8,
    status: 'active',
  },
  {
    id: 'woodland-song',
    title: 'Woodland Song',
    excerpt: 'A slower-paced practice to build consistent routines and strengthen memory.',
    pages: 12,
    status: 'resting',
  },
  {
    id: 'harvest-moon',
    title: 'Harvest Moon',
    excerpt: 'Short experiments and commitments to build momentum toward a goal.',
    pages: 5,
    status: 'planning',
  },
]

export const bookmarkSummaries: BookmarkSummary[] = []

export const storyDetails: StoryDetail[] = [
  {
    id: '4t',
    title: '4T',
    excerpt: 'My journey to becoming the healthiest, happiest and strongest version of myself before I turn 40.',
    pages: 0,
    milestones: 0,
    outcome: 'Build a consistent daily routine that supports long-term strength and wellbeing.',
    description: 'My journey to becoming the healthiest, happiest and strongest version of myself before I turn 40.',
    progress: 0,
    status: 'Not Started',
    startDate: '28 July 2026',
    targetDate: '28 July 2027',
  },
  {
    id: 'lost-grove',
    title: 'The Lost Grove',
    excerpt: 'A personal plan to improve clarity, focus, and daily habits through small actions.',
    pages: 8,
    milestones: 6,
    outcome: 'Refine the core goal and complete the next milestone by tonight.',
    description: 'A focused sequence of daily practices aimed at improving clarity and calm.',
    progress: 20,
    status: 'active',
    startDate: '2026-07-01',
    targetDate: '2026-12-01',
  },
  {
    id: 'woodland-song',
    title: 'Woodland Song',
    excerpt: 'A slower-paced practice to build consistent routines and strengthen memory.',
    pages: 12,
    milestones: 9,
    outcome: 'Pause and consolidate practices to increase resilience.',
    description: 'A gentle program that supports memory and steady habit formation.',
    progress: 45,
    status: 'resting',
    startDate: '2025-10-01',
    targetDate: '2026-04-01',
  },
  {
    id: 'harvest-moon',
    title: 'Harvest Moon',
    excerpt: 'Short experiments and commitments to build momentum toward a goal.',
    pages: 5,
    milestones: 4,
    outcome: 'Sketch the next milestone and gather concrete actions.',
    description: 'Short experiments and commitments designed to create forward momentum.',
    progress: 10,
    status: 'planning',
    startDate: '2026-09-01',
    targetDate: '2026-11-01',
  },
]
