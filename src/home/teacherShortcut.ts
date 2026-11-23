/** The keys a keydown event needs to be the teacher shortcut. */
export type ShortcutKeys = Pick<KeyboardEvent, 'code' | 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey' | 'repeat'>

/**
 * Ctrl + Alt + P opens the teacher login (there is no visible « Profesora » link, so students are not tempted).
 * `code` is the physical key, so it works the same on AZERTY, QWERTY and Spanish keyboards,
 * and even though Ctrl + Alt is AltGr on Windows (which changes `key`).
 */
export function isTeacherShortcut(event: ShortcutKeys): boolean {
  return event.code === 'KeyP' && event.ctrlKey && event.altKey && !event.shiftKey && !event.metaKey && !event.repeat
}
