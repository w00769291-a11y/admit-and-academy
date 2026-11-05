import { createFileRoute } from "@tanstack/react-router";
import NotificationsPage from "@/components/directors/pages/NotificationsPage";

export const Route = createFileRoute("/directors/notifications")({
  component: NotificationsPage,
});
