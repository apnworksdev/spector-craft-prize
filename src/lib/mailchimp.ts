export const MAILCHIMP = {
  u: '20291dd87724adbf391ebbe4e',
  id: '68698bbbc9',
  fId: '003aa3e0f0',
  // Same honeypot name as spectorcraftprize.org (Mailchimp bot field).
  honeypot: 'b_0370df5775065289839a5ca18_aa7cfa004a',
  cookie: 'newsletter_closed',
} as const

const JSONP_URL = `https://spectorcraftprize.us15.list-manage.com/subscribe/post-json`

export function getCookie(name: string) {
  if (typeof document === 'undefined') {
    return null
  }

  const match = document.cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))
  return match ? match.slice(name.length + 1) : null
}

export function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
}

export function subscribeToNewsletter(form: HTMLFormElement) {
  return new Promise<{ result: string; msg: string }>((resolve, reject) => {
    const callback = `mcCallback_${Date.now()}`
    const params = new URLSearchParams({
      u: MAILCHIMP.u,
      id: MAILCHIMP.id,
      f_id: MAILCHIMP.fId,
      c: callback,
    })

    for (const [key, value] of new FormData(form).entries()) {
      if (typeof value === 'string') {
        params.append(key, value)
      }
    }

    const script = document.createElement('script')

    const cleanup = () => {
      delete (window as unknown as Record<string, unknown>)[callback]
      script.remove()
    }

    ;(window as unknown as Record<string, (data: { result: string; msg: string }) => void>)[callback] = (data) => {
      cleanup()
      resolve(data)
    }

    script.src = `${JSONP_URL}?${params.toString()}`
    script.onerror = () => {
      cleanup()
      reject(new Error('Newsletter request failed'))
    }
    document.body.appendChild(script)
  })
}
