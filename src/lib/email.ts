type Email = { to: string; subject: string; text: string; replyTo?: string }

/**
 * Sends email through Resend's HTTP API. Without RESEND_API_KEY (development, tests) the
 * message is written to the server log instead. Returns whether delivery was accepted.
 */
export async function sendEmail(email: Email): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL || 'Beauty of Bharat <noreply@thebeautyofbharat.com>'
  if (!key) {
    console.info(`[email:log] To: ${email.to}\nSubject: ${email.subject}\n\n${email.text}`)
    return true
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [email.to],
        subject: email.subject,
        text: email.text,
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) console.error(`[email] Resend responded ${res.status}: ${await res.text()}`)
    return res.ok
  } catch (error) {
    console.error('[email] Resend request failed', error)
    return false
  }
}

/** Verifies a Cloudflare Turnstile token. Skipped (true) when Turnstile isn't configured. */
export async function verifyTurnstile(token: string | null, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false
  try {
    const body = new URLSearchParams({ secret, response: token })
    if (ip) body.set('remoteip', ip)
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(8_000),
    })
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}
