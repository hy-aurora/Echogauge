type Key = string

type Bucket = {
  timestamps: number[]
}

const store: Map<string, Bucket> = (globalThis as any).__eg_rl_store__ || new Map()
;(globalThis as any).__eg_rl_store__ = store

export function rateLimit(opts: { key: Key; limit: number; windowMs: number }) {
  const now = Date.now()
  const bucket = store.get(opts.key) || { timestamps: [] }
  // prune old timestamps
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < opts.windowMs)
  if (bucket.timestamps.length >= opts.limit) {
    const retryAfterMs = opts.windowMs - (now - bucket.timestamps[0])
    store.set(opts.key, bucket)
    return { ok: false, retryAfterSec: Math.ceil(retryAfterMs / 1000) }
  }
  bucket.timestamps.push(now)
  store.set(opts.key, bucket)
  return { ok: true, retryAfterSec: 0 }
}
