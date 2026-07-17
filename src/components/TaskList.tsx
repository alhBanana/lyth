import type { EntityId, TaskEntry } from '../types'

type TaskListProps = {
  tasks: TaskEntry[]
  onToggle: (taskId: EntityId) => void
}

export default function TaskList({ tasks, onToggle }: TaskListProps) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <button
          key={task.id}
          type="button"
          onClick={() => onToggle(task.id)}
          className="flex w-full items-center justify-between rounded-[1.5rem] border border-[#E8E4DD] bg-white p-4 text-left text-sm text-slate-700 transition hover:border-[#2F5D50]"
        >
          <span className="flex items-center gap-3">
            <span
              className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                task.completed ? 'border-[#2F5D50] bg-[#2F5D50]' : 'border-[#CBD5E1] bg-white'
              }`}
            >
              {task.completed ? '✓' : ''}
            </span>
            {task.title}
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#2F5D50]/80">
            {task.completed ? 'Done' : 'Todo'}
          </span>
        </button>
      ))}
      {tasks.length === 0 ? (
        <div className="rounded-[1.5rem] bg-[#FAF8F4] p-4 text-sm leading-7 text-slate-600">
          No tasks found for today.
        </div>
      ) : null}
    </div>
  )
}
