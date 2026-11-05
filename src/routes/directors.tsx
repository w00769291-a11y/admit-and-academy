import { createFileRoute } from "@tanstack/react-router";
import DirectorsLayout from "@/components/directors/components/Layout";
import { AppShell } from "@/components/AppShell";
import { AppProvider } from "@/components/directors/store/AppContext";

// Directors module shell (skillai dashboard): sidebar + topbar + content outlet.
// AppProvider must wrap the layout: the sidebar and all directors pages read useApp().
export const Route = createFileRoute("/directors")({
  head: () => ({
    meta: [
      { title: "Director's Office — Institute Management" },
      { name: "description", content: "Directors dashboard for approvals, staff, schedule and reports." },
      { property: "og:title", content: "Director's Office — Institute Management" },
      { property: "og:description", content: "Directors dashboard for approvals, staff, schedule and reports." },
    ],
  }),
  component: DirectorsRoute,
});

function DirectorsRoute() {
  return (
    <AppShell title="Directors">
      <AppProvider>
        <DirectorsLayout />
      </AppProvider>
    </AppShell>
  );
}
