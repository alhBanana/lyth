import { defineConfig } from "vite";
import type { Plugin, ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createRequire } from "node:module";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const nodeRequire = createRequire(import.meta.url);

type PrismaClientInstance = InstanceType<
  (typeof import("./src/generated/prisma/index.js"))["PrismaClient"]
>;

let prismaClientPromise: Promise<PrismaClientInstance> | null = null;

/**
 * Lazily creates a singleton Prisma client for Vite middleware requests.
 */
const getPrismaClient = async (): Promise<PrismaClientInstance> => {
  if (!prismaClientPromise) {
    prismaClientPromise = Promise.resolve().then(() => {
      const prismaModule = nodeRequire("./src/generated/prisma/index.js") as {
        PrismaClient: new (options: {
          adapter: PrismaBetterSqlite3;
        }) => PrismaClientInstance;
      };
      const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
      const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
      return new prismaModule.PrismaClient({ adapter });
    });
  }
  return prismaClientPromise;
};

/**
 * Returns the request path without query parameters.
 */
const parsePath = (url: string | undefined) => (url ?? "").split("?")[0] ?? "";

/**
 * Reads and parses a JSON request body from Node middleware.
 */
const readJsonBody = async (
  req: IncomingMessage,
): Promise<Record<string, unknown>> => {
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) {
    if (typeof chunk === "string") {
      chunks.push(Buffer.from(chunk));
    } else {
      chunks.push(chunk);
    }
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  const parsed = JSON.parse(raw);
  if (typeof parsed === "object" && parsed !== null) {
    return parsed as Record<string, unknown>;
  }
  return {};
};

/**
 * Writes a JSON API response with status code.
 */
const sendJson = (
  res: ServerResponse,
  statusCode: number,
  payload: unknown,
) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

/**
 * Normalizes Task records for client payloads.
 */
const mapTask = (task: {
  id: string;
  title: string;
  completed: boolean;
  storyId: string;
  pageId: string | null;
}) => ({
  id: task.id,
  title: task.title,
  completed: task.completed,
  storyId: task.storyId,
  pageId: task.pageId,
});

/**
 * Normalizes Bookmark records for client payloads.
 */
const mapBookmark = (bookmark: {
  id: string;
  title: string;
  createdAt: Date;
}) => ({
  id: bookmark.id,
  title: bookmark.title,
  createdAt: bookmark.createdAt.toISOString(),
});

/**
 * Normalizes Photo records for client payloads.
 */
const mapPhoto = (photo: { id: string; label: string; source: string }) => ({
  id: photo.id,
  label: photo.label,
  source: photo.source === "camera" ? "camera" : "placeholder",
});

/**
 * Normalizes Chapter records for client payloads.
 */
const mapChapter = (chapter: {
  id: string;
  storyId: string;
  title: string;
  description: string | null;
  order: number;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
}) => ({
  id: chapter.id,
  storyId: chapter.storyId,
  title: chapter.title,
  description: chapter.description ?? "",
  order: chapter.order,
  startDate: chapter.startDate
    ? dbDateToDateIdentifier(chapter.startDate)
    : null,
  endDate: chapter.endDate ? dbDateToDateIdentifier(chapter.endDate) : null,
  status: chapter.status,
});

/**
 * Normalizes Collection records for client payloads.
 */
const mapCollection = (collection: {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string | null;
}) => ({
  id: collection.id,
  name: collection.name,
  slug: collection.slug,
  description: collection.description,
  category: collection.category,
});

/**
 * Normalizes Story-Collection link records for client payloads.
 */
const mapStoryCollectionLink = (link: {
  id: string;
  storyId: string;
  collectionId: string;
  linkedAt: Date;
}) => ({
  id: link.id,
  storyId: link.storyId,
  collectionId: link.collectionId,
  linkedAt: link.linkedAt.toISOString(),
});

const pad2 = (value: number) => String(value).padStart(2, "0");

/**
 * Returns the user's local date identifier (YYYY-MM-DD).
 */
const getTodayLocalDateIdentifier = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
};

/**
 * Converts a date identifier to the canonical persisted date object.
 */
const dateIdentifierToDbDate = (dateIdentifier: string): Date => {
  return new Date(`${dateIdentifier}T00:00:00.000Z`);
};

/**
 * Converts a persisted Date into a date identifier used by client payloads.
 */
const dbDateToDateIdentifier = (date: Date): string => {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
};

const addUtcDays = (date: Date, days: number): Date => {
  const value = new Date(date);
  value.setUTCDate(value.getUTCDate() + days);
  return value;
};

const splitRangeIntoSegments = (
  start: Date,
  end: Date,
  segments: number,
): Array<{ startDate: Date; endDate: Date }> => {
  const oneDayMs = 86400000;
  const totalDays =
    Math.floor((end.getTime() - start.getTime()) / oneDayMs) + 1;
  const baseDays = Math.floor(totalDays / segments);
  const remainder = totalDays % segments;

  const ranges: Array<{ startDate: Date; endDate: Date }> = [];
  let cursor = new Date(start);

  for (let index = 0; index < segments; index += 1) {
    const segmentDays = baseDays + (index < remainder ? 1 : 0);
    const segmentStart = new Date(cursor);
    const segmentEnd = addUtcDays(segmentStart, Math.max(segmentDays - 1, 0));
    ranges.push({ startDate: segmentStart, endDate: segmentEnd });
    cursor = addUtcDays(segmentEnd, 1);
  }

  return ranges;
};

/**
 * Builds the default chapter blueprint for the seed 4T Story.
 */
const buildDefault4tChapters = (storyId: string) => {
  const chapterBlueprints = [
    {
      order: 1,
      title: "Building Foundations",
      description: "Create core routines and consistency for the 4T journey.",
    },
    {
      order: 2,
      title: "Creating Momentum",
      description:
        "Build repeatable wins and strengthen day-to-day discipline.",
    },
    {
      order: 3,
      title: "Transformation",
      description:
        "Push into deeper change through focused practice and reflection.",
    },
    {
      order: 4,
      title: "Reflection",
      description: "Consolidate progress, capture lessons, and finish strong.",
    },
  ];

  const ranges = splitRangeIntoSegments(
    dateIdentifierToDbDate("2026-07-28"),
    dateIdentifierToDbDate("2027-07-28"),
    chapterBlueprints.length,
  );

  return chapterBlueprints.map((blueprint, index) => ({
    storyId,
    order: blueprint.order,
    title: blueprint.title,
    description: blueprint.description,
    startDate: ranges[index].startDate,
    endDate: ranges[index].endDate,
    status: "Not Started",
  }));
};

/**
 * Ensures 4T chapter records exist, creating defaults once when empty.
 */
const ensureDefault4tChapters = async (
  prisma: PrismaClientInstance,
  story: { id: string; title: string; subtitle: string | null },
) => {
  const existingChapters = await prisma.chapter.findMany({
    where: { storyId: story.id },
    orderBy: { order: "asc" },
  });

  if (existingChapters.length > 0) {
    return existingChapters;
  }

  const is4TStory = story.title === "4T" || story.subtitle === "40 Before 40";
  if (!is4TStory) {
    return existingChapters;
  }

  const seeded = await prisma.$transaction(
    buildDefault4tChapters(story.id).map((chapter) =>
      prisma.chapter.create({ data: chapter }),
    ),
  );

  return seeded;
};

/**
 * Backfills chapter assignment for existing Story pages when possible.
 */
const assignPagesToChapterRanges = async (
  prisma: PrismaClientInstance,
  storyId: string,
  chapters: Array<{ id: string; startDate: Date | null; endDate: Date | null }>,
) => {
  if (chapters.length === 0) {
    return;
  }

  const unassignedPages = await prisma.page.findMany({
    where: {
      storyId,
      chapterId: null,
    },
    select: {
      id: true,
      date: true,
    },
  });

  if (unassignedPages.length === 0) {
    return;
  }

  for (const page of unassignedPages) {
    const matchingChapter = chapters.find((chapter) => {
      if (!chapter.startDate) {
        return false;
      }
      const startsBeforeOrOn =
        page.date.getTime() >= chapter.startDate.getTime();
      const endsAfterOrOn =
        !chapter.endDate || page.date.getTime() <= chapter.endDate.getTime();
      return startsBeforeOrOn && endsAfterOrOn;
    });

    if (!matchingChapter) {
      continue;
    }

    await prisma.page.update({
      where: { id: page.id },
      data: { chapterId: matchingChapter.id },
    });
  }
};

const MVP_COLLECTIONS = [
  {
    slug: "running",
    name: "Running",
    description: "Track training and progress over time.",
    category: "Fitness",
  },
  {
    slug: "meals",
    name: "Meals",
    description: "Plan nutrition, habits, and daily support.",
    category: "Food",
  },
  {
    slug: "yoga",
    name: "Yoga",
    description: "Stretch, recover, and stay centered.",
    category: "Wellbeing",
  },
  {
    slug: "notebook",
    name: "Notebook",
    description: "Notes, reflections, and practical reminders.",
    category: "Learning",
  },
] as const;

const COLLECTION_CATEGORIES = [
  "Fitness",
  "Food",
  "Wellbeing",
  "Learning",
  "Travel",
  "Finance",
  "Home",
  "Creative",
  "Other",
] as const;

const isCollectionCategory = (
  value: string,
): value is (typeof COLLECTION_CATEGORIES)[number] => {
  return COLLECTION_CATEGORIES.includes(
    value as (typeof COLLECTION_CATEGORIES)[number],
  );
};

/**
 * Creates a stable slug for Collection uniqueness checks.
 */
const slugifyCollectionName = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

/**
 * Ensures seeded Library Collections exist without creating duplicates.
 */
const ensureSeedCollections = async (prisma: PrismaClientInstance) => {
  for (const collection of MVP_COLLECTIONS) {
    await prisma.collection.upsert({
      where: { slug: collection.slug },
      update: {
        name: collection.name,
        description: collection.description,
        category: collection.category,
      },
      create: {
        slug: collection.slug,
        name: collection.name,
        description: collection.description,
        category: collection.category,
      },
    });
  }

  return prisma.collection.findMany({ orderBy: { createdAt: "asc" } });
};

/**
 * Ensures Story-to-Collection links exist for seeded Collection entries.
 */
const ensureStoryCollectionLinks = async (
  prisma: PrismaClientInstance,
  storyId: string,
  collections: Array<{ id: string; slug: string }>,
) => {
  for (const collection of collections) {
    await prisma.storyCollectionLink.upsert({
      where: {
        storyId_collectionId: {
          storyId,
          collectionId: collection.id,
        },
      },
      update: {},
      create: {
        storyId,
        collectionId: collection.id,
      },
    });
  }
};

/**
 * Vite middleware plugin exposing local API endpoints backed by Prisma/SQLite.
 */
const appDataPlugin = (): Plugin => ({
  name: "app-data-api",
  configureServer(server: ViteDevServer) {
    server.middlewares.use(
      async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const path = parsePath(req.url);
        if (!path.startsWith("/api/")) {
          next();
          return;
        }

        try {
          const prisma = await getPrismaClient();
          const seedStory = await ensureSeedStory(prisma);
          const story = await prisma.story.findUnique({
            where: { id: seedStory.id },
          });

          if (!story) {
            sendJson(res, 404, { error: "Story not found" });
            return;
          }

          const seededCollections = await ensureSeedCollections(prisma);
          await ensureStoryCollectionLinks(
            prisma,
            story.id,
            seededCollections.filter((collection) =>
              MVP_COLLECTIONS.some((seeded) => seeded.slug === collection.slug),
            ),
          );

          const chapters = await ensureDefault4tChapters(prisma, {
            id: story.id,
            title: story.title,
            subtitle: story.subtitle,
          });

          await assignPagesToChapterRanges(prisma, story.id, chapters);

          const todayDateIdentifier = getTodayLocalDateIdentifier();

          await prisma.page.upsert({
            where: {
              storyId_date: {
                storyId: story.id,
                date: dateIdentifierToDbDate(todayDateIdentifier),
              },
            },
            update: {},
            create: {
              storyId: story.id,
              date: dateIdentifierToDbDate(todayDateIdentifier),
              notes: "",
              reflection: "",
              running: "30-minute morning run with gentle recovery.",
              meals:
                "Breakfast: porridge and berries. Lunch: grilled salmon salad. Dinner: roasted vegetables.",
              yoga: "A gentle 20-minute stretch and breathing session.",
            },
          });

          // Page mutation route for notes/reflection updates.
          const pagePatchMatch = path.match(/^\/api\/pages\/([^/]+)$/);
          if (req.method === "PATCH" && pagePatchMatch) {
            const pageId = decodeURIComponent(pagePatchMatch[1] ?? "");
            const body = await readJsonBody(req);
            const notes =
              typeof body.notes === "string" ? body.notes : undefined;
            const reflection =
              typeof body.reflection === "string" ? body.reflection : undefined;

            if (notes === undefined && reflection === undefined) {
              sendJson(res, 400, { error: "No supported fields provided" });
              return;
            }

            const updatedPage = await prisma.page.update({
              where: { id: pageId },
              data: {
                ...(notes !== undefined ? { notes } : {}),
                ...(reflection !== undefined ? { reflection } : {}),
              },
            });

            sendJson(res, 200, {
              id: updatedPage.id,
              date: dbDateToDateIdentifier(updatedPage.date),
              storyId: updatedPage.storyId,
              chapterId: updatedPage.chapterId,
              notes: updatedPage.notes,
              reflection: updatedPage.reflection,
              bookmarks: [],
              photos: [],
              tasks: [],
              running: updatedPage.running ?? "",
              meals: updatedPage.meals ?? "",
              yoga: updatedPage.yoga ?? "",
            });
            return;
          }

          // Page-scoped task creation route.
          const pageTaskMatch = path.match(/^\/api\/pages\/([^/]+)\/tasks$/);
          if (req.method === "POST" && pageTaskMatch) {
            const pageId = decodeURIComponent(pageTaskMatch[1] ?? "");
            const body = await readJsonBody(req);
            const title =
              typeof body.title === "string" ? body.title.trim() : "";

            if (!title) {
              sendJson(res, 400, { error: "Task title is required" });
              return;
            }

            const page = await prisma.page.findUnique({
              where: { id: pageId },
              select: { id: true, storyId: true },
            });

            if (!page) {
              sendJson(res, 404, { error: "Page not found" });
              return;
            }

            const createdTask = await prisma.task.create({
              data: {
                title,
                completed: false,
                storyId: page.storyId,
                pageId: page.id,
              },
            });

            sendJson(res, 201, mapTask(createdTask));
            return;
          }

          // Page bookmark creation route.
          const pageBookmarkMatch = path.match(
            /^\/api\/pages\/([^/]+)\/bookmarks$/,
          );
          if (req.method === "POST" && pageBookmarkMatch) {
            const pageId = decodeURIComponent(pageBookmarkMatch[1] ?? "");
            const body = await readJsonBody(req);
            const title =
              typeof body.title === "string" ? body.title.trim() : "";

            if (!title) {
              sendJson(res, 400, { error: "Bookmark title is required" });
              return;
            }

            const page = await prisma.page.findUnique({
              where: { id: pageId },
              select: { id: true },
            });
            if (!page) {
              sendJson(res, 404, { error: "Page not found" });
              return;
            }

            const createdBookmark = await prisma.bookmark.create({
              data: {
                pageId: page.id,
                title,
              },
            });

            sendJson(res, 201, mapBookmark(createdBookmark));
            return;
          }

          // Page photo creation route.
          const pagePhotoMatch = path.match(/^\/api\/pages\/([^/]+)\/photos$/);
          if (req.method === "POST" && pagePhotoMatch) {
            const pageId = decodeURIComponent(pagePhotoMatch[1] ?? "");
            const body = await readJsonBody(req);
            const label =
              typeof body.label === "string" && body.label.trim()
                ? body.label.trim()
                : "Today's photo";
            const source = body.source === "camera" ? "camera" : "placeholder";

            const page = await prisma.page.findUnique({
              where: { id: pageId },
              select: { id: true },
            });
            if (!page) {
              sendJson(res, 404, { error: "Page not found" });
              return;
            }

            const createdPhoto = await prisma.photo.create({
              data: {
                pageId: page.id,
                label,
                source,
              },
            });

            sendJson(res, 201, mapPhoto(createdPhoto));
            return;
          }

          // Story/Page task completion toggle route.
          const taskToggleMatch = path.match(/^\/api\/tasks\/([^/]+)\/toggle$/);
          if (req.method === "PATCH" && taskToggleMatch) {
            const taskId = decodeURIComponent(taskToggleMatch[1] ?? "");
            const existingTask = await prisma.task.findUnique({
              where: { id: taskId },
            });
            if (!existingTask) {
              sendJson(res, 404, { error: "Task not found" });
              return;
            }

            const updatedTask = await prisma.task.update({
              where: { id: taskId },
              data: { completed: !existingTask.completed },
            });

            sendJson(res, 200, mapTask(updatedTask));
            return;
          }

          // Collection creation route with optional immediate Story link.
          if (req.method === "POST" && path === "/api/collections") {
            const body = await readJsonBody(req);
            const name = typeof body.name === "string" ? body.name.trim() : "";
            const description =
              typeof body.description === "string"
                ? body.description.trim()
                : "";
            const categoryInput =
              typeof body.category === "string" ? body.category.trim() : "";
            const category =
              categoryInput && isCollectionCategory(categoryInput)
                ? categoryInput
                : null;
            const linkToStoryId =
              typeof body.linkToStoryId === "string"
                ? body.linkToStoryId
                : null;

            if (!name) {
              sendJson(res, 400, { error: "Collection name is required" });
              return;
            }

            if (categoryInput && !category) {
              sendJson(res, 400, { error: "Invalid collection category" });
              return;
            }

            const slug = slugifyCollectionName(name);
            if (!slug) {
              sendJson(res, 400, {
                error: "Collection name must include letters or numbers",
              });
              return;
            }

            const existingCollection = await prisma.collection.findUnique({
              where: { slug },
            });
            if (existingCollection) {
              sendJson(res, 409, {
                error: "A collection with this name already exists",
              });
              return;
            }

            const createdCollection = await prisma.collection.create({
              data: {
                name,
                slug,
                description,
                category,
              },
            });

            let createdLink: {
              id: string;
              storyId: string;
              collectionId: string;
              linkedAt: Date;
            } | null = null;

            if (linkToStoryId) {
              const storyToLink = await prisma.story.findUnique({
                where: { id: linkToStoryId },
                select: { id: true },
              });
              if (!storyToLink) {
                sendJson(res, 404, { error: "Story not found for linking" });
                return;
              }

              createdLink = await prisma.storyCollectionLink.upsert({
                where: {
                  storyId_collectionId: {
                    storyId: storyToLink.id,
                    collectionId: createdCollection.id,
                  },
                },
                update: {},
                create: {
                  storyId: storyToLink.id,
                  collectionId: createdCollection.id,
                },
              });
            }

            sendJson(res, 201, {
              collection: mapCollection(createdCollection),
              storyCollectionLink: createdLink
                ? mapStoryCollectionLink(createdLink)
                : null,
            });
            return;
          }

          // Story-Collection link management route.
          const collectionStoryLinkMatch = path.match(
            /^\/api\/collections\/([^/]+)\/stories\/([^/]+)$/,
          );
          if (collectionStoryLinkMatch) {
            const collectionId = decodeURIComponent(
              collectionStoryLinkMatch[1] ?? "",
            );
            const storyId = decodeURIComponent(
              collectionStoryLinkMatch[2] ?? "",
            );

            const [collectionToLink, storyToLink] = await Promise.all([
              prisma.collection.findUnique({
                where: { id: collectionId },
                select: { id: true },
              }),
              prisma.story.findUnique({
                where: { id: storyId },
                select: { id: true },
              }),
            ]);

            if (!collectionToLink) {
              sendJson(res, 404, { error: "Collection not found" });
              return;
            }

            if (!storyToLink) {
              sendJson(res, 404, { error: "Story not found" });
              return;
            }

            if (req.method === "POST") {
              const link = await prisma.storyCollectionLink.upsert({
                where: {
                  storyId_collectionId: {
                    storyId,
                    collectionId,
                  },
                },
                update: {},
                create: {
                  storyId,
                  collectionId,
                },
              });

              sendJson(res, 200, mapStoryCollectionLink(link));
              return;
            }

            if (req.method === "DELETE") {
              await prisma.storyCollectionLink.deleteMany({
                where: {
                  storyId,
                  collectionId,
                },
              });

              sendJson(res, 200, { ok: true });
              return;
            }
          }
          
          // Collection deletion route.
          const collectionDeleteMatch = path.match(
            /^\/api\/collections\/([^/]+)$/,
          );

          if (req.method === "DELETE" && collectionDeleteMatch) {
            const collectionId = decodeURIComponent(
              collectionDeleteMatch[1] ?? "",
            );

            const collection = await prisma.collection.findUnique({
              where: { id: collectionId },
              select: { id: true },
            });

            if (!collection) {
              sendJson(res, 404, { error: "Collection not found" });
              return;
            }

            await prisma.$transaction(async (tx) => {
              await tx.storyCollectionLink.deleteMany({
                where: {
                  collectionId,
                },
              });

              await tx.collection.delete({
                where: {
                  id: collectionId,
                },
              });
            });

            sendJson(res, 200, { ok: true });
            return;
          }
          // Collection update route.
          const collectionUpdateMatch = path.match(
            /^\/api\/collections\/([^/]+)$/,
          );

          if (req.method === "PATCH" && collectionUpdateMatch) {
            const collectionId = decodeURIComponent(
              collectionUpdateMatch[1] ?? "",
            );
            const body = await readJsonBody(req);

            const name = typeof body.name === "string" ? body.name.trim() : "";

            const description =
              typeof body.description === "string"
                ? body.description.trim()
                : "";

            const categoryInput =
              typeof body.category === "string" ? body.category.trim() : "";

            if (!name) {
              sendJson(res, 400, {
                error: "Collection name is required",
              });
              return;
            }

            const category =
              categoryInput && isCollectionCategory(categoryInput)
                ? categoryInput
                : null;

            if (categoryInput && !category) {
              sendJson(res, 400, {
                error: "Invalid collection category",
              });
              return;
            }

            const updatedCollection = await prisma.collection.update({
              where: {
                id: collectionId,
              },
              data: {
                name,
                description,
                category,
              },
            });

            sendJson(res, 200, mapCollection(updatedCollection));
            return;
          }

          if (req.method !== "GET" || path !== "/api/app-data") {
            sendJson(res, 404, { error: "API route not found" });
            return;
          }
          

          const [
            freshChapters,
            collections,
            storyCollectionLinks,
            pages,
            tasks,
            bookmarks,
            photos,
          ] = await Promise.all([
            prisma.chapter.findMany({
              where: { storyId: story.id },
              orderBy: { order: "asc" },
            }),
            prisma.collection.findMany({
              orderBy: { createdAt: "asc" },
            }),
            prisma.storyCollectionLink.findMany({
              where: { storyId: story.id },
              orderBy: { linkedAt: "asc" },
            }),
            prisma.page.findMany({
              where: { storyId: story.id },
              orderBy: { date: "asc" },
            }),
            prisma.task.findMany({
              where: { storyId: story.id },
              orderBy: { createdAt: "asc" },
            }),
            prisma.bookmark.findMany({
              where: { page: { storyId: story.id } },
              orderBy: { createdAt: "desc" },
            }),
            prisma.photo.findMany({
              where: { page: { storyId: story.id } },
              orderBy: { createdAt: "desc" },
            }),
          ]);

          const pageTasksByPageId = new Map<
            string,
            ReturnType<typeof mapTask>[]
          >();
          for (const task of tasks) {
            if (!task.pageId) continue;
            const list = pageTasksByPageId.get(task.pageId) ?? [];
            list.push(mapTask(task));
            pageTasksByPageId.set(task.pageId, list);
          }

          const bookmarksByPageId = new Map<
            string,
            ReturnType<typeof mapBookmark>[]
          >();
          for (const bookmark of bookmarks) {
            const list = bookmarksByPageId.get(bookmark.pageId) ?? [];
            list.push(mapBookmark(bookmark));
            bookmarksByPageId.set(bookmark.pageId, list);
          }

          const photosByPageId = new Map<
            string,
            ReturnType<typeof mapPhoto>[]
          >();
          for (const photo of photos) {
            const list = photosByPageId.get(photo.pageId) ?? [];
            list.push(mapPhoto(photo));
            photosByPageId.set(photo.pageId, list);
          }

          const payload = {
            story: {
              id: story.id,
              title: story.title,
              subtitle: story.subtitle ?? "",
              description: story.description ?? "",
              startDateId: story.startDate
                ? dbDateToDateIdentifier(story.startDate)
                : "2026-07-28",
              startDate: formatDate(story.startDate),
              targetDate: formatDate(story.targetDate),
              age: 39,
              progress: story.progress,
              status: story.status,
            },
            chapters: freshChapters.map((chapter) => mapChapter(chapter)),
            collections: collections.map((collection) =>
              mapCollection(collection),
            ),
            storyCollectionLinks: storyCollectionLinks.map((link) =>
              mapStoryCollectionLink(link),
            ),
            pages: pages.map((page) => ({
              id: page.id,
              date: dbDateToDateIdentifier(page.date),
              storyId: page.storyId,
              chapterId: page.chapterId,
              notes: page.notes,
              reflection: page.reflection,
              bookmarks: bookmarksByPageId.get(page.id) ?? [],
              photos: photosByPageId.get(page.id) ?? [],
              tasks: (pageTasksByPageId.get(page.id) ?? []).map((task) => ({
                id: task.id,
                title: task.title,
                completed: task.completed,
              })),
              running: page.running ?? "",
              meals: page.meals ?? "",
              yoga: page.yoga ?? "",
            })),
            tasks: tasks.map((task) => mapTask(task)),
          };

          sendJson(res, 200, payload);
        } catch (error) {
          sendJson(res, 500, {
            error: "Failed to load app data",
            details: error instanceof Error ? error.message : "Unknown error",
          });
        }
      },
    );
  },
});

const formatDate = (value: Date | null) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(value);
};

/**
 * Ensures a baseline active Story exists for the local app environment.
 */
const ensureSeedStory = async (prisma: PrismaClientInstance) => {
  const existing = await prisma.story.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    return existing;
  }

  return prisma.story.create({
    data: {
      title: "4T",
      subtitle: "40 Before 40",
      description:
        "My journey to becoming the healthiest, happiest and strongest version of myself before I turn 40.",
      status: "Not Started",
      progress: 0,
      startDate: dateIdentifierToDbDate("2026-07-28"),
      targetDate: dateIdentifierToDbDate("2027-07-28"),
      tasks: {
        create: [
          { title: "30 minute run", completed: false },
          { title: "Yoga session", completed: false },
        ],
      },
      pages: {
        create: [
          {
            date: dateIdentifierToDbDate("2026-07-28"),
            notes: "",
            reflection: "",
            running: "30-minute morning run with gentle recovery.",
            meals:
              "Breakfast: porridge and berries. Lunch: grilled salmon salad. Dinner: roasted vegetables.",
            yoga: "A gentle 20-minute stretch and breathing session.",
          },
        ],
      },
    },
  });
};

export default defineConfig({
  plugins: [react(), tailwindcss(), appDataPlugin()],
});
