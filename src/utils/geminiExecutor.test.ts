import { describe, it, expect } from 'vitest'
import { classifyError } from './geminiExecutor.js'

describe('classifyError', () => {
  it('classifies OVERLOADED as retryable', () => {
    const result = classifyError(new Error('UNAVAILABLE'))
    expect(result.code).toBe('GEMINI_OVERLOADED')
    expect(result.retryable).toBe(true)
  })

  it('classifies 503 as retryable', () => {
    const result = classifyError({ message: '503 Service Unavailable', status: 503 })
    expect(result.code).toBe('GEMINI_OVERLOADED')
    expect(result.retryable).toBe(true)
  })

  it('classifies rate limit as retryable', () => {
    const result = classifyError(new Error('rateLimitExceeded'))
    expect(result.code).toBe('GEMINI_RATE_LIMITED')
    expect(result.retryable).toBe(true)
  })

  it('classifies auth failure as non-retryable', () => {
    const result = classifyError(new Error('UNAUTHENTICATED'))
    expect(result.code).toBe('GEMINI_AUTH_FAILED')
    expect(result.retryable).toBe(false)
  })

  it('classifies unknown error as non-retryable', () => {
    const result = classifyError(new Error('something random'))
    expect(result.code).toBe('GEMINI_ERROR')
    expect(result.retryable).toBe(false)
  })
})
