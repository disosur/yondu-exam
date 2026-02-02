import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateTodoV1 } from "@/api/v1/todos";
import type { TodoCategory } from "@/types/todos";

interface TodoInputProps {
  category: TodoCategory;
}

export function TodoInput({ category }: TodoInputProps) {
  const [input, setInput] = useState("");
  const createTodo = useCreateTodoV1();

  const handleAdd = () => {
    if (!input.trim()) return;
    createTodo.mutate({ text: input.trim(), category });
    setInput("");
  };

  return (
    <div className="space-y-4">
      <div className="flex">
        <Input
          placeholder="What do you need to do?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          disabled={createTodo.isPending}
          className="flex-1 bg-secondary/30 rounded-l-full rounded-r-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-12 px-6"
        />
        <Button
          onClick={handleAdd}
          disabled={createTodo.isPending}
          className="bg-button hover:bg-button/90 text-button-foreground font-medium px-8 rounded-r-full rounded-l-none h-12"
        >
          {createTodo.isPending ? "ADDING..." : "ADD"}
        </Button>
      </div>

      {createTodo.isError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
          Failed to add todo: {createTodo.error?.message}
        </div>
      )}
    </div>
  );
}
