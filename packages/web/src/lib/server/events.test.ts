import { describe, expect, it } from 'vitest'
import { deriveFields, truncateMessageContent } from './events'

describe('deriveFields', () => {
  it('marks normalized slash commands as skill calls', () => {
    expect(
      deriveFields({
        projectId: 'project-1',
        sessionId: 'session-1',
        hookEventName: 'SESSION_START',
        isSlashCommand: true,
        toolInput: { skill: 'new-task-doc' },
      })
    ).toMatchObject({
      isSkillCall: true,
      skillName: 'new-task-doc',
      isSlashCommand: true,
    })
  })

  it('keeps ordinary SessionStart events out of skill aggregates', () => {
    expect(
      deriveFields({
        projectId: 'project-1',
        sessionId: 'session-1',
        hookEventName: 'SESSION_START',
      })
    ).toMatchObject({
      isSkillCall: false,
      skillName: null,
      isSlashCommand: false,
    })
  })

  it('marks Task tool calls with subagent_type as agent calls', () => {
    expect(
      deriveFields({
        projectId: 'project-1',
        sessionId: 'session-1',
        hookEventName: 'PRE_TOOL_USE',
        toolName: 'Task',
        toolInput: {
          subagent_type: 'code-reviewer',
          description: 'Review recent changes',
        },
      })
    ).toMatchObject({
      isAgentCall: true,
      agentType: 'code-reviewer',
      agentDesc: 'Review recent changes',
    })
  })

  it('keeps ordinary Task tool calls out of agent aggregates', () => {
    expect(
      deriveFields({
        projectId: 'project-1',
        sessionId: 'session-1',
        hookEventName: 'PRE_TOOL_USE',
        toolName: 'Task',
        toolInput: { prompt: 'do work' },
      })
    ).toMatchObject({
      isAgentCall: false,
      agentType: null,
      agentDesc: null,
    })
  })
})


describe('truncateMessageContent', () => {
  it('returns content as-is if length is less than 50000', () => {
    const content = 'a'.repeat(49999)
    expect(truncateMessageContent(content)).toBe(content)
  })

  it('returns content as-is if length is exactly 50000', () => {
    const content = 'b'.repeat(50000)
    expect(truncateMessageContent(content)).toBe(content)
  })

  it('truncates content to 50000 characters if length is greater than 50000', () => {
    const content = 'c'.repeat(50001)
    const truncated = truncateMessageContent(content)
    expect(truncated).toHaveLength(50000)
    expect(truncated).toBe('c'.repeat(50000))
  })
})
