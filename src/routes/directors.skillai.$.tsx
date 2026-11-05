import { createFileRoute } from "@tanstack/react-router";
import SkillAIApp, { SKILLAI_TABS } from "@/components/skillai/SkillAIApp";
import { Link, useLocation } from "@/components/skillai/router";

export const Route = createFileRoute("/directors/skillai/$")({
  head: () => ({
    meta: [
      { title: "SkillAI · Director's Office" },
      { name: "description", content: "SkillAI director dashboard: approvals, schedule, performance and reports." },
      { property: "og:title", content: "SkillAI · Director's Office" },
      { property: "og:description", content: "SkillAI director dashboard: approvals, schedule, performance and reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SkillAIRoute,
});

export function SkillAIRoute() {
  const { pathname } = useLocation();
  return (
    <div>
      <nav aria-label="SkillAI sections" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {SKILLAI_TABS.map(([to, label]) => {
          const on = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link key={to} to={to} className={`sidebar-link${on ? " active" : ""}`} style={{ width: "auto" }}>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <SkillAIApp />
    </div>
  );
}
