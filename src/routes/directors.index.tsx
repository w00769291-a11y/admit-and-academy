import { createFileRoute } from "@tanstack/react-router";
import DashboardPage from "@/components/directors/pages/DashboardPage";

export const Route = createFileRoute("/directors/")({
  head: () => ({
    meta: [
      { title: "Directors Dashboard — Manager Edu" },
      { name: "description", content: "Directors office dashboard: approvals, tasks, performance and institute overview." },
      { property: "og:title", content: "Directors Dashboard — Manager Edu" },
      { property: "og:description", content: "Directors office dashboard: approvals, tasks, performance and institute overview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});
