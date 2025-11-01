/**
 * Rate limiter using token bucket algorithm
 * Limits requests per base to 5 req/sec globally (w/ small burst capacity)
 */

const rateLimiters = new Map()

const RATE_LIMIT = 5 // communicate requests per second in header
const BUCKET_SIZE = 15 // max tokens
const REFILL_RATE = 5 // tokens per second

class TokenBucket {
  constructor(capacity = BUCKET_SIZE, refillRate = REFILL_RATE) {
    this.capacity = capacity
    this.tokens = capacity
    this.refillRate = refillRate
    this.lastRefill = Date.now()
  }

  refill() {
    const now = Date.now()
    const timePassed = (now - this.lastRefill) / 1000
    const tokensToAdd = Math.floor(timePassed * this.refillRate)

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd)
      this.lastRefill = now
    }
  }

  consume() {
    this.refill()
    if (this.tokens > 0) {
      this.tokens--
      return true
    }
    return false
  }

  getTokens() {
    this.refill()
    return this.tokens
  }
}

export function rateLimitMiddleware(req, res, next) {
  // Skip rate limiting in test environment
  if (process.env.NODE_ENV === "test") {
    return next()
  }

  const base = req.params.base

  if (!base) {
    return next()
  }

  if (!rateLimiters.has(base)) {
    rateLimiters.set(base, new TokenBucket())
  }

  const bucket = rateLimiters.get(base)

  if (bucket.consume()) {
    // Add rate limit headers
    res.set({
      "X-RateLimit-Limit": RATE_LIMIT,
      "X-RateLimit-Remaining": bucket.getTokens(),
      "X-RateLimit-Reset": new Date(Date.now() + 1000).toISOString(),
    })
    next()
  } else {
    // Rate limit exceeded
    res.set({
      "X-RateLimit-Limit": RATE_LIMIT,
      "X-RateLimit-Remaining": 0,
      "X-RateLimit-Reset": new Date(Date.now() + 1000).toISOString(),
      "Retry-After": "1",
    })

    const error = new Error(
      `Rate limit exceeded for base '${base}'. Limit: ${RATE_LIMIT} requests per second.`
    )
    error.statusCode = 429
    next(error)
  }
}
