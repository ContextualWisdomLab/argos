import { spawn } from 'child_process'
import chalk from 'chalk'
import ora from 'ora'
import type { User, LoginResponse } from '@argos/shared'
import { apiRequest } from './api-client.js'

/**
 * Open a server-provided authentication URL with the platform browser launcher.
 *
 * The URL is treated as untrusted network data. Only HTTP(S) URLs are accepted,
 * and the value is passed as a single argv element to a directly spawned program;
 * it is never interpolated into a command shell. The function detaches the
 * launcher process and does not wait for browser completion.
 *
 * @param url Authentication URL returned by the Argos API.
 * @throws {Error} If the URL is malformed or uses a non-HTTP(S) protocol.
 */
function openBrowser(url: string): void {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw new Error('유효하지 않은 인증 URL')
  }

  if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
    throw new Error('지원하지 않는 인증 URL 프로토콜')
  }

  if (process.platform === 'win32') {
    // Avoid cmd.exe entirely: shell escaping is not a security boundary for untrusted URLs.
    const child = spawn('explorer.exe', [url], { detached: true, stdio: 'ignore' })
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
 * Complete Argos CLI login through a browser-mediated authorization flow.
 *
 * The function obtains a server-generated state and authentication URL, opens
 * only an HTTP(S) URL through the platform browser launcher, polls the API for
 * authorization, and finally resolves the authenticated user. Polling tolerates
 * transient API failures but fails when the authorization is denied or the
 * bounded 15-minute polling window expires.
 *
 * @param apiUrl Base URL of the Argos API used for request, poll, and user calls.
 * @returns The issued token and authenticated user after browser authorization.
 * @throws {Error} When the initial request fails, the browser URL is invalid,
 * authorization is denied, or the polling window expires.
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
