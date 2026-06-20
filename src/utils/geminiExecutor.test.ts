import { describe, it, expect } from 'vitest'
import { classifyError, buildThinkingConfig } from './geminiExecutor.js'

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

describe('buildThinkingConfig', () => {
  it('defaults to MEDIUM when no level provided', () => {
    expect(buildThinkingConfig().thinkingLevel).toBe('MEDIUM')
  })

  it('passes through LOW/MEDIUM/HIGH unchanged', () => {
    expect(buildThinkingConfig('LOW').thinkingLevel).toBe('LOW')
    expect(buildThinkingConfig('MEDIUM').thinkingLevel).toBe('MEDIUM')
    expect(buildThinkingConfig('HIGH').thinkingLevel).toBe('HIGH')
  })

  it('remaps MINIMAL to LOW for backward compat', () => {
    expect(buildThinkingConfig('MINIMAL' as any).thinkingLevel).toBe('LOW')
  })
})
