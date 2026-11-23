import { describe, expect, it } from 'vitest'
import { isTeacherShortcut, type ShortcutKeys } from './teacherShortcut'

const keys = (overrides: Partial<ShortcutKeys>): ShortcutKeys => ({
  code: 'KeyP',
  ctrlKey: true,
  altKey: true,
  shiftKey: false,
  metaKey: false,
  repeat: false,
  ...overrides,
})

describe('teacher shortcut', () => {
  it('opens on Ctrl + Alt + P', () => {
    expect(isTeacherShortcut(keys({}))).toBe(true)
  })

  it('ignores other keys and partial combinations', () => {
    expect(isTeacherShortcut(keys({ code: 'KeyO' }))).toBe(false)
    expect(isTeacherShortcut(keys({ ctrlKey: false }))).toBe(false)
    expect(isTeacherShortcut(keys({ altKey: false }))).toBe(false)
    expect(isTeacherShortcut(keys({ shiftKey: true }))).toBe(false)
    expect(isTeacherShortcut(keys({ metaKey: true }))).toBe(false)
  })

  it('does not reopen while the keys are held down', () => {
    expect(isTeacherShortcut(keys({ repeat: true }))).toBe(false)
  })
})
