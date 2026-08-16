'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Copy, Link2, LogIn, LogOut, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type AdminUser = {
  id: string
  email: string
  name: string
  createdAt: string
  memberships: Array<{
    role: string
    organization: {
      name: string
      slug: string
    }
  }>
}

type ResetLink = {
  url: string
  path: string
  expiresAt: string
}

const UNABLE_TO_LOAD_USERS =
  'Unable to load users. Retry the search or refresh the admin page.'
const UNABLE_TO_CREATE_RESET_LINK =
  'Unable to create reset link. Create the reset link again for the customer now selected.'
const UNABLE_TO_OPEN_DASHBOARD =
  'Unable to open dashboard as selected user. Start Open dashboard as user again from the customer now selected.'

/**
 * Map an API-supplied impersonation URL to a same-origin navigation target.
 *
 * The only accepted value is `/admin/impersonate` on the current origin with a
 * single `token` query parameter. The token must be non-empty and must not
 * contain whitespace after WHATWG decoding. Userinfo, hash, extra query keys,
 * and any other origin or path are rejected.
 *
 * @param candidate - Value from `impersonationUrl` in the admin API response
 * @param origin - Trusted `window.location.origin` of the admin page
 * @returns Absolute href to assign, or `null` when the candidate is not allow-listed
 */
export function resolveImpersonationNavigationTarget(candidate: unknown, origin: string) {
  if (typeof candidate !== 'string' || candidate.length === 0) return null

  try {
    const trustedOrigin = new URL(origin)
    const target = new URL(candidate, trustedOrigin)
    if (target.origin !== trustedOrigin.origin) return null
    if (target.pathname !== '/admin/impersonate') return null
    if (target.username || target.password) return null
    if (target.hash) return null

    const searchKeys = [...target.searchParams.keys()]
    if (searchKeys.length !== 1 || searchKeys[0] !== 'token') return null

    const token = target.searchParams.get('token')
    if (!token || /\s/.test(token)) return null

    return target.href
  } catch {
    return null
  }
}

export function AdminDashboard() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [creatingLink, setCreatingLink] = useState(false)
  const [openingDashboard, setOpeningDashboard] = useState(false)
  const [resetLink, setResetLink] = useState<ResetLink | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const copyResetTimer = useRef<number | null>(null)
  const actionGeneration = useRef(0)
  const selectedUserIdRef = useRef<string | null>(null)
  selectedUserIdRef.current = selectedUserId

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users]
  )

  function clearCopyResetTimer() {
    if (copyResetTimer.current !== null) {
      window.clearTimeout(copyResetTimer.current)
      copyResetTimer.current = null
    }
  }

  function bumpActionGeneration() {
    clearCopyResetTimer()
    return ++actionGeneration.current
  }

  function isCurrentAction(generation: number) {
    return actionGeneration.current === generation
  }

  function discardInFlightAdminWork() {
    bumpActionGeneration()
    setResetLink(null)
    setCopied(false)
    setCreatingLink(false)
    setOpeningDashboard(false)
    setError('')
  }

  useEffect(() => () => {
    bumpActionGeneration()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoadingUsers(true)
      setError('')

      try {
        const params = new URLSearchParams()
        if (query.trim()) params.set('query', query.trim())
        const res = await fetch(`/api/admin/users?${params.toString()}`, {
          signal: controller.signal,
        })
        if (!res.ok) {
          setError(UNABLE_TO_LOAD_USERS)
          return
        }
        const data = (await res.json()) as { users: AdminUser[] }
        const current = selectedUserIdRef.current
        const nextSelectedUserId =
          current && data.users.some((user) => user.id === current)
            ? current
            : (data.users[0]?.id ?? null)
        if (nextSelectedUserId !== current) {
          discardInFlightAdminWork()
        }
        setUsers(data.users)
        setSelectedUserId(nextSelectedUserId)
      } catch (err) {
        if ((err as { name?: string }).name !== 'AbortError') {
          setError(UNABLE_TO_LOAD_USERS)
        }
      } finally {
        setLoadingUsers(false)
      }
    }, 200)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query])

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.refresh()
  }

  async function handleCreateLink() {
    if (!selectedUserId) return

    const generation = bumpActionGeneration()
    setCreatingLink(true)
    setResetLink(null)
    setCopied(false)
    setError('')

    try {
      const res = await fetch('/api/admin/password-reset-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId }),
      })
      if (!isCurrentAction(generation)) return
      if (!res.ok) {
        setError(UNABLE_TO_CREATE_RESET_LINK)
        return
      }

      const data = (await res.json()) as ResetLink
      if (!isCurrentAction(generation)) return
      setResetLink(data)
    } catch {
      if (!isCurrentAction(generation)) return
      setError(UNABLE_TO_CREATE_RESET_LINK)
    } finally {
      if (isCurrentAction(generation)) {
        setCreatingLink(false)
      }
    }
  }

  async function handleOpenDashboardAsUser() {
    if (!selectedUserId) return

    const generation = bumpActionGeneration()
    setOpeningDashboard(true)
    setError('')

    try {
      const res = await fetch('/api/admin/impersonation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId }),
      })
      if (!isCurrentAction(generation)) return
      if (!res.ok) {
        setError(UNABLE_TO_OPEN_DASHBOARD)
        return
      }

      const data = (await res.json()) as { impersonationUrl?: unknown }
      const navigationTarget = resolveImpersonationNavigationTarget(
        data.impersonationUrl,
        window.location.origin
      )
      if (!isCurrentAction(generation)) return
      if (!navigationTarget) {
        setError(UNABLE_TO_OPEN_DASHBOARD)
        return
      }
      window.location.assign(navigationTarget)
    } catch {
      if (!isCurrentAction(generation)) return
      setError(UNABLE_TO_OPEN_DASHBOARD)
    } finally {
      if (isCurrentAction(generation)) {
        setOpeningDashboard(false)
      }
    }
  }

  async function handleCopy() {
    if (!resetLink) return

    const generation = bumpActionGeneration()
    setError('')

    try {
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable')
      await navigator.clipboard.writeText(resetLink.url)
      if (!isCurrentAction(generation)) return

      setCopied(true)
      copyResetTimer.current = window.setTimeout(() => {
        setCopied(false)
        copyResetTimer.current = null
      }, 2000)
    } catch {
      if (!isCurrentAction(generation)) return
      setCopied(false)
      setError('Unable to copy reset link. Select the generated link and copy it manually.')
    }
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">Admin</h1>
            <p className="text-sm text-muted-foreground">
              Search customers and issue one-time password reset links.
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </Button>
        </header>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Request failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-search">Customers</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="customer-search"
                  className="pl-9"
                  placeholder="Search by name or email"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border bg-background">
              <div className="grid grid-cols-[minmax(0,1fr)_160px] border-b bg-muted/50 px-4 py-2 text-xs font-medium uppercase text-muted-foreground">
                <span>User</span>
                <span>Joined</span>
              </div>
              <div className="divide-y">
                {loadingUsers ? (
                  <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : users.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No customers found
                  </div>
                ) : (
                  users.map((user) => {
                    const selected = user.id === selectedUserId
                    return (
                      <button
                        key={user.id}
                        type="button"
                        aria-pressed={selected}
                        className={`grid w-full grid-cols-[minmax(0,1fr)_160px] px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring hover:bg-muted/60 ${selected ? 'bg-primary/10' : 'bg-background'}`}
                        onClick={() => {
                          discardInFlightAdminWork()
                          setSelectedUserId(user.id)
                        }}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{user.name}</span>
                          <span className="block truncate text-sm text-muted-foreground">
                            {user.email}
                          </span>
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Password reset</CardTitle>
              <CardDescription>Create a link that expires after 24 hours.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedUser ? (
                <>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="truncate text-sm font-medium">{selectedUser.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{selectedUser.email}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {selectedUser.memberships.length > 0
                        ? selectedUser.memberships
                            .map((membership) => `${membership.organization.name} (${membership.role})`)
                            .join(', ')
                        : 'No organization memberships'}
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleOpenDashboardAsUser}
                    disabled={openingDashboard}
                  >
                    <LogIn className="size-4" aria-hidden="true" />
                    {openingDashboard ? 'Opening...' : 'Open dashboard as user'}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleCreateLink}
                    disabled={creatingLink}
                  >
                    <Link2 className="size-4" aria-hidden="true" />
                    {creatingLink ? 'Creating...' : 'Create reset link'}
                  </Button>

                  {resetLink && (
                    <div className="space-y-3 rounded-lg border bg-background p-3">
                      <div className="space-y-1">
                        <Label htmlFor="reset-link">Generated link</Label>
                        <Input id="reset-link" value={resetLink.url} readOnly />
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        aria-label="Copy reset link"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <Check className="size-4" aria-hidden="true" />
                        ) : (
                          <Copy className="size-4" aria-hidden="true" />
                        )}
                        <span aria-hidden="true">Copy link</span>
                      </Button>
                      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                        {copied ? 'Reset link copied.' : ''}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Expires {new Date(resetLink.expiresAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Select a customer first.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
