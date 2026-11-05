import { createFileRoute } from "@tanstack/react-router";
import ReportsPage from "@/components/directors/pages/ReportsPage";

export const Route = createFileRoute("/directors/reports")({
  component: ReportsPage,
});
