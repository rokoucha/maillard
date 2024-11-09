const TIMER_KEY = 'called'
const EXCLUSIVE_KEY = 'exclusive'
const TIMEOUT_MS = 1000 * 60 * 5 // 5 minutes
const WAIT_MS = 60000 // 1 minute

export async function onRequest(context) {
  const now = Date.now()
  const exclusiveId = context.request.headers.get('cf-ray')

  let value = await context.env.KV.get(TIMER_KEY)

  if (value === null) {
    await context.env.KV.put(TIMER_KEY, now)
    value = now
  }

  await context.env.KV.put(EXCLUSIVE_KEY, exclusiveId)

  while (Date.now() - value < TIMEOUT_MS) {
    await new Promise((resolve) => setTimeout(resolve, WAIT_MS))

    const e = await context.env.KV.get(EXCLUSIVE_KEY)
    if (e !== exclusiveId) {
      return new Response('Exclusive lock lost', { status: 200 })
    }
  }

  await context.env.KV.delete(TIMER_KEY)
  await context.env.KV.delete(EXCLUSIVE_KEY)

  return await fetch(context.env.WEBHOOK_URL, { method: 'post' })
}
