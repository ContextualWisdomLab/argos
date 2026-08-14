import { spawn } from 'child_process'
import chalk from 'chalk'
import ora from 'ora'
import type { User, LoginResponse } from '@argos/shared'
import { apiRequest } from './api-client.js'

const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/
const BROWSER_PROTOCOLS = new Set(['http:', 'https:'])

/**
 * Parse and canonicalize an untrusted browser target.
 *
 * Only credential-free HTTP(S) URLs can cross the operating-system launcher
 * boundary. Raw control characters are rejected before WHATWG URL parsing can
 * trim or normalize them away.
 */
export function normalizeBrowserUrl(candidate: string): string {
  if (CONTROL_CHARACTERS.test(candidate)) {
    throw new Error('Invalid browser URL')
  }

  let parsed: URL
  try {
    parsed = new URL(candidate)
  } catch {
    throw new Error('Invalid browser URL')
  }

  if (
    !BROWSER_PROTOCOLS.has(parsed.protocol) ||
    parsed.hostname.length === 0 ||
    parsed.username.length > 0 ||
    parsed.password.length > 0
  ) {
    throw new Error('Invalid browser URL')
  }

  return parsed.href
}

function openBrowser(candidate: string): void {
  const url = normalizeBrowserUrl(candidate)

  if (process.platform === 'win32') {
    // Launch Explorer directly so untrusted URL data never crosses cmd.exe.
    const child = spawn('explorer.exe', [url], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    })
    child.unref()
  } else if (process.platform === 'darwin') {
    const child = spawn('open', [url], { detached: true, stdio: 'ignore' })
    child.unref()
  } else {
    const child = spawn('xdg-open', [url], { detached: true, stdio: 'ignore' })
    child.unref()
  }
}

/**
 * 브라우저 기반 CLI 인증 흐름
 * 1. API에서 state 토큰 발급
 * 2. 브라우저 즉시 열기
 * 3. 사용자가 웹에서 허용하면 토큰 수신
 */
export async function runLoginFlow(apiUrl: string): Promise<LoginResponse> {
  // Step 1: state 발급
  let state: string, authUrl: string
  try {
    const res = await apiRequest<{ state: string; authUrl: string }>(
      `${apiUrl}/api/auth/cli-request`,
      { method: 'POST', baseUrl: '' }
    )
    state = res.state
    authUrl = res.authUrl
  } catch (err) {
    throw new Error(`인증 요청 실패: ${err instanceof Error ? err.message : String(err)}`)
  }

  // Step 2: 브라우저 즉시 열기
  openBrowser(authUrl)
  console.log()
  console.log(`브라우저에서 허용해 주세요: ${authUrl}`)
  console.log()

  // Step 3: 승인 polling
  const spinner = ora('브라우저 로그인 대기 중...').start()

  const token = await new Promise<string>((resolve, reject) => {
    let attempts = 0
    const maxAttempts = 450 // 15분 (2초 간격)

    const interval = setInterval(async () => {
      attempts++
      if (attempts > maxAttempts) {
        clearInterval(interval)
        reject(new Error('로그인 시간이 초과되었습니다.'))
        return
      }

      try {
        const result = await apiRequest<{ pending?: boolean; denied?: boolean; token?: string }>(
          `${apiUrl}/api/auth/cli-poll?state=${state}`,
          { method: 'GET', baseUrl: '' }
        )

        if (result.denied) {
          clearInterval(interval)
          reject(new Error('로그인이 거부되었습니다.'))
        } else if (result.token) {
          clearInterval(interval)
          resolve(result.token)
        }
      } catch {
        // 일시적 오류는 무시하고 계속 polling
      }
    }, 2000)
  })

  spinner.succeed(chalk.green('✓ 로그인 완료'))

  // Step 5: 사용자 정보 조회
  const { user } = await apiRequest<{ user: User }>(`${apiUrl}/api/auth/me`, {
    method: 'GET',
    token,
    baseUrl: '',
  })

  return { token, user }
}
