import { describe, expect, it } from 'vitest'
import { deriveFields, truncateToolResponse } from './events'


describe('truncateToolResponse', () => {
  it('returns undefined when input is undefined', () => {
    expect(truncateToolResponse(undefined)).toBeUndefined()
  })

  it('returns undefined when input is empty string', () => {
    expect(truncateToolResponse('')).toBeUndefined()
  })

  it('returns original string when length is exactly 2000', () => {
    const str = 'a'.repeat(2000)
    expect(truncateToolResponse(str)).toBe(str)
  })

  it('returns original string when length is less than 2000', () => {
    const str = 'hello world'
    expect(truncateToolResponse(str)).toBe(str)
  })

  it('truncates string to exactly 2000 characters when length is greater than 2000', () => {
    const longStr = 'a'.repeat(2500)
    const result = truncateToolResponse(longStr)
    expect(result).toHaveLength(2000)
    expect(result).toBe('a'.repeat(2000))
  })
})

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
