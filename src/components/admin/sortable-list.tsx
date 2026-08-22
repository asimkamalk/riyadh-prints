"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SortableItem = { id: string };

export type SortableListProps<T extends SortableItem> = {
  items: T[];
  onReorder: (
    items: { id: string; sortOrder: number }[],
  ) => Promise<{ ok: boolean; error?: string }>;
  renderItem: (item: T, handle: React.ReactNode) => React.ReactNode;
};

export function SortableList<T extends SortableItem>({
  items,
  onReorder,
  renderItem,
}: SortableListProps<T>) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(items);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = optimistic.findIndex((item) => item.id === active.id);
    const newIndex = optimistic.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }
    const next = arrayMove(optimistic, oldIndex, newIndex);
    const payload = next.map((item, index) => ({ id: item.id, sortOrder: index }));
    startTransition(async () => {
      setOptimistic(next);
      const result = await onReorder(payload);
      if (!result.ok) {
        toast.error(result.error ?? "Could not reorder.");
      }
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={optimistic.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <ul className={cn("grid gap-2", pending && "opacity-80")}>
          {optimistic.map((item) => (
            <SortableRow key={item.id} id={item.id}>
              {(handle) => renderItem(item, handle)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  id,
  children,
}: {
  id: string;
  children: (handle: React.ReactNode) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const handle = (
    <Button
      type="button"
      size="icon-xs"
      variant="ghost"
      className="cursor-grab"
      aria-label="Reorder"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-4" />
    </Button>
  );

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "opacity-70")}
    >
      {children(handle)}
    </li>
  );
}
