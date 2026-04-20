export type ParsedLeadTask = {
  title: string
  dueDate: string | null
  details: string
}

const TITLE_PREFIX = 'TITLE::'
const DUE_PREFIX = 'DUE::'
const DETAILS_PREFIX = 'DETAILS::'

export function serializeLeadTask(input: ParsedLeadTask) {
  return [TITLE_PREFIX + input.title, DUE_PREFIX + (input.dueDate || ''), DETAILS_PREFIX + input.details]
    .join('\n')
    .trim()
}

export function parseLeadTaskMessage(message?: string | null): ParsedLeadTask {
  if (!message) {
    return {
      title: 'Untitled task',
      dueDate: null,
      details: '',
    }
  }

  const lines = message.split('\n')
  const titleLine = lines.find((line) => line.startsWith(TITLE_PREFIX))
  const dueLine = lines.find((line) => line.startsWith(DUE_PREFIX))
  const detailsLine = lines.find((line) => line.startsWith(DETAILS_PREFIX))

  if (!titleLine && !dueLine && !detailsLine) {
    return {
      title: message,
      dueDate: null,
      details: '',
    }
  }

  return {
    title: titleLine?.slice(TITLE_PREFIX.length).trim() || 'Untitled task',
    dueDate: dueLine?.slice(DUE_PREFIX.length).trim() || null,
    details: detailsLine?.slice(DETAILS_PREFIX.length).trim() || '',
  }
}

export function formatLeadTaskSummary(task: ParsedLeadTask) {
  const due = task.dueDate ? `Due ${task.dueDate}.` : 'No due date.'
  return `${task.title}. ${due}${task.details ? ` ${task.details}` : ''}`.trim()
}
