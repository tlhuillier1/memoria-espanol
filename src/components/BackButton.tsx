import { Icon } from './Icon'

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="back-button push" onClick={onClick}>
      <Icon name="arrow-left" size={20} strokeWidth={2.4} />
      Temas
    </button>
  )
}
