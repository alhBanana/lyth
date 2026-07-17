import type { AppStory, ChapterEntry, CollectionEntry, PageBookmark, PageEntry, PagePhoto, StoryCollectionLinkEntry, TaskEntry } from '../types'

type AppDataResponse = {
	story: AppStory
	chapters: ChapterEntry[]
	collections: CollectionEntry[]
	storyCollectionLinks: StoryCollectionLinkEntry[]
	pages: PageEntry[]
	tasks: TaskEntry[]
}

const APP_DATA_ENDPOINT = '/api/app-data'

type ApiErrorPayload = {
	error?: string
}

export class ApiError extends Error {
	status: number

	constructor(status: number, message: string) {
		super(message)
		this.status = status
	}
}

const requestJson = async <T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> => {
	const response = await fetch(input, init)
	if (!response.ok) {
		let message = `Request failed: ${response.status}`
		try {
			const payload = (await response.json()) as ApiErrorPayload
			if (payload?.error) {
				message = payload.error
			}
		} catch {
			// Keep fallback message when no JSON body is returned.
		}
		throw new ApiError(response.status, message)
	}
	return (await response.json()) as T
}

export async function fetchAppData(): Promise<AppDataResponse> {
	return requestJson<AppDataResponse>(APP_DATA_ENDPOINT)
}

export async function savePageNotes(pageId: string, notes: string): Promise<PageEntry> {
	return requestJson<PageEntry>(`/api/pages/${encodeURIComponent(pageId)}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ notes }),
	})
}

export async function savePageReflection(pageId: string, reflection: string): Promise<PageEntry> {
	return requestJson<PageEntry>(`/api/pages/${encodeURIComponent(pageId)}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ reflection }),
	})
}

export async function createPageTask(pageId: string, title: string): Promise<TaskEntry> {
	return requestJson<TaskEntry>(`/api/pages/${encodeURIComponent(pageId)}/tasks`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ title }),
	})
}

export async function createPageBookmark(pageId: string, title: string): Promise<PageBookmark> {
	return requestJson<PageBookmark>(`/api/pages/${encodeURIComponent(pageId)}/bookmarks`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ title }),
	})
}

export async function createPagePhoto(pageId: string): Promise<PagePhoto> {
	return requestJson<PagePhoto>(`/api/pages/${encodeURIComponent(pageId)}/photos`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ label: "Today's photo", source: 'placeholder' }),
	})
}

export async function toggleTask(taskId: string): Promise<TaskEntry> {
	return requestJson<TaskEntry>(`/api/tasks/${encodeURIComponent(taskId)}/toggle`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
	})
}

type CreateCollectionInput = {
	name: string
	description: string
	category?: string
	linkToStoryId?: string
}

type CreateCollectionResponse = {
	collection: CollectionEntry
	storyCollectionLink: StoryCollectionLinkEntry | null
}

export async function createCollection(input: CreateCollectionInput): Promise<CreateCollectionResponse> {
	return requestJson<CreateCollectionResponse>('/api/collections', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	})
}

export async function linkCollectionToStory(collectionId: string, storyId: string): Promise<StoryCollectionLinkEntry> {
	return requestJson<StoryCollectionLinkEntry>(`/api/collections/${encodeURIComponent(collectionId)}/stories/${encodeURIComponent(storyId)}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
	})
}

export async function unlinkCollectionFromStory(collectionId: string, storyId: string): Promise<void> {
	await requestJson<{ ok: true }>(`/api/collections/${encodeURIComponent(collectionId)}/stories/${encodeURIComponent(storyId)}`, {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
	})
}
