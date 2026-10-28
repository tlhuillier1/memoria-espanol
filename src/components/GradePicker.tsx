import { GRADES, type Grade } from '../types'

interface GradePickerProps {
  value: Grade
  onChange: (grade: Grade) => void
  /** Optional line under each grade (theme counts on the home screen). */
  detail?: (grade: Grade) => string
  /** `small` = compact buttons of the theme form. */
  size?: 'large' | 'small'
}

/** Three toggle buttons 5e / 4e / 3e, one pressed at a time. */
export function GradePicker({ value, onChange, detail, size = 'large' }: GradePickerProps) {
  return (
    <div className={`grade-picker grade-picker--${size}`}>
      {GRADES.map((grade) => (
        <button
          key={grade}
          type="button"
          className="grade-picker__button push"
          aria-pressed={grade === value}
          onClick={() => onChange(grade)}
        >
          <span className="grade-picker__label">{grade}</span>
          {detail && <span className="grade-picker__detail">{detail(grade)}</span>}
        </button>
      ))}
    </div>
  )
}
