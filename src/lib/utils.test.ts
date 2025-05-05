import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('class1', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('handles conditional classes', () => {
    const result = cn('class1', { 'class2': true, 'class3': false })
    expect(result).toBe('class1 class2')
  })

  it('handles falsy values', () => {
    const result = cn('class1', null, undefined, false, 0, '')
    expect(result).toBe('class1')
  })

  it('handles multiple conditions', () => {
    const result = cn(
      'base-class',
      { 'active': true, 'disabled': false },
      'extra',
      { 'dark': true, 'light': false }
    )
    expect(result).toBe('base-class active extra dark')
  })

  it('preserves order of class names', () => {
    const result = cn('first', 'second', 'third')
    expect(result).toBe('first second third')
  })

  it('handles array inputs', () => {
    const result = cn(['class1', 'class2'], 'class3')
    expect(result).toBe('class1 class2 class3')
  })
})