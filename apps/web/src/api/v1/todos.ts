import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import type { Todo, TodoCategory } from "@/types/todos";

export function useTodosV1(category?: TodoCategory) {
  return useQuery<Todo[], Error>({
    queryKey: ["todosV1", category],
    queryFn: async () => {
      const query = category ? `?category=${category}` : "";
      const data = await apiFetch<Todo[]>(`/v1/todos${query}`, "GET");
      const stored = JSON.parse(
        localStorage.getItem("todos") || '{"personal": [], "professional": []}',
      );
      if (category) stored[category] = data;
      else {
        stored.personal = data.filter((t) => t.category === "personal");
        stored.professional = data.filter((t) => t.category === "professional");
      }
      localStorage.setItem("todos", JSON.stringify(stored));
      return data;
    },
    initialData: () => {
      const stored = localStorage.getItem("todos");
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return category
        ? parsed[category]
        : [...parsed.personal, ...parsed.professional];
    },
  });
}

export function useCreateTodoV1() {
  const queryClient = useQueryClient();
  return useMutation<
    Todo,
    Error,
    { text: string; category: TodoCategory },
    { stored: Record<string, Todo[]> }
  >({
    mutationFn: ({ text, category }) =>
      apiFetch<Todo>("/v1/todos", "POST", { text, category }),
    onMutate: async ({ text, category }) => {
      const stored = JSON.parse(
        localStorage.getItem("todos") || '{"personal": [], "professional": []}',
      );
      const newTodo: Todo = {
        id: Date.now().toString(),
        text,
        completed: false,
        category,
      };
      stored[category].push(newTodo);
      localStorage.setItem("todos", JSON.stringify(stored));
      return { stored };
    },
    onError: (_err, _vars, context) => {
      if (context?.stored)
        localStorage.setItem("todos", JSON.stringify(context.stored));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["todosV1"] }),
  });
}

export function useUpdateTodoV1() {
  const queryClient = useQueryClient();
  return useMutation<
    Todo,
    Error,
    { id: string; text?: string; category: TodoCategory },
    { stored: Record<string, Todo[]> }
  >({
    mutationFn: ({ id, text, category }) =>
      apiFetch<Todo>(`/v1/todos/${id}`, "PUT", { text, category }),
    onMutate: async ({ id, text, category }) => {
      const stored = JSON.parse(
        localStorage.getItem("todos") || '{"personal": [], "professional": []}',
      );
      stored[category] = stored[category].map((t: Todo) =>
        t.id === id ? { ...t, text } : t,
      );
      localStorage.setItem("todos", JSON.stringify(stored));
      return { stored };
    },
    onError: (_err, _vars, context) => {
      if (context?.stored)
        localStorage.setItem("todos", JSON.stringify(context.stored));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["todosV1"] }),
  });
}

export function useToggleTodoV1() {
  const queryClient = useQueryClient();
  return useMutation<
    Todo,
    Error,
    { id: string; category: TodoCategory },
    { stored: Record<string, Todo[]> }
  >({
    mutationFn: ({ id, category }) =>
      apiFetch<Todo>(`/v1/todos/${id}/toggle`, "PATCH"),
    onMutate: async ({ id, category }) => {
      const stored = JSON.parse(
        localStorage.getItem("todos") || '{"personal": [], "professional": []}',
      );
      stored[category] = stored[category].map((t: Todo) =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      );
      localStorage.setItem("todos", JSON.stringify(stored));
      return { stored };
    },
    onError: (_err, _vars, context) => {
      if (context?.stored)
        localStorage.setItem("todos", JSON.stringify(context.stored));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["todosV1"] }),
  });
}

export function useDeleteTodoV1() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { id: string; category: TodoCategory },
    { stored: Record<string, Todo[]> }
  >({
    mutationFn: ({ id, category }) =>
      apiFetch<void>(`/v1/todos/${id}`, "DELETE", { category }),
    onMutate: async ({ id, category }) => {
      const stored = JSON.parse(
        localStorage.getItem("todos") || '{"personal": [], "professional": []}',
      );
      stored[category] = stored[category].filter((t: Todo) => t.id !== id);
      localStorage.setItem("todos", JSON.stringify(stored));
      return { stored };
    },
    onError: (_err, _vars, context) => {
      if (context?.stored)
        localStorage.setItem("todos", JSON.stringify(context.stored));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["todosV1"] }),
  });
}

export function useDeleteCompletedTodosV1() {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: number }, Error, { category: TodoCategory }>({
    mutationFn: async ({ category }) =>
      await apiFetch(`/v1/todos/completed?category=${category}`, "DELETE"),
    onSuccess: async (_data, { category }) => {
      await queryClient.invalidateQueries({
        queryKey: ["todosV1", category],
      });
    },
  });
}
