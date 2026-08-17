/** @vitest-environment jsdom */
import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CliAuthClient } from './client'

// This repository's Vitest JSX transform expects React on the global object.
global.React = React

const fetchMock = vi.fn()

function renderClient() {
  return render(
    <CliAuthClient
      state="state-token"
      userName="Ada"
      userEmail="ada@example.com"
      argosToken="argos-token"
    />
  )
}

describe('CliAuthClient actions', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('uses the shared Button contract for both CLI authorization actions', () => {
    renderClient()

    const allowButton = screen.getByRole('button', { name: '허용' })
    const denyButton = screen.getByRole('button', { name: '거부' })

    expect(allowButton).toHaveAttribute('data-slot', 'button')
    expect(denyButton).toHaveAttribute('data-slot', 'button')
    expect(allowButton.className).toContain('focus-visible:ring-3')
    expect(denyButton.className).toContain('focus-visible:ring-3')
  })

  it('does not claim denial succeeded when the callback rejects it', async () => {
    fetchMock.mockResolvedValue({ ok: false })
    renderClient()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '거부' }))
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/cli-callback', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer argos-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ state: 'state-token', denied: true }),
    })
    expect(screen.getByRole('heading', { name: '오류 발생' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '로그인 거부됨' })).not.toBeInTheDocument()
  })

  it('shows denial success only after an accepted callback response', async () => {
    fetchMock.mockResolvedValue({ ok: true })
    renderClient()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '거부' }))
    })

    expect(screen.getByRole('heading', { name: '로그인 거부됨' })).toBeInTheDocument()
  })
})
