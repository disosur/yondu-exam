import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import type { Request, Response } from "express";
import { TodoController } from "../controller";
import { TodoService } from "../service";
import type { Todo } from "../types";

// Mock the service
jest.mock("../service");

describe("TodoController", () => {
  let controller: TodoController;
  let mockService: jest.Mocked<TodoService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = new TodoService(null as any) as jest.Mocked<TodoService>;
    controller = new TodoController(mockService);

    // Setup mock functions with proper chaining
    jsonMock = jest.fn();
    statusMock = jest.fn();
    sendMock = jest.fn();

    // Setup mock response with proper typing
    mockResponse = {
      json: jsonMock as any,
      status: statusMock as any,
      send: sendMock as any,
    } as Partial<Response>;

    // Make status and json chainable
    statusMock.mockReturnValue(mockResponse);
    jsonMock.mockReturnValue(mockResponse);
    sendMock.mockReturnValue(mockResponse);

    // Setup mock request
    mockRequest = {
      query: {},
      body: {},
      params: {},
    };
  });

  describe("getAll", () => {
    it("should return all todos when no category is provided", async () => {
      const mockTodos: Todo[] = [
        {
          id: "1",
          text: "Test todo",
          completed: false,
          category: "personal",
        },
      ];
      mockService.getAllTodos.mockResolvedValue(mockTodos);

      await controller.getAll(mockRequest as Request, mockResponse as Response);

      expect(mockService.getAllTodos).toHaveBeenCalledWith(undefined);
      expect(jsonMock).toHaveBeenCalledWith(mockTodos);
    });

    it("should filter by category when valid category is provided", async () => {
      mockRequest.query = { category: "personal" };
      const mockTodos: Todo[] = [
        {
          id: "1",
          text: "Personal todo",
          completed: false,
          category: "personal",
        },
      ];
      mockService.getAllTodos.mockResolvedValue(mockTodos);

      await controller.getAll(mockRequest as Request, mockResponse as Response);

      expect(mockService.getAllTodos).toHaveBeenCalledWith("personal");
      expect(jsonMock).toHaveBeenCalledWith(mockTodos);
    });

    it("should return 400 when category is invalid", async () => {
      mockRequest.query = { category: "invalid" };

      await controller.getAll(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Invalid category",
      });
    });

    it("should return 400 when category is an array", async () => {
      mockRequest.query = { category: ["personal", "professional"] };

      await controller.getAll(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Invalid category",
      });
    });
  });

  describe("create", () => {
    it("should create a new todo with valid data", async () => {
      mockRequest.body = {
        text: "New todo",
        category: "personal",
      };
      const createdTodo: Todo = {
        id: "1",
        text: "New todo",
        completed: false,
        category: "personal",
      };
      mockService.createTodo.mockResolvedValue(createdTodo);

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(mockService.createTodo).toHaveBeenCalledWith(
        "New todo",
        "personal",
      );
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(createdTodo);
    });

    it("should return 400 when text is missing", async () => {
      mockRequest.body = {
        category: "personal",
      };

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Text is required",
      });
    });

    it("should return 400 when text is not a string", async () => {
      mockRequest.body = {
        text: 123,
        category: "personal",
      };

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Text is required",
      });
    });

    it("should return 400 when category is missing", async () => {
      mockRequest.body = {
        text: "New todo",
      };

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Invalid category",
      });
    });

    it("should return 400 when category is invalid", async () => {
      mockRequest.body = {
        text: "New todo",
        category: "invalid",
      };

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Invalid category",
      });
    });
  });

  describe("update", () => {
    it("should update a todo with valid data", async () => {
      mockRequest.params = { id: "1" };
      mockRequest.body = { text: "Updated text" };
      const updatedTodo: Todo = {
        id: "1",
        text: "Updated text",
        completed: false,
        category: "personal",
      };
      mockService.updateTodo.mockResolvedValue(updatedTodo);

      await controller.update(mockRequest as Request, mockResponse as Response);

      expect(mockService.updateTodo).toHaveBeenCalledWith("1", {
        text: "Updated text",
      });
      expect(jsonMock).toHaveBeenCalledWith(updatedTodo);
    });

    it("should return 404 when todo is not found", async () => {
      mockRequest.params = { id: "999" };
      mockRequest.body = { text: "Updated text" };
      mockService.updateTodo.mockResolvedValue(undefined);

      await controller.update(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Todo not found",
      });
    });

    it("should return 400 when id is missing", async () => {
      mockRequest.params = {};
      mockRequest.body = { text: "Updated text" };

      await controller.update(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Invalid ID",
      });
    });
  });

  describe("toggle", () => {
    it("should toggle a todo", async () => {
      mockRequest.params = { id: "1" };
      const toggledTodo: Todo = {
        id: "1",
        text: "Test todo",
        completed: true,
        category: "personal",
      };
      mockService.toggleTodo.mockResolvedValue(toggledTodo);

      await controller.toggle(mockRequest as Request, mockResponse as Response);

      expect(mockService.toggleTodo).toHaveBeenCalledWith("1");
      expect(jsonMock).toHaveBeenCalledWith(toggledTodo);
    });

    it("should return 404 when todo is not found", async () => {
      mockRequest.params = { id: "999" };
      mockService.toggleTodo.mockResolvedValue(undefined);

      await controller.toggle(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Todo not found",
      });
    });

    it("should return 400 when id is missing", async () => {
      mockRequest.params = {};

      await controller.toggle(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Invalid ID",
      });
    });
  });

  describe("delete", () => {
    it("should delete a todo and return 204", async () => {
      mockRequest.params = { id: "1" };
      mockService.deleteTodo.mockResolvedValue(true);

      await controller.delete(mockRequest as Request, mockResponse as Response);

      expect(mockService.deleteTodo).toHaveBeenCalledWith("1");
      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it("should return 404 when todo is not found", async () => {
      mockRequest.params = { id: "999" };
      mockService.deleteTodo.mockResolvedValue(false);

      await controller.delete(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Todo not found",
      });
    });

    it("should return 400 when id is missing", async () => {
      mockRequest.params = {};

      await controller.delete(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Invalid ID",
      });
    });
  });

  describe("deleteCompleted", () => {
    it("should delete completed todos for a category", async () => {
      mockRequest.query = { category: "personal" };
      mockService.deleteCompletedTodos.mockResolvedValue(3);

      await controller.deleteCompleted(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockService.deleteCompletedTodos).toHaveBeenCalledWith("personal");
      expect(jsonMock).toHaveBeenCalledWith({ deleted: 3 });
    });

    it("should return 400 when category is missing", async () => {
      mockRequest.query = {};

      await controller.deleteCompleted(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Invalid category",
      });
    });

    it("should return 400 when category is invalid", async () => {
      mockRequest.query = { category: "invalid" };

      await controller.deleteCompleted(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Invalid category",
      });
    });

    it("should return 400 when category is not a string", async () => {
      mockRequest.query = { category: "123" as any };

      await controller.deleteCompleted(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Invalid category",
      });
    });
  });
});
