import { createFileRoute } from "@tanstack/react-router";
import { TodoApp } from "./-components";

export const Route = createFileRoute("/")({
  component: TodoApp,
});
