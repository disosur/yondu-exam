import type { Todo, TodoCategory } from "./types";

export class TodoRepository {
  private todos: Todo[] = []; // empty in-memory store

  async getAll(category?: TodoCategory): Promise<Todo[]> {
    return category
      ? this.todos.filter((t) => t.category === category)
      : this.todos;
  }

  async getById(id: string): Promise<Todo | undefined> {
    return this.todos.find((t) => t.id === id);
  }

  async add(todo: Todo): Promise<Todo> {
    this.todos.push(todo);
    return todo;
  }

  async update(
    id: string,
    updatedFields: Partial<Todo>,
  ): Promise<Todo | undefined> {
    const todo = await this.getById(id);
    if (todo) Object.assign(todo, updatedFields);
    return todo;
  }

  async remove(id: string): Promise<boolean> {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index >= 0) {
      this.todos.splice(index, 1);
      return true;
    }
    return false;
  }

  async removeCompleted(category: TodoCategory): Promise<number> {
    const before = this.todos.length;
    this.todos = this.todos.filter(
      (t) => !(t.completed && t.category === category),
    );
    return before - this.todos.length;
  }
}
