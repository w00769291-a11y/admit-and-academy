import { createFileRoute } from "@tanstack/react-router";
import SettingsPage from "@/components/directors/pages/SettingsPage";

export const Route = createFileRoute("/directors/settings")({
  component: SettingsPage,
});
