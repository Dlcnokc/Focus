import { describe, expect, it } from 'vitest'
import {
  MAX_CARD_TITLE_LENGTH,
  clampCardTitle,
  normalizeCardTitle,
  validateCardTitle,
} from './cardTitle'

describe('validateCardTitle', () => {
  it('rejects empty string', () => {
    expect(validateCardTitle('')).toBe('Title is required.')
  })

  it('rejects whitespace-only', () => {
    expect(validateCardTitle('   ')).toBe('Title is required.')
    expect(validateCardTitle('\t\n')).toBe('Title is required.')
  })

  it('rejects titles over 20 characters', () => {
    const tooLong = 'a'.repeat(MAX_CARD_TITLE_LENGTH + 1)
    expect(validateCardTitle(tooLong)).toBe(
      `Title must be ${MAX_CARD_TITLE_LENGTH} characters or fewer.`,
    )
  })

  it('accepts titles at the max length (after trim)', () => {
    const exact = 'a'.repeat(MAX_CARD_TITLE_LENGTH)
    expect(validateCardTitle(exact)).toBeNull()
    expect(validateCardTitle(`  ${exact}  `)).toBeNull()
  })
})

describe('normalizeCardTitle', () => {
  it('trims without truncating', () => {
    expect(normalizeCardTitle('  hello  ')).toBe('hello')
    const long = 'x'.repeat(30)
    expect(normalizeCardTitle(`  ${long}  `)).toBe(long)
  })
})

describe('clampCardTitle', () => {
  it('trims and clamps to max length', () => {
    expect(clampCardTitle('  short  ')).toBe('short')
    const long = 'abcdefghij1234567890EXTRA'
    expect(clampCardTitle(long)).toBe('abcdefghij1234567890')
    expect(clampCardTitle(long).length).toBe(MAX_CARD_TITLE_LENGTH)
  })

  it('returns empty string for whitespace-only', () => {
    expect(clampCardTitle('   ')).toBe('')
  })
})
