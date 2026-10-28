import { imageUrl, isPicto } from '../lib/assets'

interface ThemeImageProps {
  src: string
  /** Size of a picto inside its frame; photos always fill it. */
  pictoSize?: string
  className?: string
}

export function ThemeImage({ src, pictoSize = '76%', className }: ThemeImageProps) {
  const picto = isPicto(src)
  return (
    <img
      className={className}
      src={imageUrl(src)}
      alt=""
      draggable={false}
      style={{
        width: picto ? pictoSize : '100%',
        height: picto ? pictoSize : '100%',
        objectFit: picto ? 'contain' : 'cover',
      }}
    />
  )
}
