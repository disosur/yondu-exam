import type { Request, Response } from "express";
import { TodoService } from "./service";
import type { TodoCategory } from "./types";

function validateCategory(category: string): TodoCategory {
  if (category !== "personal" && category !== "professional") {
    throw new Error("Invalid category");
  }
  return category;
}

function parseCategory(value: unknown): TodoCategory {
  if (typeof value !== "string") {
    throw new Error("Invalid category");
  }
  if (value !== "personal" && value !== "professional") {
    throw new Error("Invalid category");
  }
  return value;
}

export class TodoController {
  constructor(private service: TodoService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const categoryParam = req.query.category;

      let category: TodoCategory | undefined;
      if (typeof categoryParam === "string") {
        category = validateCategory(categoryParam);
      } else if (Array.isArray(categoryParam)) {
        res.status(400).json({ error: "Invalid category" });
        return;
      }

      const todos = await this.service.getAllTodos(category);
      res.json(todos);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { text, category } = req.body;

      if (typeof text !== "string") {
        res.status(400).json({ error: "Text is required" });
        return;
      }
      if (typeof category !== "string") {
        res.status(400).json({ error: "Invalid category" });
        return;
      }

      const validCategory = validateCategory(category);
      const todo = await this.service.createTodo(text, validCategory);
      res.status(201).json(todo);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      if (!id || Array.isArray(id)) {
        res.status(400).json({ error: "Invalid ID" });
        return;
      }

      const todo = await this.service.updateTodo(id, req.body);
      if (!todo) {
        res.status(404).json({ error: "Todo not found" });
        return;
      }
      res.json(todo);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async toggle(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      if (!id || Array.isArray(id)) {
        res.status(400).json({ error: "Invalid ID" });
        return;
      }

      const todo = await this.service.toggleTodo(id);
      if (!todo) {
        res.status(404).json({ error: "Todo not found" });
        return;
      }
      res.json(todo);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      if (!id || Array.isArray(id)) {
        res.status(400).json({ error: "Invalid ID" });
        return;
      }

      const deleted = await this.service.deleteTodo(id);
      if (!deleted) {
        res.status(404).json({ error: "Todo not found" });
        return;
      }
      res.status(204).send();
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async deleteCompleted(req: Request, res: Response): Promise<void> {
    try {
      const category = parseCategory(req.query.category);
      const deleted = await this.service.deleteCompletedTodos(category);
      res.json({ deleted });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
