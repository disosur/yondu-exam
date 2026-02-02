import { describe, it, expect, beforeEach } from "@jest/globals";
import { TodoRepository } from "../repository";
import type { Todo } from "../types";

describe("TodoRepository", () => {
  let repository: TodoRepository;

  beforeEach(() => {
    repository = new TodoRepository();
  });

  describe("getAll", () => {
    it("should return empty array when no todos exist", async () => {
      const todos = await repository.getAll();
      expect(todos).toEqual([]);
    });

    it("should return all todos when no category filter is provided", async () => {
      const todo1: Todo = {
        id: "1",
        text: "Test 1",
        completed: false,
        category: "personal",
      };
      const todo2: Todo = {
        id: "2",
        text: "Test 2",
        completed: false,
        category: "professional",
      };

      await repository.add(todo1);
      await repository.add(todo2);

      const todos = await repository.getAll();
      expect(todos).toHaveLength(2);
      expect(todos).toContainEqual(todo1);
      expect(todos).toContainEqual(todo2);
    });

    it("should filter todos by category when category is provided", async () => {
      const personalTodo: Todo = {
        id: "1",
        text: "Personal task",
        completed: false,
        category: "personal",
      };
      const professionalTodo: Todo = {
        id: "2",
        text: "Work task",
        completed: false,
        category: "professional",
      };

      await repository.add(personalTodo);
      await repository.add(professionalTodo);

      const personalTodos = await repository.getAll("personal");
      expect(personalTodos).toHaveLength(1);
      expect(personalTodos[0]).toEqual(personalTodo);

      const professionalTodos = await repository.getAll("professional");
      expect(professionalTodos).toHaveLength(1);
      expect(professionalTodos[0]).toEqual(professionalTodo);
    });
  });

  describe("getById", () => {
    it("should return undefined when todo does not exist", async () => {
      const todo = await repository.getById("nonexistent");
      expect(todo).toBeUndefined();
    });

    it("should return the todo when it exists", async () => {
      const newTodo: Todo = {
        id: "1",
        text: "Test todo",
        completed: false,
        category: "personal",
      };

      await repository.add(newTodo);
      const todo = await repository.getById("1");

      expect(todo).toEqual(newTodo);
    });
  });

  describe("add", () => {
    it("should add a new todo and return it", async () => {
      const newTodo: Todo = {
        id: "1",
        text: "New todo",
        completed: false,
        category: "personal",
      };

      const addedTodo = await repository.add(newTodo);

      expect(addedTodo).toEqual(newTodo);
      const todos = await repository.getAll();
      expect(todos).toHaveLength(1);
      expect(todos[0]).toEqual(newTodo);
    });

    it("should maintain multiple todos", async () => {
      const todo1: Todo = {
        id: "1",
        text: "First todo",
        completed: false,
        category: "personal",
      };
      const todo2: Todo = {
        id: "2",
        text: "Second todo",
        completed: true,
        category: "professional",
      };

      await repository.add(todo1);
      await repository.add(todo2);

      const todos = await repository.getAll();
      expect(todos).toHaveLength(2);
    });
  });

  describe("update", () => {
    it("should return undefined when todo does not exist", async () => {
      const result = await repository.update("nonexistent", {
        text: "Updated",
      });
      expect(result).toBeUndefined();
    });

    it("should update existing todo and return it", async () => {
      const todo: Todo = {
        id: "1",
        text: "Original text",
        completed: false,
        category: "personal",
      };

      await repository.add(todo);
      const updated = await repository.update("1", {
        text: "Updated text",
        completed: true,
      });

      expect(updated).toBeDefined();
      expect(updated?.text).toBe("Updated text");
      expect(updated?.completed).toBe(true);
      expect(updated?.category).toBe("personal");
    });

    it("should only update provided fields", async () => {
      const todo: Todo = {
        id: "1",
        text: "Original text",
        completed: false,
        category: "personal",
      };

      await repository.add(todo);
      const updated = await repository.update("1", { completed: true });

      expect(updated?.text).toBe("Original text");
      expect(updated?.completed).toBe(true);
    });
  });

  describe("remove", () => {
    it("should return false when todo does not exist", async () => {
      const result = await repository.remove("nonexistent");
      expect(result).toBe(false);
    });

    it("should remove existing todo and return true", async () => {
      const todo: Todo = {
        id: "1",
        text: "To be removed",
        completed: false,
        category: "personal",
      };

      await repository.add(todo);
      const result = await repository.remove("1");

      expect(result).toBe(true);
      const todos = await repository.getAll();
      expect(todos).toHaveLength(0);
    });

    it("should only remove the specified todo", async () => {
      const todo1: Todo = {
        id: "1",
        text: "Keep this",
        completed: false,
        category: "personal",
      };
      const todo2: Todo = {
        id: "2",
        text: "Remove this",
        completed: false,
        category: "professional",
      };

      await repository.add(todo1);
      await repository.add(todo2);
      await repository.remove("2");

      const todos = await repository.getAll();
      expect(todos).toHaveLength(1);
      expect(todos[0]).toEqual(todo1);
    });
  });

  describe("removeCompleted", () => {
    it("should remove all completed todos of specified category", async () => {
      const todos: Todo[] = [
        {
          id: "1",
          text: "Personal completed",
          completed: true,
          category: "personal",
        },
        {
          id: "2",
          text: "Personal incomplete",
          completed: false,
          category: "personal",
        },
        {
          id: "3",
          text: "Professional completed",
          completed: true,
          category: "professional",
        },
        {
          id: "4",
          text: "Personal completed 2",
          completed: true,
          category: "personal",
        },
      ];

      for (const todo of todos) {
        await repository.add(todo);
      }

      const deletedCount = await repository.removeCompleted("personal");

      expect(deletedCount).toBe(2);
      const remaining = await repository.getAll();
      expect(remaining).toHaveLength(2);
      expect(remaining.find((t) => t.id === "2")).toBeDefined();
      expect(remaining.find((t) => t.id === "3")).toBeDefined();
    });

    it("should return 0 when no completed todos exist for category", async () => {
      const todo: Todo = {
        id: "1",
        text: "Not completed",
        completed: false,
        category: "personal",
      };

      await repository.add(todo);
      const deletedCount = await repository.removeCompleted("personal");

      expect(deletedCount).toBe(0);
      const todos = await repository.getAll();
      expect(todos).toHaveLength(1);
    });

    it("should not remove completed todos from other categories", async () => {
      const personalCompleted: Todo = {
        id: "1",
        text: "Personal completed",
        completed: true,
        category: "personal",
      };
      const professionalCompleted: Todo = {
        id: "2",
        text: "Professional completed",
        completed: true,
        category: "professional",
      };

      await repository.add(personalCompleted);
      await repository.add(professionalCompleted);

      const deletedCount = await repository.removeCompleted("personal");

      expect(deletedCount).toBe(1);
      const todos = await repository.getAll();
      expect(todos).toHaveLength(1);
      expect(todos[0]).toEqual(professionalCompleted);
    });
  });
});
