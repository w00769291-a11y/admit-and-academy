import { createFileRoute } from "@tanstack/react-router";
import ApprovalsPage from "@/components/directors/pages/ApprovalsPage";

export const Route = createFileRoute("/directors/approvals")({
  component: ApprovalsPage,
});
