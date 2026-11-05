import { createFileRoute } from "@tanstack/react-router";
import ProfilePage from "@/components/directors/pages/ProfilePage";

export const Route = createFileRoute("/directors/profile")({
  component: ProfilePage,
});
