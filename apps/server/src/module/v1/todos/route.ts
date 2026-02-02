import { Router } from "express";
import { TodoController } from "./controller";
import { TodoService } from "./service";
import { TodoRepository } from "./repository";

const todosV1Routes = Router();
const repository = new TodoRepository();
const service = new TodoService(repository);
const controller = new TodoController(service);

todosV1Routes.get("/", (req, res) => controller.getAll(req, res));
todosV1Routes.post("/", (req, res) => controller.create(req, res));
todosV1Routes.put("/:id", (req, res) => controller.update(req, res));
todosV1Routes.patch("/:id/toggle", (req, res) => controller.toggle(req, res));
todosV1Routes.delete("/completed", (req, res) =>
  controller.deleteCompleted(req, res),
);
todosV1Routes.delete("/:id", (req, res) => controller.delete(req, res));

export default todosV1Routes;
