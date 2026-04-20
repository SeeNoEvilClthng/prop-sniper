export type ParsedLeadAssignment = {
  assigneeId: string
  assigneeEmail: string
  assigneeRole: string
}

const ID_PREFIX = 'ASSIGNEE_ID::'
const EMAIL_PREFIX = 'ASSIGNEE_EMAIL::'
const ROLE_PREFIX = 'ASSIGNEE_ROLE::'

export function serializeLeadAssignment(input: ParsedLeadAssignment) {
  return [
    ID_PREFIX + input.assigneeId,
    EMAIL_PREFIX + input.assigneeEmail,
    ROLE_PREFIX + input.assigneeRole,
  ].join('\n')
}

export function parseLeadAssignmentMessage(message?: string | null): ParsedLeadAssignment {
  if (!message) {
    return {
      assigneeId: '',
      assigneeEmail: 'Unassigned',
      assigneeRole: 'user',
    }
  }

  const lines = message.split('\n')
  const idLine = lines.find((line) => line.startsWith(ID_PREFIX))
  const emailLine = lines.find((line) => line.startsWith(EMAIL_PREFIX))
  const roleLine = lines.find((line) => line.startsWith(ROLE_PREFIX))

  if (!idLine && !emailLine && !roleLine) {
    return {
      assigneeId: '',
      assigneeEmail: message,
      assigneeRole: 'user',
    }
  }

  return {
    assigneeId: idLine?.slice(ID_PREFIX.length).trim() || '',
    assigneeEmail: emailLine?.slice(EMAIL_PREFIX.length).trim() || 'Unassigned',
    assigneeRole: roleLine?.slice(ROLE_PREFIX.length).trim() || 'user',
  }
}

export function formatLeadAssignmentSummary(assignment: ParsedLeadAssignment) {
  return `Lead assigned to ${assignment.assigneeEmail}${assignment.assigneeRole ? ` (${assignment.assigneeRole})` : ''}.`
}
