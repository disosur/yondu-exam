import { TodoRepository } from "./repository";
import type { Todo, TodoCategory } from "./types";

export class TodoService {
  constructor(private repository: TodoRepository) {}

  async getAllTodos(category?: TodoCategory): Promise<Todo[]> {
    return this.repository.getAll(category);
  }

  async createTodo(text: string, category: TodoCategory): Promise<Todo> {
    const todo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      category,
    };
    return this.repository.add(todo);
  }

  async updateTodo(
    id: string,
    fields: Partial<Todo>,
  ): Promise<Todo | undefined> {
    return this.repository.update(id, fields);
  }

  async toggleTodo(id: string): Promise<Todo | undefined> {
    const todo = await this.repository.getById(id);
    if (!todo) return undefined;
    return this.repository.update(id, { completed: !todo.completed });
  }

  async deleteTodo(id: string): Promise<boolean> {
    return this.repository.remove(id);
  }

  async deleteCompletedTodos(category: TodoCategory): Promise<number> {
    return await this.repository.removeCompleted(category);
  }
}
