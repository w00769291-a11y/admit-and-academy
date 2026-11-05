import { createFileRoute } from "@tanstack/react-router";
import TasksPage from "@/components/directors/pages/TasksPage";

export const Route = createFileRoute("/directors/tasks")({
  component: TasksPage,
});
