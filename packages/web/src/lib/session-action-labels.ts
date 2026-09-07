import { formatSlashCommandText } from './slash-command'

/**
 * Build the accessible and pointer label for a session-delete action.
 *
 * The session title is normalized through the same slash-command formatter used
 * by the visible session title. Empty or whitespace-only normalized titles fall
 * back to the stable action name instead of producing a dangling separator.
 */
export function buildSessionDeleteLabel(title: string | null | undefined): string {
  const formattedTitle = title ? formatSlashCommandText(title) : ''
  return formattedTitle ? `세션 삭제: ${formattedTitle}` : '세션 삭제'
}
