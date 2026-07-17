import type { AppStory, PageBookmark, PageEntry, PagePhoto, TaskEntry } from '../types'

type AppDataResponse = {
	story: AppStory
	pages: PageEntry[]
	tasks: TaskEntry[]
}

const APP_DATA_ENDPOINT = '/api/app-data'

const requestJson = async <T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> => {
	const response = await fetch(input, init)
	if (!response.ok) {
		throw new Error(`Request failed: ${response.status}`)
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
