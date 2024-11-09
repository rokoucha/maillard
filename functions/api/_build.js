const TIMER_KEY = 'called'
const TIMEOUT_MS = 1000 * 60 * 5 // 5 minutes
const WAIT_MS = 60000 // 1 minute

export async function onRequest(context) {
  const now = Date.now()

  let value = await context.env.KV.get(TIMER_KEY)

  if (value === null) {
    await context.env.KV.put(TIMER_KEY, now)
    value = now
  }

  while (now - value < TIMEOUT_MS) {
    value = await env.KV.get(TIMER_KEY)
    await new Promise((resolve) => setTimeout(resolve, WAIT_MS))
  }

  await context.env.KV.put(TIMER_KEY, now)

  return await fetch(context.env.WEBHOOK_URL, { method: 'post' })
}
