import type {
  AppStory,
  ChapterEntry,
  CollectionEntry,
  PageBookmark,
  PageEntry,
  PagePhoto,
  StoryCollectionLinkEntry,
  TaskEntry,
} from "../types";

/**
 * Aggregated app bootstrap payload returned by `/api/app-data`.
 */
type AppDataResponse = {
  story: AppStory;
  chapters: ChapterEntry[];
  collections: CollectionEntry[];
  storyCollectionLinks: StoryCollectionLinkEntry[];
  pages: PageEntry[];
  tasks: TaskEntry[];
};

const APP_DATA_ENDPOINT = "/api/app-data";

type ApiErrorPayload = {
  error?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Executes an API request and returns parsed JSON.
 *
 * @throws ApiError When the server responds with a non-2xx status.
 */
const requestJson = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(input, init);
  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const payload = (await response.json()) as ApiErrorPayload;
      if (payload?.error) {
        message = payload.error;
      }
    } catch {
      // Keep fallback message when no JSON body is returned.
    }
    throw new ApiError(response.status, message);
  }
  return (await response.json()) as T;
};

/**
 * Loads the full application state for the active Story.
 */
export async function fetchAppData(): Promise<AppDataResponse> {
  return requestJson<AppDataResponse>(APP_DATA_ENDPOINT);
}

/**
 * Persists notes for a specific Page.
 */
export async function savePageNotes(
  pageId: string,
  notes: string,
): Promise<PageEntry> {
  return requestJson<PageEntry>(`/api/pages/${encodeURIComponent(pageId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
}

/**
 * Persists reflection text for a specific Page.
 */
export async function savePageReflection(
  pageId: string,
  reflection: string,
): Promise<PageEntry> {
  return requestJson<PageEntry>(`/api/pages/${encodeURIComponent(pageId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reflection }),
  });
}

/**
 * Creates a Page-level task for the given Page.
 */
export async function createPageTask(
  pageId: string,
  title: string,
): Promise<TaskEntry> {
  return requestJson<TaskEntry>(
    `/api/pages/${encodeURIComponent(pageId)}/tasks`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    },
  );
}

/**
 * Creates a Bookmark on the given Page.
 */
export async function createPageBookmark(
  pageId: string,
  title: string,
): Promise<PageBookmark> {
  return requestJson<PageBookmark>(
    `/api/pages/${encodeURIComponent(pageId)}/bookmarks`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    },
  );
}

/**
 * Creates a placeholder photo entry for the given Page.
 */
export async function createPagePhoto(pageId: string): Promise<PagePhoto> {
  return requestJson<PagePhoto>(
    `/api/pages/${encodeURIComponent(pageId)}/photos`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: "Today's photo", source: "placeholder" }),
    },
  );
}

/**
 * Toggles completion state of a persisted task.
 */
export async function toggleTask(taskId: string): Promise<TaskEntry> {
  return requestJson<TaskEntry>(
    `/api/tasks/${encodeURIComponent(taskId)}/toggle`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    },
  );
}

/**
 * Input payload for creating a new Library Collection.
 */
type CreateCollectionInput = {
  name: string;
  description: string;
  category?: string;
  linkToStoryId?: string;
};

/**
 * Result payload for collection creation, including optional Story link.
 */
type CreateCollectionResponse = {
  collection: CollectionEntry;
  storyCollectionLink: StoryCollectionLinkEntry | null;
};

/**
 * Creates a new Collection in the Library.
 */
export async function createCollection(
  input: CreateCollectionInput,
): Promise<CreateCollectionResponse> {
  return requestJson<CreateCollectionResponse>("/api/collections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

/**
 * Links an existing Collection to a Story.
 */
export async function linkCollectionToStory(
  collectionId: string,
  storyId: string,
): Promise<StoryCollectionLinkEntry> {
  return requestJson<StoryCollectionLinkEntry>(
    `/api/collections/${encodeURIComponent(collectionId)}/stories/${encodeURIComponent(storyId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
  );
}

/**
 * Removes an existing Story-to-Collection link.
 */
export async function unlinkCollectionFromStory(
  collectionId: string,
  storyId: string,
): Promise<void> {
  await requestJson<{ ok: true }>(
    `/api/collections/${encodeURIComponent(collectionId)}/stories/${encodeURIComponent(storyId)}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    },
  );
}
/**
 * Updates an existing Library Collection.
 */
export async function updateCollection(
  collectionId: string,
  input: {
    name: string;
    description: string;
    category?: string;
  },
): Promise<CollectionEntry> {
  return requestJson<CollectionEntry>(
    `/api/collections/${encodeURIComponent(collectionId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );
}
/**
 * Permanently deletes a Collection from the Library.
 *
 * Deleting a Collection removes the Collection record and any
 * Story links associated with it. Stories themselves are never deleted.
 *
 * @param collectionId - The unique database ID of the Collection.
 * @throws {ApiError} When the Collection cannot be deleted.
 */
export async function deleteCollection(collectionId: string): Promise<void> {
  await requestJson<{ ok: true }>(
    `/api/collections/${encodeURIComponent(collectionId)}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}
