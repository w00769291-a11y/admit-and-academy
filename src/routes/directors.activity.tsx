import { createFileRoute } from "@tanstack/react-router";
import ActivityPage from "@/components/directors/pages/ActivityPage";

export const Route = createFileRoute("/directors/activity")({
  component: ActivityPage,
});
