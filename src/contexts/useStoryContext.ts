import { useContext } from 'react'
import { StoryContext } from './story-context'

/**
 * Returns the current StoryContext value.
 *
 * @throws Error When used outside `StoryProvider`.
 */
export function useStoryContext() {
  const context = useContext(StoryContext)
  if (!context) {
    throw new Error('useStoryContext must be used within a StoryProvider')
  }
  return context
}
