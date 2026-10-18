import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import type { ReactNode } from 'react'
import { useA } from '../lib/i18n'

/** Drag-and-drop area. Dragging only starts from the handle, so scrolling with a finger still works everywhere else. */
export function SortableArea({
  ids,
  onReorder,
  layout = 'list',
  children,
}: {
  ids: string[]
  onReorder: (ids: string[]) => void
  layout?: 'list' | 'grid'
  children: ReactNode
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const from = ids.indexOf(String(active.id))
    const to = ids.indexOf(String(over.id))
    if (from < 0 || to < 0) return
    onReorder(arrayMove(ids, from, to))
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}

export interface HandleProps {
  handle: ReactNode
  dragging: boolean
}

/** One draggable item. `children` receives the drag handle to place wherever it fits. */
export function SortableItem({
  id,
  className = '',
  children,
}: {
  id: string
  className?: string
  children: (h: HandleProps) => ReactNode
}) {
  const { t } = useA()
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id })
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={t('Zum Verschieben festhalten und ziehen', 'Hold and drag to move')}
      title={t('Verschieben', 'Move')}
      className="flex h-11 w-11 shrink-0 cursor-grab touch-none items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 active:cursor-grabbing"
    >
      <GripVertical size={22} aria-hidden="true" />
    </button>
  )
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`${className} ${isDragging ? 'relative z-30 opacity-90 shadow-2xl ring-2 ring-brand' : ''}`}
    >
      {children({ handle, dragging: isDragging })}
    </div>
  )
}
