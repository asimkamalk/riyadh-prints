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
import { ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/admin/catalogue/status-badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { reorderCategories, toggleCategoryFeatured } from "@/server/actions/category";
import type { AdminCategoryNode } from "@/server/queries/admin-categories";

export function CategoryTree({
  nodes,
  canEdit,
}: {
  nodes: AdminCategoryNode[];
  canEdit: boolean;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(nodes.map((node) => node.id)));

  function toggle(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <CategoryGroup
      nodes={nodes}
      depth={0}
      expanded={expanded}
      onToggle={toggle}
      canEdit={canEdit}
    />
  );
}

function CategoryGroup({
  nodes,
  depth,
  expanded,
  onToggle,
  canEdit,
}: {
  nodes: AdminCategoryNode[];
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !canEdit) {
      return;
    }
    const oldIndex = nodes.findIndex((node) => node.id === active.id);
    const newIndex = nodes.findIndex((node) => node.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }
    const next = arrayMove(nodes, oldIndex, newIndex);
    startTransition(async () => {
      const result = await reorderCategories({
        items: next.map((node, sortOrder) => ({ id: node.id, sortOrder })),
      });
      if (!result.ok) toast.error(result.error);
      else router.refresh();
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={nodes.map((node) => node.id)} strategy={verticalListSortingStrategy}>
        <ul className="grid gap-1" style={{ paddingInlineStart: depth ? "1.25rem" : 0 }}>
          {nodes.map((node) => (
            <CategoryRow
              key={node.id}
              node={node}
              expanded={expanded}
              onToggle={onToggle}
              canEdit={canEdit}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function CategoryRow({
  node,
  expanded,
  onToggle,
  canEdit,
}: {
  node: AdminCategoryNode;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: node.id });
  const open = expanded.has(node.id);

  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <div className="flex items-center gap-2 rounded-md border px-2 py-1.5">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="cursor-grab"
          aria-label="Reorder"
          disabled={!canEdit}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </Button>
        {node.children.length ? (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-expanded={open}
            aria-label={open ? "Collapse" : "Expand"}
            onClick={() => onToggle(node.id)}
          >
            {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </Button>
        ) : (
          <span className="size-8" />
        )}
        <Link href={`/admin/categories/${node.id}` as never} className="min-w-0 flex-1 font-medium hover:underline">
          {node.name}
        </Link>
        <span className="text-xs text-muted-foreground">{node.productCount} products</span>
        <StatusBadge status={node.status} />
        <Switch
          size="sm"
          checked={node.isFeatured}
          disabled={!canEdit}
          aria-label={`Featured ${node.name}`}
          onCheckedChange={() => {
            startTransition(async () => {
              const result = await toggleCategoryFeatured({ id: node.id });
              if (!result.ok) toast.error(result.error);
              else router.refresh();
            });
          }}
        />
      </div>
      {open && node.children.length ? (
        <CategoryGroup
          nodes={node.children}
          depth={1}
          expanded={expanded}
          onToggle={onToggle}
          canEdit={canEdit}
        />
      ) : null}
    </li>
  );
}
