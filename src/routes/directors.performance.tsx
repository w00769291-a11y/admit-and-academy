import { createFileRoute } from "@tanstack/react-router";
import PerformancePage from "@/components/directors/pages/PerformancePage";

export const Route = createFileRoute("/directors/performance")({
  component: PerformancePage,
});
