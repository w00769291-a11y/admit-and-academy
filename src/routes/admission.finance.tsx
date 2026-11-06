import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admission/finance")({
  head: () => ({
    meta: [
      { title: "Skill AI Admissions Finance — Edusphere" },
      { name: "description", content: "Manage tuition finance within Skill AI Admissions." },
      { property: "og:title", content: "Skill AI Admissions Finance — Edusphere" },
      { property: "og:description", content: "Manage tuition finance within Skill AI Admissions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/admission/applications" });
  },
});
