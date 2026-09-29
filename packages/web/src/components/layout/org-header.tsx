'use client'

import { signOut } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ProjectFilter } from './project-filter'

export function OrgHeader({ orgName }: { orgName?: string }) {
  return (
    <header className="border-b bg-background">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold">
            {orgName || 'Dashboard'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ProjectFilter />
                    <SignOutButton />
        </div>
      </div>
    </header>
  )
}


function SignOutButton() {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      variant="outline"
      onClick={async () => {
        setLoading(true);
        await signOut({ callbackUrl: '/login' });
      }}
      disabled={loading}
      aria-label="Sign out of your account"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          Signing out...
        </>
      ) : (
        'Sign out'
      )}
    </Button>
  );
}