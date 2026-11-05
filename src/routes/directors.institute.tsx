import { createFileRoute } from "@tanstack/react-router";
import InstitutePage from "@/components/directors/pages/InstitutePage";

export const Route = createFileRoute("/directors/institute")({
  component: InstitutePage,
});
