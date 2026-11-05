import { createFileRoute } from "@tanstack/react-router";
import { SkillAIRoute } from "./directors.skillai.$";

export const Route = createFileRoute("/directors/skillai/")({
  head: () => ({
    meta: [
      { title: "SkillAI Dashboard · Director's Office" },
      { name: "description", content: "SkillAI overview for directors: approvals, tasks and performance at a glance." },
      { property: "og:title", content: "SkillAI Dashboard · Director's Office" },
      { property: "og:description", content: "SkillAI overview for directors: approvals, tasks and performance at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SkillAIRoute,
});
