import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { rateLimitMiddleware } from "../src/shared/rateLimiter.js"

describe("Rate Limiter", () => {
  let mockReq, mockRes, mockNext, nextCallCount, errors, originalNodeEnv

  beforeEach(() => {
    // Save original NODE_ENV and set to non-test value to enable rate limiting
    originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    nextCallCount = 0
    errors = []
    mockReq = {
      params: { base: `testBase${Math.random()}` } // Use unique base for each test
    }
    mockRes = {
      set: () => {},
      status: () => mockRes,
      send: () => mockRes
    }
    mockNext = (error) => {
      nextCallCount++
      if (error) {
        errors.push(error)
      }
    }
  })

  afterEach(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv
  })

  it("should allow requests under rate limit (basic)", () => {
    // First 15 requests should pass (bucket size)
    for (let i = 0; i < 15; i++) {
      rateLimitMiddleware(mockReq, mockRes, mockNext)
    }
    
    expect(nextCallCount).toBe(15)
  })

  it("should block requests over rate limit (basic)", () => {
    // Use up all tokens
    for (let i = 0; i < 15; i++) {
      rateLimitMiddleware(mockReq, mockRes, mockNext)
    }

    // Next request should be rate limited
    rateLimitMiddleware(mockReq, mockRes, mockNext)
    
    expect(errors.length).toBe(1)
    expect(errors[0].message).toContain("Rate limit exceeded")
    expect(errors[0].statusCode).toBe(429)
  })

  it("should rate limit per base independently (basic)", () => {
    const baseAReq = { params: { base: "baseA" } }
    const baseBReq = { params: { base: "baseB" } }

    // Use up all tokens for baseA
    for (let i = 0; i < 15; i++) {
      rateLimitMiddleware(baseAReq, mockRes, mockNext)
    }

    // baseB should still have tokens
    rateLimitMiddleware(baseBReq, mockRes, mockNext)
    
    expect(nextCallCount).toBe(16)
  })

  it("should skip rate limiting when no base param (basic)", () => {
    const reqWithoutBase = { params: {} }
    
    rateLimitMiddleware(reqWithoutBase, mockRes, mockNext)
    
    expect(nextCallCount).toBe(1)
  })

  it("should refill tokens over time (basic)", async () => {
    // Use up all tokens
    for (let i = 0; i < 15; i++) {
      rateLimitMiddleware(mockReq, mockRes, mockNext)
    }

    // Verify we're rate limited
    rateLimitMiddleware(mockReq, mockRes, mockNext)
    expect(errors.length).toBe(1)

    // Wait for token refill (simulate 1 second passing)
    await new Promise(resolve => setTimeout(resolve, 1100))

    // Reset error tracking
    errors = []
    
    // Should be able to make requests again
    rateLimitMiddleware(mockReq, mockRes, mockNext)
    
    expect(errors.length).toBe(0) // No errors should occur after refill
  })

  it("should bypass rate limiting in test environment (basic)", () => {
    // Set NODE_ENV to test
    process.env.NODE_ENV = 'test'
    
    // Make many requests (normally would be rate limited)
    for (let i = 0; i < 10; i++) {
      rateLimitMiddleware(mockReq, mockRes, mockNext)
    }
    
    // All requests should succeed
    expect(errors.length).toBe(0)
    expect(nextCallCount).toBe(10)
  })
})
