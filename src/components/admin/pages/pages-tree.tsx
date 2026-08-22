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
import { reorderPages } from "@/server/actions/page";
import type { AdminPageNode } from "@/server/queries/admin-pages";

export function PagesTree({ nodes, canEdit }: { nodes: AdminPageNode[]; canEdit: boolean }) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(nodes.map((node) => node.id)));

  function toggle(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <PageGroup nodes={nodes} depth={0} expanded={expanded} onToggle={toggle} canEdit={canEdit} />
  );
}

function PageGroup({
  nodes,
  depth,
  expanded,
  onToggle,
  canEdit,
}: {
  nodes: AdminPageNode[];
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
      const result = await reorderPages({
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
            <PageRow key={node.id} node={node} expanded={expanded} onToggle={onToggle} canEdit={canEdit} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function PageRow({
  node,
  expanded,
  onToggle,
  canEdit,
}: {
  node: AdminPageNode;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  canEdit: boolean;
}) {
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
        <div className="min-w-0 flex-1">
          <Link href={`/admin/pages/${node.id}` as never} className="block font-medium hover:underline">
            {node.title}
          </Link>
          <p className="font-mono text-xs text-muted-foreground">{node.path}</p>
        </div>
        <StatusBadge status={node.status} />
      </div>
      {open && node.children.length ? (
        <PageGroup nodes={node.children} depth={1} expanded={expanded} onToggle={onToggle} canEdit={canEdit} />
      ) : null}
    </li>
  );
}
