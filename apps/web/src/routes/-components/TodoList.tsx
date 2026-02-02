import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTodosV1, useDeleteCompletedTodosV1 } from "@/api/v1/todos";
import type { TodoCategory } from "@/types/todos";
import { TodoInput } from "./TodoInput";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
  category: TodoCategory;
}

export function TodoList({ category }: TodoListProps) {
  const todosQuery = useTodosV1(category);
  const deleteCompleted = useDeleteCompletedTodosV1();

  const todos = todosQuery.data || [];
  const hasCompletedTodos = todos.some((todo) => todo.completed);

  const handleClearCompleted = () => {
    deleteCompleted.mutate({ category });
  };

  // Error state
  if (todosQuery.isError) {
    return (
      <div className="space-y-6">
        {/* Hide input on mobile, show on desktop */}
        <div className="hidden md:block">
          <TodoInput category={category} />
        </div>
        <Card className="bg-destructive/10 border-destructive/20 rounded-3xl">
          <CardContent className="p-8 text-center">
            <p className="text-destructive font-medium mb-2">
              Failed to load todos
            </p>
            <p className="text-muted-foreground text-sm mb-4">
              {todosQuery.error?.message || "An error occurred"}
            </p>
            <Button
              onClick={() => todosQuery.refetch()}
              variant="outline"
              size="sm"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4 md:pb-0">
      {/* Hide input on mobile, show on desktop */}
      <div className="hidden md:block">
        <TodoInput category={category} />
      </div>

      {deleteCompleted.isError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
          Failed to clear completed: {deleteCompleted.error?.message}
        </div>
      )}

      <Card className="bg-secondary/30 border-0 rounded-3xl">
        <CardContent className="p-4 space-y-0">
          {todosQuery.isLoading && (
            <div className="py-8 text-center text-muted-foreground text-base">
              Loading todos...
            </div>
          )}

          {!todosQuery.isLoading && todos.length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-base">
              No todos yet. Add one{" "}
              <span className="md:inline hidden">above</span>
              <span className="md:hidden inline">below</span>!
            </div>
          )}

          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} category={category} />
          ))}

          {hasCompletedTodos && (
            <div className="flex justify-end pt-4">
              <button
                onClick={handleClearCompleted}
                disabled={deleteCompleted.isPending}
                className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                {deleteCompleted.isPending ? "Clearing..." : "Clear Completed"}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
