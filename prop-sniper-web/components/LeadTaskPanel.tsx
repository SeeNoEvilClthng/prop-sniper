'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type LeadTaskItem = {
  id: string
  title: string
  dueDate: string | null
  details: string
  status: string
  createdAt: string | null
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

export default function LeadTaskPanel({ leadId, tasks }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

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
          details,
        }),
      })

      const data = (await res.json()) as { error?: string }

      if (!res.ok) {
        setMessage(data.error || 'Could not create task')
        return
      }

      setTitle('')
      setDueDate('')
      setDetails('')
      setMessage('Task created')
      router.refresh()
    } catch (error) {
      console.error(error)
      setMessage('Could not create task')
    } finally {
      setLoading(false)
    }
  }

  async function updateTask(taskId: string, status: 'open' | 'completed') {
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
          status,
        }),
      })

      const data = (await res.json()) as { error?: string }

      if (!res.ok) {
        setMessage(data.error || 'Could not update task')
        return
      }

      setMessage(status === 'completed' ? 'Task completed' : 'Task reopened')
      router.refresh()
    } catch (error) {
      console.error(error)
      setMessage('Could not update task')
    } finally {
      setLoading(false)
    }
  }

  const openTasks = tasks.filter((task) => task.status !== 'completed')
  const completedTasks = tasks.filter((task) => task.status === 'completed')

  return (
    <div className="space-y-4 rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Lead Tasks</h2>
        <p className="mt-2 text-slate-300">
          Create concrete next steps for this lead so follow-up work does not live only in notes.
        </p>
      </div>

      <form onSubmit={createTask} className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
        <div className="grid gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title, like Call seller about roof condition"
            className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400/40"
          />
          <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/40"
            />
            <input
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Optional details or owner context"
              className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400/40"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Create Task'}
            </button>
            {message ? <p className="text-sm text-sky-200">{message}</p> : null}
          </div>
        </div>
      </form>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Open Tasks</p>
        {openTasks.length > 0 ? (
          openTasks.map((task) => (
            <div key={task.id} className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-400">Due {formatDate(task.dueDate)}</p>
                  {task.details ? (
                    <p className="mt-2 text-sm text-slate-300">{task.details}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => void updateTask(task.id, 'completed')}
                  disabled={loading}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                >
                  Complete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d1727] p-4 text-sm text-slate-400">
            No open tasks yet. Add the next action for this lead above.
          </div>
        )}
      </div>

      {completedTasks.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Completed Tasks</p>
          {completedTasks.slice(0, 4).map((task) => (
            <div key={task.id} className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-400">Due {formatDate(task.dueDate)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void updateTask(task.id, 'open')}
                  disabled={loading}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                >
                  Reopen
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
