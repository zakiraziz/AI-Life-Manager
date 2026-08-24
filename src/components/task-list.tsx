"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Plus, ListTodo } from "lucide-react";
import { Task } from "@/lib/types";
import { TaskCard } from "@/components/task-card";
import { TaskForm } from "@/components/task-form";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useTasks, useReorderTasks, useDeleteTask } from "@/hooks/use-tasks";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

function SortableTask({ task, onEdit, onDelete }: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isDraggingSortable,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDraggingSortable ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={isDraggingSortable}
      />
    </div>
  );
}

export function TaskList() {
  const { data: tasks, isLoading, error } = useTasks();
  const reorderTasks = useReorderTasks();
  const deleteTask = useDeleteTask();
  const queryClient = useQueryClient();
  const setActiveId = useState<string | null>(null)[1];
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "todo" | "in_progress" | "done">("all");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredTasks = tasks
    ?.filter((t) => filter === "all" || t.status === filter)
    .sort((a, b) => a.position - b.position) ?? [];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = filteredTasks.findIndex((t) => t.id === active.id);
      const newIndex = filteredTasks.findIndex((t) => t.id === over.id);

      const reordered = arrayMove(filteredTasks, oldIndex, newIndex).map(
        (task, index) => ({
          id: task.id,
          position: index,
        })
      );

      // Optimistic update
      queryClient.setQueryData(["tasks"], (old: Task[] | undefined) => {
        if (!old) return old;
        const updated = old
          .map((t) => {
            const match = reordered.find((r) => r.id === t.id);
            return match ? { ...t, position: match.position } : t;
          })
          .sort((a, b) => a.position - b.position);
        return updated;
      });

      reorderTasks.mutate(reordered);
    }

    setActiveId(null);
  };

  const handleDelete = (task: Task) => {
    // Optimistic delete
    queryClient.setQueryData(["tasks"], (old: Task[] | undefined) =>
      old ? old.filter((t) => t.id !== task.id) : old
    );

    deleteTask.mutate(task.id, {
      onSuccess: () => {
        toast.success(`Deleted "${task.title}"`, {
          icon: "🗑️",
        });
      },
      onError: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      },
    });
  };

  if (error) {
    return (
      <EmptyState
        icon={<ListTodo className="w-6 h-6 text-muted-foreground" />}
        title="Error loading tasks"
        description={(error as Error).message}
      />
    );
  }

  return (
    <>
      {/* Create Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4"
        >
          <TaskForm task={null} onClose={() => setShowCreateForm(false)} />
        </motion.div>
      )}

      {/* Filter + Add */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {(["all", "todo", "in_progress", "done"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filter === f
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all"
                ? "All"
                : f === "todo"
                ? "To Do"
                : f === "in_progress"
                ? "In Progress"
                : "Done"}
            </button>
          ))}
        </div>

        {!showCreateForm && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Task
          </motion.button>
        )}
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={<ListTodo className="w-8 h-8" />}
          title="No tasks found"
          description={
            filter === "all"
              ? "Add your first task to get started!"
              : `No tasks in the "${filter}" status.`
          }
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <SortableTask
                  key={task.id}
                  task={task}
                  onEdit={(t) => setEditingTask(t)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Edit Form Modal */}
      {editingTask && (
        <TaskForm
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </>
  );
}
