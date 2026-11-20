// ui-status: approved
// ui-block: ColumnChooser
// ui-behaviour: browse-columns.md
import { closestCenter, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { IconButton } from '@design-pack/ui/components/icon-button'
import { Button } from '@design-pack/ui/components/ui/button'
import { Checkbox } from '@design-pack/ui/components/ui/checkbox'
import { Label } from '@design-pack/ui/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@design-pack/ui/components/ui/popover'
import { ArrowDown, ArrowUp, Columns3, GripVertical } from 'lucide-react'

export interface ColumnSetting {
  id: string
  label: string
  shown: boolean
}

/**
 * Configure a list's columns: every column in display order, each shown or hidden by its
 * checkbox and moved by its handle (drag, or Space then the arrow keys) or its up and down
 * buttons. Restore defaults puts the whole list back — its columns, widths and sort.
 */
export function ColumnSettings({
  columns,
  onToggle,
  onReorder,
  onReset,
}: {
  /** In display order. */
  columns: ColumnSetting[]
  onToggle: (id: string) => void
  onReorder: (order: string[]) => void
  onReset: () => void
}) {
  const ids = columns.map((c) => c.id)
  // A drag starts only after the pointer travels, so a click on a checkbox or an arrow is never a drag.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const move = (from: number, to: number) => onReorder(arrayMove(ids, from, to))
  const dragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) move(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <IconButton icon={Columns3} label="Configure columns" />
      </PopoverTrigger>
      {/* No taller than the room below the button: the list scrolls inside, Restore
          Defaults stays in view under it. */}
      <PopoverContent align="end" inset="list" collisionPadding={8} className="flex max-h-(--radix-popover-content-available-height) w-72 flex-col">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <ul className="scroll-region flex min-h-0 flex-1 flex-col">
              {columns.map((column, index) => (
                <ColumnRow
                  key={column.id}
                  column={column}
                  first={index === 0}
                  last={index === columns.length - 1}
                  onToggle={() => onToggle(column.id)}
                  onUp={() => move(index, index - 1)}
                  onDown={() => move(index, index + 1)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
        <div className="flex justify-end border-t-line border-border-subtle p-2">
          <Button variant="outline" onClick={onReset}>
            Restore Defaults
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ColumnRow({
  column,
  first,
  last,
  onToggle,
  onUp,
  onDown,
}: {
  column: ColumnSetting
  first: boolean
  last: boolean
  onToggle: () => void
  onUp: () => void
  onDown: () => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: column.id })
  const id = `column-${column.id}`
  return (
    <li
      ref={setNodeRef}
      style={{ transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined, transition }}
      data-dragging={isDragging || undefined}
      className="flex items-center gap-2 px-2 py-1 data-dragging:bg-accent"
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={`Move ${column.label}`}
        className="flex size-6 shrink-0 cursor-grab items-center justify-center rounded-control text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
        {...attributes}
        {...listeners}
      >
        <GripVertical aria-hidden className="size-4" />
      </button>
      <Checkbox id={id} checked={column.shown} onCheckedChange={onToggle} />
      <Label htmlFor={id} kind="option" className="min-w-0 flex-1 truncate">
        {column.label}
      </Label>
      <IconButton icon={ArrowUp} label={`Move ${column.label} up`} disabled={first} onClick={onUp} />
      <IconButton icon={ArrowDown} label={`Move ${column.label} down`} disabled={last} onClick={onDown} />
    </li>
  )
}
