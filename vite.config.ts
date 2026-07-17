import { defineConfig } from 'vite'
import type { Plugin, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

type PrismaClientInstance = InstanceType<
  (typeof import('./src/generated/prisma/index.js'))['PrismaClient']
>

let prismaClientPromise: Promise<PrismaClientInstance> | null = null

const getPrismaClient = async (): Promise<PrismaClientInstance> => {
  if (!prismaClientPromise) {
    prismaClientPromise = import('./src/generated/prisma/index.js').then(
      ({ PrismaClient }) => new PrismaClient(),
    )
  }
  return prismaClientPromise
}

const parsePath = (url: string | undefined) => (url ?? '').split('?')[0] ?? ''

const readJsonBody = async (req: IncomingMessage): Promise<Record<string, unknown>> => {
  const chunks: Uint8Array[] = []
  for await (const chunk of req) {
    if (typeof chunk === 'string') {
      chunks.push(Buffer.from(chunk))
    } else {
      chunks.push(chunk)
    }
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim()
  if (!raw) return {}
  const parsed = JSON.parse(raw)
  if (typeof parsed === 'object' && parsed !== null) {
    return parsed as Record<string, unknown>
  }
  return {}
}

const sendJson = (res: ServerResponse, statusCode: number, payload: unknown) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

const mapTask = (task: {
  id: string
  title: string
  completed: boolean
  storyId: string
  pageId: string | null
}) => ({
  id: task.id,
  title: task.title,
  completed: task.completed,
  storyId: task.storyId,
  pageId: task.pageId,
})

const mapBookmark = (bookmark: {
  id: string
  title: string
  createdAt: Date
}) => ({
  id: bookmark.id,
  title: bookmark.title,
  createdAt: bookmark.createdAt.toISOString(),
})

const mapPhoto = (photo: {
  id: string
  label: string
  source: string
}) => ({
  id: photo.id,
  label: photo.label,
  source: photo.source === 'camera' ? 'camera' : 'placeholder',
})

const TODAY_PAGE_DATE = '2026-07-28'

const pageDateForStorage = (date: string) => new Date(`${date}T00:00:00.000Z`)

const appDataPlugin = (): Plugin => ({
  name: 'app-data-api',
  configureServer(server: ViteDevServer) {
    server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      const path = parsePath(req.url)
      if (!path.startsWith('/api/')) {
        next()
        return
      }

      try {
        const prisma = await getPrismaClient()
        const seedStory = await ensureSeedStory(prisma)
        const story = await prisma.story.findUnique({ where: { id: seedStory.id } })

        if (!story) {
          sendJson(res, 404, { error: 'Story not found' })
          return
        }

        await prisma.page.upsert({
          where: {
            storyId_date: {
              storyId: story.id,
              date: pageDateForStorage(TODAY_PAGE_DATE),
            },
          },
          update: {},
          create: {
            storyId: story.id,
            date: pageDateForStorage(TODAY_PAGE_DATE),
            notes: '',
            reflection: '',
            running: '30-minute morning run with gentle recovery.',
            meals:
              'Breakfast: porridge and berries. Lunch: grilled salmon salad. Dinner: roasted vegetables.',
            yoga: 'A gentle 20-minute stretch and breathing session.',
          },
        })

        const pagePatchMatch = path.match(/^\/api\/pages\/([^/]+)$/)
        if (req.method === 'PATCH' && pagePatchMatch) {
          const pageId = decodeURIComponent(pagePatchMatch[1] ?? '')
          const body = await readJsonBody(req)
          const notes = typeof body.notes === 'string' ? body.notes : undefined
          const reflection = typeof body.reflection === 'string' ? body.reflection : undefined

          if (notes === undefined && reflection === undefined) {
            sendJson(res, 400, { error: 'No supported fields provided' })
            return
          }

          const updatedPage = await prisma.page.update({
            where: { id: pageId },
            data: {
              ...(notes !== undefined ? { notes } : {}),
              ...(reflection !== undefined ? { reflection } : {}),
            },
          })

          sendJson(res, 200, {
            id: updatedPage.id,
            date: updatedPage.date.toISOString().slice(0, 10),
            storyId: updatedPage.storyId,
            notes: updatedPage.notes,
            reflection: updatedPage.reflection,
            bookmarks: [],
            photos: [],
            tasks: [],
            running: updatedPage.running ?? '',
            meals: updatedPage.meals ?? '',
            yoga: updatedPage.yoga ?? '',
          })
          return
        }

        const pageTaskMatch = path.match(/^\/api\/pages\/([^/]+)\/tasks$/)
        if (req.method === 'POST' && pageTaskMatch) {
          const pageId = decodeURIComponent(pageTaskMatch[1] ?? '')
          const body = await readJsonBody(req)
          const title = typeof body.title === 'string' ? body.title.trim() : ''

          if (!title) {
            sendJson(res, 400, { error: 'Task title is required' })
            return
          }

          const page = await prisma.page.findUnique({
            where: { id: pageId },
            select: { id: true, storyId: true },
          })

          if (!page) {
            sendJson(res, 404, { error: 'Page not found' })
            return
          }

          const createdTask = await prisma.task.create({
            data: {
              title,
              completed: false,
              storyId: page.storyId,
              pageId: page.id,
            },
          })

          sendJson(res, 201, mapTask(createdTask))
          return
        }

        const pageBookmarkMatch = path.match(/^\/api\/pages\/([^/]+)\/bookmarks$/)
        if (req.method === 'POST' && pageBookmarkMatch) {
          const pageId = decodeURIComponent(pageBookmarkMatch[1] ?? '')
          const body = await readJsonBody(req)
          const title = typeof body.title === 'string' ? body.title.trim() : ''

          if (!title) {
            sendJson(res, 400, { error: 'Bookmark title is required' })
            return
          }

          const page = await prisma.page.findUnique({ where: { id: pageId }, select: { id: true } })
          if (!page) {
            sendJson(res, 404, { error: 'Page not found' })
            return
          }

          const createdBookmark = await prisma.bookmark.create({
            data: {
              pageId: page.id,
              title,
            },
          })

          sendJson(res, 201, mapBookmark(createdBookmark))
          return
        }

        const pagePhotoMatch = path.match(/^\/api\/pages\/([^/]+)\/photos$/)
        if (req.method === 'POST' && pagePhotoMatch) {
          const pageId = decodeURIComponent(pagePhotoMatch[1] ?? '')
          const body = await readJsonBody(req)
          const label = typeof body.label === 'string' && body.label.trim() ? body.label.trim() : "Today's photo"
          const source = body.source === 'camera' ? 'camera' : 'placeholder'

          const page = await prisma.page.findUnique({ where: { id: pageId }, select: { id: true } })
          if (!page) {
            sendJson(res, 404, { error: 'Page not found' })
            return
          }

          const createdPhoto = await prisma.photo.create({
            data: {
              pageId: page.id,
              label,
              source,
            },
          })

          sendJson(res, 201, mapPhoto(createdPhoto))
          return
        }

        const taskToggleMatch = path.match(/^\/api\/tasks\/([^/]+)\/toggle$/)
        if (req.method === 'PATCH' && taskToggleMatch) {
          const taskId = decodeURIComponent(taskToggleMatch[1] ?? '')
          const existingTask = await prisma.task.findUnique({ where: { id: taskId } })
          if (!existingTask) {
            sendJson(res, 404, { error: 'Task not found' })
            return
          }

          const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: { completed: !existingTask.completed },
          })

          sendJson(res, 200, mapTask(updatedTask))
          return
        }

        if (req.method !== 'GET' || path !== '/api/app-data') {
          sendJson(res, 404, { error: 'API route not found' })
          return
        }

        const [pages, tasks, bookmarks, photos] = await Promise.all([
          prisma.page.findMany({
            where: { storyId: story.id },
            orderBy: { date: 'asc' },
          }),
          prisma.task.findMany({
            where: { storyId: story.id },
            orderBy: { createdAt: 'asc' },
          }),
          prisma.bookmark.findMany({
            where: { page: { storyId: story.id } },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.photo.findMany({
            where: { page: { storyId: story.id } },
            orderBy: { createdAt: 'desc' },
          }),
        ])

        const pageTasksByPageId = new Map<string, ReturnType<typeof mapTask>[]>()
        for (const task of tasks) {
          if (!task.pageId) continue
          const list = pageTasksByPageId.get(task.pageId) ?? []
          list.push(mapTask(task))
          pageTasksByPageId.set(task.pageId, list)
        }

        const bookmarksByPageId = new Map<string, ReturnType<typeof mapBookmark>[]>()
        for (const bookmark of bookmarks) {
          const list = bookmarksByPageId.get(bookmark.pageId) ?? []
          list.push(mapBookmark(bookmark))
          bookmarksByPageId.set(bookmark.pageId, list)
        }

        const photosByPageId = new Map<string, ReturnType<typeof mapPhoto>[]>()
        for (const photo of photos) {
          const list = photosByPageId.get(photo.pageId) ?? []
          list.push(mapPhoto(photo))
          photosByPageId.set(photo.pageId, list)
        }

        const payload = {
          story: {
            id: story.id,
            title: story.title,
            subtitle: story.subtitle ?? '',
            description: story.description ?? '',
            startDate: formatDate(story.startDate),
            targetDate: formatDate(story.targetDate),
            age: 39,
            progress: story.progress,
            status: story.status,
          },
          pages: pages.map((page) => ({
            id: page.id,
            date: page.date.toISOString().slice(0, 10),
            storyId: page.storyId,
            notes: page.notes,
            reflection: page.reflection,
            bookmarks: bookmarksByPageId.get(page.id) ?? [],
            photos: photosByPageId.get(page.id) ?? [],
            tasks: (pageTasksByPageId.get(page.id) ?? []).map((task) => ({
              id: task.id,
              title: task.title,
              completed: task.completed,
            })),
            running: page.running ?? '',
            meals: page.meals ?? '',
            yoga: page.yoga ?? '',
          })),
          tasks: tasks.map((task) => mapTask(task)),
        }

        sendJson(res, 200, payload)
      } catch (error) {
        sendJson(res, 500, {
          error: 'Failed to load app data',
          details: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    })
  },
})

const formatDate = (value: Date | null) => {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(value)
}

const ensureSeedStory = async (prisma: PrismaClientInstance) => {
  const existing = await prisma.story.findFirst({
    orderBy: { createdAt: 'asc' },
  })

  if (existing) {
    return existing
  }

  return prisma.story.create({
    data: {
      title: '4T',
      subtitle: '40 Before 40',
      description:
        'My journey to becoming the healthiest, happiest and strongest version of myself before I turn 40.',
      status: 'Not Started',
      progress: 0,
      startDate: new Date('2026-07-28T00:00:00.000Z'),
      targetDate: new Date('2027-07-28T00:00:00.000Z'),
      tasks: {
        create: [
          { title: '30 minute run', completed: false },
          { title: 'Yoga session', completed: false },
        ],
      },
      pages: {
        create: [
          {
            date: new Date('2026-07-28T00:00:00.000Z'),
            notes: '',
            reflection: '',
            running: '30-minute morning run with gentle recovery.',
            meals:
              'Breakfast: porridge and berries. Lunch: grilled salmon salad. Dinner: roasted vegetables.',
            yoga: 'A gentle 20-minute stretch and breathing session.',
          },
        ],
      },
    },
  })
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    appDataPlugin(),
  ],
})