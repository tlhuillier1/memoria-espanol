import { GRADES, type Grade } from '../types'

const KEY = 'memoria-grade'
const DEFAULT_GRADE: Grade = '5e'

/** Grade chosen on the home screen, remembered on the device. */
export function loadGrade(): Grade {
  try {
    const value = window.localStorage.getItem(KEY)
    return GRADES.find((g) => g === value) ?? DEFAULT_GRADE
  } catch {
    return DEFAULT_GRADE
  }
}

export function saveGrade(grade: Grade): void {
  try {
    window.localStorage.setItem(KEY, grade)
  } catch {
    // Storage blocked: the choice simply won't survive a reload.
  }
}
