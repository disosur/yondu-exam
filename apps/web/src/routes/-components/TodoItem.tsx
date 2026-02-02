import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, Pencil, Check, X } from "lucide-react";
import {
  useUpdateTodoV1,
  useToggleTodoV1,
  useDeleteTodoV1,
} from "@/api/v1/todos";
import type { Todo, TodoCategory } from "@/types/todos";

interface TodoItemProps {
  todo: Todo;
  category: TodoCategory;
}

export function TodoItem({ todo, category }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const updateTodo = useUpdateTodoV1();
  const toggleTodo = useToggleTodoV1();
  const deleteTodo = useDeleteTodoV1();

  const isPending =
    updateTodo.isPending || toggleTodo.isPending || deleteTodo.isPending;

  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    updateTodo.mutate(
      { id: todo.id, text: editText.trim(), category },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(todo.text);
  };

  const handleToggle = () => {
    toggleTodo.mutate({ id: todo.id, category });
  };

  const handleDelete = () => {
    deleteTodo.mutate({ id: todo.id, category });
  };

  return (
    <div>
      <div className="flex items-center gap-4 py-4">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={handleToggle}
          disabled={isPending}
          className="h-6 w-6 rounded-full border-2 border-muted-foreground data-checked:border-primary data-checked:bg-transparent data-checked:text-primary"
        />

        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") handleCancelEdit();
              }}
              disabled={updateTodo.isPending}
              className="flex-1 h-8 text-base"
              autoFocus
            />
            <button
              onClick={handleSaveEdit}
              disabled={updateTodo.isPending}
              className="text-primary hover:text-primary/80 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={updateTodo.isPending}
              className="text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <span
              className={`flex-1 text-base ${
                todo.completed
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {todo.text}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              disabled={isPending}
              className="text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-destructive/60 hover:text-destructive disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
      <Separator className="bg-button/20" />
    </div>
  );
}
