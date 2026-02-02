import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { TodoService } from "../service";
import { TodoRepository } from "../repository";
import type { Todo } from "../types";

// Mock the repository
jest.mock("../repository");

describe("TodoService", () => {
  let service: TodoService;
  let mockRepository: jest.Mocked<TodoRepository>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a new mocked repository instance
    mockRepository = new TodoRepository() as jest.Mocked<TodoRepository>;
    service = new TodoService(mockRepository);
  });

  describe("getAllTodos", () => {
    it("should call repository.getAll without category", async () => {
      const mockTodos: Todo[] = [
        {
          id: "1",
          text: "Test todo",
          completed: false,
          category: "personal",
        },
      ];
      mockRepository.getAll.mockResolvedValue(mockTodos);

      const result = await service.getAllTodos();

      expect(mockRepository.getAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockTodos);
    });

    it("should call repository.getAll with category", async () => {
      const mockTodos: Todo[] = [
        {
          id: "1",
          text: "Work todo",
          completed: false,
          category: "professional",
        },
      ];
      mockRepository.getAll.mockResolvedValue(mockTodos);

      const result = await service.getAllTodos("professional");

      expect(mockRepository.getAll).toHaveBeenCalledWith("professional");
      expect(result).toEqual(mockTodos);
    });
  });

  describe("createTodo", () => {
    it("should create a todo with generated id and call repository.add", async () => {
      const text = "New todo";
      const category = "personal";

      mockRepository.add.mockImplementation((todo) => Promise.resolve(todo));

      const result = await service.createTodo(text, category);

      expect(mockRepository.add).toHaveBeenCalledWith(
        expect.objectContaining({
          text,
          completed: false,
          category,
        }),
      );
      expect(result.text).toBe(text);
      expect(result.category).toBe(category);
      expect(result.completed).toBe(false);
      expect(result.id).toBeDefined();
    });

    it("should create todos with unique ids", async () => {
      mockRepository.add.mockImplementation((todo) => Promise.resolve(todo));

      const todo1 = await service.createTodo("First", "personal");
      const todo2 = await service.createTodo("Second", "professional");

      expect(todo1.id).not.toBe(todo2.id);
    });
  });

  describe("updateTodo", () => {
    it("should call repository.update with correct parameters", async () => {
      const id = "1";
      const fields = { text: "Updated text", completed: true };
      const updatedTodo: Todo = {
        id,
        text: "Updated text",
        completed: true,
        category: "personal",
      };

      mockRepository.update.mockResolvedValue(updatedTodo);

      const result = await service.updateTodo(id, fields);

      expect(mockRepository.update).toHaveBeenCalledWith(id, fields);
      expect(result).toEqual(updatedTodo);
    });

    it("should return undefined when todo does not exist", async () => {
      mockRepository.update.mockResolvedValue(undefined);

      const result = await service.updateTodo("nonexistent", { text: "New" });

      expect(result).toBeUndefined();
    });
  });

  describe("toggleTodo", () => {
    it("should toggle completed status from false to true", async () => {
      const id = "1";
      const existingTodo: Todo = {
        id,
        text: "Test todo",
        completed: false,
        category: "personal",
      };
      const toggledTodo: Todo = { ...existingTodo, completed: true };

      mockRepository.getById.mockResolvedValue(existingTodo);
      mockRepository.update.mockResolvedValue(toggledTodo);

      const result = await service.toggleTodo(id);

      expect(mockRepository.getById).toHaveBeenCalledWith(id);
      expect(mockRepository.update).toHaveBeenCalledWith(id, {
        completed: true,
      });
      expect(result).toEqual(toggledTodo);
    });

    it("should toggle completed status from true to false", async () => {
      const id = "1";
      const existingTodo: Todo = {
        id,
        text: "Test todo",
        completed: true,
        category: "personal",
      };
      const toggledTodo: Todo = { ...existingTodo, completed: false };

      mockRepository.getById.mockResolvedValue(existingTodo);
      mockRepository.update.mockResolvedValue(toggledTodo);

      const result = await service.toggleTodo(id);

      expect(mockRepository.getById).toHaveBeenCalledWith(id);
      expect(mockRepository.update).toHaveBeenCalledWith(id, {
        completed: false,
      });
      expect(result).toEqual(toggledTodo);
    });

    it("should return undefined when todo does not exist", async () => {
      mockRepository.getById.mockResolvedValue(undefined);

      const result = await service.toggleTodo("nonexistent");

      expect(mockRepository.getById).toHaveBeenCalledWith("nonexistent");
      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe("deleteTodo", () => {
    it("should call repository.remove and return true on success", async () => {
      const id = "1";
      mockRepository.remove.mockResolvedValue(true);

      const result = await service.deleteTodo(id);

      expect(mockRepository.remove).toHaveBeenCalledWith(id);
      expect(result).toBe(true);
    });

    it("should return false when todo does not exist", async () => {
      mockRepository.remove.mockResolvedValue(false);

      const result = await service.deleteTodo("nonexistent");

      expect(result).toBe(false);
    });
  });

  describe("deleteCompletedTodos", () => {
    it("should call repository.removeCompleted with correct category", async () => {
      const category = "personal";
      const deletedCount = 3;

      mockRepository.removeCompleted.mockResolvedValue(deletedCount);

      const result = await service.deleteCompletedTodos(category);

      expect(mockRepository.removeCompleted).toHaveBeenCalledWith(category);
      expect(result).toBe(deletedCount);
    });

    it("should return 0 when no completed todos exist", async () => {
      mockRepository.removeCompleted.mockResolvedValue(0);

      const result = await service.deleteCompletedTodos("professional");

      expect(result).toBe(0);
    });
  });
});
