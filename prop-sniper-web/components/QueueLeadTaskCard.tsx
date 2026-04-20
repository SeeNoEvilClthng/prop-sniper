'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type LeadTaskItem = {
  id: string
  title: string
  dueDate: string | null
  details: string
  status: string
}

type Props = {
  leadId: string
  tasks: LeadTaskItem[]
}

function formatDate(value?: string | null) {
  if (!value) return 'No due date'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No due date'
  return date.toLocaleDateString()
}

function isOverdue(value?: string | null) {
  if (!value) return false

  const input = new Date(value)
  if (Number.isNaN(input.getTime())) return false

  const today = new Date()
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const due = new Date(input.getFullYear(), input.getMonth(), input.getDate())
  return due <= current
}

export default function QueueLeadTaskCard({ leadId, tasks }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const openTasks = tasks.filter((task) => task.status !== 'completed')

  async function createTask(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    try {
      setLoading(true)
      setMessage('')

      const res = await fetch('/api/leads/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId,
          title,
          dueDate: dueDate || null,
          details: '',
        }),
      })

      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setMessage(data.error || 'Could not create task')
        return
      }

      setTitle('')
      setDueDate('')
      setMessage('Task added')
      router.refresh()
    } catch (error) {
      console.error(error)
      setMessage('Could not create task')
    } finally {
      setLoading(false)
    }
  }

  async function completeTask(taskId: string) {
    try {
      setLoading(true)
      setMessage('')

      const res = await fetch('/api/leads/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          status: 'completed',
        }),
      })

      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setMessage(data.error || 'Could not complete task')
        return
      }

      setMessage('Task completed')
      router.refresh()
    } catch (error) {
      console.error(error)
      setMessage('Could not complete task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Lead Tasks</p>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
          {openTasks.length} open
        </span>
      </div>

      <form onSubmit={createTask} className="mt-4 grid gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add next task..."
          className="w-full rounded-xl border border-white/10 bg-[#07111f] px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400/40"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#07111f] px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/40"
          />
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </form>

      <div className="mt-4 space-y-2">
        {openTasks.length > 0 ? (
          openTasks.slice(0, 3).map((task) => (
            <div key={task.id} className="rounded-xl border border-white/10 bg-[#07111f] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{task.title}</p>
                  <p
                    className={`mt-1 text-xs ${
                      isOverdue(task.dueDate) ? 'text-rose-300' : 'text-slate-400'
                    }`}
                  >
                    Due {formatDate(task.dueDate)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void completeTask(task.id)}
                  disabled={loading}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                >
                  Done
                </button>
              </div>
              {task.details ? <p className="mt-2 text-xs text-slate-400">{task.details}</p> : null}
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#07111f] p-3 text-xs text-slate-400">
            No open tasks yet for this lead.
          </div>
        )}
      </div>

      {message ? <p className="mt-3 text-xs text-sky-200">{message}</p> : null}
    </div>
  )
}
