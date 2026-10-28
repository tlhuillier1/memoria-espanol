import { Icon } from '../components/Icon'
import { ThemeImage } from '../components/ThemeImage'
import { imageUrl } from '../lib/assets'
import { splitArticle } from '../lib/words'
import { cardLabel, nounFontSize, type Card } from './engine'

interface MemoryCardProps {
  card: Card
  index: number
  onFlip: (index: number) => void
}

export function MemoryCard({ card, index, onFlip }: MemoryCardProps) {
  const shown = card.up || card.matched
  const classes = ['memory-card', shown && 'is-up', card.matched && 'is-matched', card.wrong && 'is-wrong']
    .filter(Boolean)
    .join(' ')

  return (
    <button type="button" className={classes} onClick={() => onFlip(index)} aria-label={cardLabel(card, index)}>
      <span className="memory-card__inner">
        <span className="memory-card__face memory-card__back">
          <img src={imageUrl('assets/card-back.svg')} alt="" draggable={false} />
        </span>
        <span className={`memory-card__face memory-card__front memory-card__front--${card.kind}`}>
          {card.kind === 'word' ? <WordFace text={card.word.word} /> : <ThemeImage src={card.word.image} />}
          {card.matched && (
            <span className="memory-card__check">
              <Icon name="check" size={18} strokeWidth={3} />
            </span>
          )}
        </span>
      </span>
    </button>
  )
}

function WordFace({ text }: { text: string }) {
  const { article, noun } = splitArticle(text)
  return (
    <span className="word-face">
      {article && <span className="word-face__article">{article}</span>}
      <span className="word-face__noun" style={{ fontSize: `${nounFontSize(noun)}cqi` }}>
        {noun}
      </span>
    </span>
  )
}
