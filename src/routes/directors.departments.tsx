import { createFileRoute } from "@tanstack/react-router";
import DepartmentsPage from "@/components/directors/pages/DepartmentsPage";

export const Route = createFileRoute("/directors/departments")({
  component: DepartmentsPage,
});
