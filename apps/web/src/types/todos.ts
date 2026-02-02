export type TodoCategory = "personal" | "professional";

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  category: TodoCategory;
};
