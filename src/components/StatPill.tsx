interface StatPillProps {
  label: string
  value: string | number
  /** `end` = larger value on a cream background (end screen). */
  variant?: 'game' | 'end'
}

export function StatPill({ label, value, variant = 'game' }: StatPillProps) {
  return (
    <div className={`stat-pill stat-pill--${variant}`}>
      <span className="eyebrow">{label}</span>
      <span className="stat-pill__value">{value}</span>
    </div>
  )
}
