import { ChevronDown, ChevronUp } from 'lucide-react'
import { useA } from '../lib/i18n'
import { IconButton } from './kit'

/** Up / down arrows as an alternative to dragging (easier for some fingers). */
export default function MoveButtons({
  index,
  count,
  onMove,
}: {
  index: number
  count: number
  onMove: (to: number) => void
}) {
  const { t } = useA()
  return (
    <div className="flex">
      <IconButton icon={ChevronUp} label={t('Nach oben', 'Move up')} disabled={index === 0} onClick={() => onMove(index - 1)} />
      <IconButton icon={ChevronDown} label={t('Nach unten', 'Move down')} disabled={index === count - 1} onClick={() => onMove(index + 1)} />
    </div>
  )
}
