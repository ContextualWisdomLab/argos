'use client'

import { useState, useEffect } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpdateProject } from '@/hooks/use-update-project'

interface RenameProjectModalProps {
  project: { id: string; name: string } | null
  onClose: () => void
}

export function RenameProjectModal({
  project,
  onClose,
}: RenameProjectModalProps) {
  const [name, setName] = useState('')
  const mutation = useUpdateProject(project?.id ?? '')

  // project 객체가 바뀔 때 name 상태를 동기화하기 위해 key를 사용하는 방식으로 우회하거나,
  // 모달이 열릴 때 name을 설정하도록 할 수도 있습니다.
  // 여기서는 key를 사용하여 파생 상태를 강제 초기화하거나 Effect를 사용할 수 없으므로,
  // 렌더링 중 상태를 업데이트하는 방식을 사용합니다.
  const [prevProject, setPrevProject] = useState(project)
  if (project !== prevProject) {
    setPrevProject(project)
    if (project) {
      setName(project.name)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (next) return
    if (mutation.isPending) return
    setName('')
    mutation.reset()
    onClose()
  }

  const trimmed = name.trim()
  const canSubmit =
    !!project &&
    trimmed.length > 0 &&
    trimmed !== project.name &&
    !mutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!project || !canSubmit) return
    mutation.mutate(
      { name: trimmed },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  const errorMessage = mutation.isError
    ? mutation.error instanceof Error && mutation.error.message
      ? mutation.error.message
      : '프로젝트 이름을 변경하지 못했습니다. 잠시 후 다시 시도해주세요.'
    : null

  return (
    <AlertDialog open={project !== null} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle>프로젝트 이름 변경</AlertDialogTitle>
            <AlertDialogDescription>
              프로젝트의 새 이름을 입력해주세요. slug (URL) 은 변경되지 않습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="rename-project-name">프로젝트 이름</Label>
            <Input
              id="rename-project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={project?.name ?? ''}
              autoFocus
              disabled={mutation.isPending}
              autoComplete="off"
              aria-invalid={!!errorMessage || undefined}
              aria-describedby={errorMessage ? "rename-project-error" : undefined}
            />
            {errorMessage && (
              <p id="rename-project-error" role="alert" className="text-xs text-destructive">{errorMessage}</p>
            )}
          </div>

          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={mutation.isPending}
              onClick={onClose}
            >
              취소
            </Button>
            <Button type="submit" size="sm" disabled={!canSubmit}>
              {mutation.isPending ? '변경 중…' : '변경'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
