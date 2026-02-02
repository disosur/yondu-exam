import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, X } from "lucide-react";
import {
  useTodosV1,
  useCreateTodoV1,
  useToggleTodoV1,
  useDeleteTodoV1,
  useDeleteCompletedTodosV1,
} from "@/api/v1/todos";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const [activeTab, setActiveTab] = useState<"personal" | "professional">(
    "personal",
  );
  const [personalInput, setPersonalInput] = useState("");
  const [professionalInput, setProfessionalInput] = useState("");

  const personalTodosQuery = useTodosV1("personal");
  const professionalTodosQuery = useTodosV1("professional");

  const createTodo = useCreateTodoV1();
  const toggleTodo = useToggleTodoV1();
  const deleteTodo = useDeleteTodoV1();
  const deleteCompleted = useDeleteCompletedTodosV1();

  const addTodo = (type: "personal" | "professional") => {
    const input = type === "personal" ? personalInput : professionalInput;
    const setInput =
      type === "personal" ? setPersonalInput : setProfessionalInput;
    if (!input.trim()) return;
    createTodo.mutate({ text: input.trim(), category: type });
    setInput("");
  };

  const toggle = (type: "personal" | "professional", id: string) => {
    toggleTodo.mutate({ id, category: type });
  };

  const remove = (type: "personal" | "professional", id: string) => {
    deleteTodo.mutate({ id, category: type });
  };

  const clearCompleted = (type: "personal" | "professional") => {
    deleteCompleted.mutate({ category: type });
  };

  const renderTodoList = (type: "personal" | "professional") => {
    const todos =
      type === "personal"
        ? personalTodosQuery.data || []
        : professionalTodosQuery.data || [];
    const input = type === "personal" ? personalInput : professionalInput;
    const setInput =
      type === "personal" ? setPersonalInput : setProfessionalInput;

    return (
      <div className="space-y-6">
        <div className="flex">
          <Input
            placeholder="What do you need to do?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTodo(type);
            }}
            className="flex-1 bg-secondary/30 rounded-l-full rounded-r-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-12 px-6"
          />
          <Button
            onClick={() => addTodo(type)}
            className="bg-button hover:bg-button/90 text-button-foreground font-medium px-8 rounded-r-full rounded-l-none h-12"
          >
            ADD
          </Button>
        </div>

        <Card className="bg-secondary/30 border-0 rounded-3xl">
          <CardContent className="p-4 space-y-0">
            {todos.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-base">
                No todos yet. Add one above!
              </div>
            )}
            {todos.map((todo) => (
              <div key={todo.id}>
                <div className="flex items-center gap-4 py-4">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggle(type, todo.id)}
                    className="h-6 w-6 rounded-full border-2 border-muted-foreground data-checked:border-primary data-checked:bg-transparent data-checked:text-primary"
                  />
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
                    onClick={() => remove(type, todo.id)}
                    className="text-destructive/60 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <Separator className="bg-button/20" />
              </div>
            ))}
            {todos.some((todo) => todo.completed) && (
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => clearCompleted(type)}
                  className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium"
                >
                  <X className="h-4 w-4" />
                  Clear Completed
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen w-screen bg-white">
      <div className="bg-card">
        <div className="max-w-3xl mx-auto px-8 py-6">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-light tracking-wide">
              <span className="text-foreground">TO</span>
              <span className="text-primary">DO</span>
            </h1>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "personal" | "professional")
            }
            className="w-full"
          >
            <TabsList
              variant="line"
              className="grid grid-cols-2 h-auto p-0 bg-transparent w-full"
            >
              <TabsTrigger
                value="personal"
                className="rounded-none bg-transparent pb-4 shadow-none text-base font-medium after:bg-primary after:h-1"
              >
                Personal
              </TabsTrigger>
              <TabsTrigger
                value="professional"
                className="rounded-none bg-transparent pb-4 shadow-none text-base font-medium after:bg-primary after:h-1"
              >
                Professional
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <div className="flex-1 flex items-start justify-center p-8">
        <div className="w-full max-w-3xl">
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "personal" | "professional")
            }
            className="w-full"
          >
            <TabsContent value="personal" className="mt-0">
              {renderTodoList("personal")}
            </TabsContent>
            <TabsContent value="professional" className="mt-0">
              {renderTodoList("professional")}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
