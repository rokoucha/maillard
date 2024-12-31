const TIMER_KEY = 'called'
const EXCLUSIVE_KEY = 'exclusive'
const WAIT_MS = 60000 // 1 minute

interface Env {
  KV: KVNamespace
  WEBHOOK_TIMEOUT: string
  WEBHOOK_URL: string
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const now = String(Date.now())
  const exclusiveId = context.request.headers.get('cf-ray') ?? now
  const timeoutMs = Number(context.env.WEBHOOK_TIMEOUT)

  let value = await context.env.KV.get(TIMER_KEY)
  if (value === null) {
    await context.env.KV.put(TIMER_KEY, now)
    value = now
  }

  await context.env.KV.put(EXCLUSIVE_KEY, exclusiveId)

  while (Date.now() - Number(value) < timeoutMs) {
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
