import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import Card from '../components/Card'
import SectionHeading from '../components/SectionHeading'
import { collections } from '../utils/constants'

export default function Collection() {
  const { id } = useParams()

  const collection = useMemo(() => {
    return collections.find((item) => item.id === id)
  }, [id])

  if (!collection) {
    return (
      <div className="space-y-6">
        <SectionHeading title="Collection not found" subtitle="Choose a collection from the current story hub." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <SectionHeading title={collection.title} subtitle={collection.detail} />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">Overview</p>
            <p className="text-sm leading-7 text-slate-600">
              This collection is a focused workspace for {collection.title.toLowerCase()}, including notes, planning, and progress signals.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-[#F8F5EF] p-4 text-sm font-medium text-slate-950">Items · {collection.count}</div>
              <div className="rounded-[1.5rem] bg-[#F8F5EF] p-4 text-sm font-medium text-slate-950">Focus · {collection.title}</div>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">Quick notes</p>
          <div className="mt-5 rounded-[1.5rem] bg-[#FAF8F4] p-5 text-sm leading-7 text-slate-600">
            No items yet. Add a note, task, or progress marker to make this collection feel alive.
          </div>
        </Card>
      </div>
    </div>
  )
}
