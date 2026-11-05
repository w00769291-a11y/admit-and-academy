import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Mail, Phone, Star, ClipboardList, LayoutDashboard, Users, Trophy, TrendingUp } from "lucide-react";
import { Section, StatCard } from "@/components/ui/page";
import { useSales, agentStats } from "@/lib/sales-store";
import { FollowUpBoard } from "@/components/sales/follow-up/follow-up-board";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/agent/$id")({
  head: (ctx) => {
    const name = ctx.params.id;
    return {
      meta: [
        { title: `Agent Dashboard (${name})` },
        { name: "description", content: "Agent portal: personal dashboard, follow-up board with candidate enquiry details and the student follow-up form." },
        { property: "og:title", content: "Agent Dashboard" },
        { property: "og:description", content: "Agent portal: dashboard, follow-up board and enquiry forms." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: AgentPortal,
});

function AgentPortal() {
  const { id } = useParams({ from: "/agent/$id" });
  const state = useSales();
  const [tab, setTab] = useState<"dashboard" | "followup">("dashboard");
  const agent = state.agents.find((a) => a.id === id);

  if (!agent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold">Agent not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This agent link is no longer valid. Please ask your manager for a fresh link.
          </p>
        </div>
      </div>
    );
  }

  const s = agentStats(state, agent.id);
  const leads = state.leads.filter((l) => l.agentId === agent.id);
  const calls = state.calls.filter((c) => c.agentId === agent.id);

  const trend = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => ({
    d,
    calls: Math.max(2, Math.round((s.calls / 7) * (1 + Math.sin(i) * 0.4))),
    sales: Math.max(0, Math.round((s.won / 7) * (1 + Math.cos(i) * 0.6))),
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div className="rounded-xl border border-border bg-card p-5 shadow-soft flex flex-wrap items-center gap-4">
          <div className="size-14 rounded-full bg-primary/15 text-primary text-base font-bold grid place-items-center">
            {agent.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">{agent.name}</h1>
            <div className="text-xs text-muted-foreground">{agent.team} · {agent.id}</div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Mail className="size-3.5" /> {agent.email}</span>
              <span className="inline-flex items-center gap-1"><Phone className="size-3.5" /> {agent.phone}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1 text-sm font-semibold">
              <Star className="size-4 fill-warning text-warning" /> {agent.rating.toFixed(1)}
            </div>
            <div className="text-[11px] text-muted-foreground">Performance rating</div>
          </div>
        </div>

        <div className="flex gap-1 border-b">
          {([["dashboard", "Agent Dashboard", LayoutDashboard], ["followup", "Follow Up", ClipboardList]] as const).map(([k, l, Icon]) => (
            <button key={k} onClick={() => setTab(k)}
              className={cn("inline-flex items-center gap-1.5 -mb-px border-b-2 px-4 py-2 text-sm font-semibold transition",
                tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
              <Icon className="size-4" /> {l}
            </button>
          ))}
        </div>

        {tab === "followup" ? (
          <FollowUpBoard agent={agent} leads={leads} />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Leads assigned" value={String(s.leads)} icon={Users} />
              <StatCard label="Calls made" value={String(s.calls)} icon={Phone} />
              <StatCard label="Won" value={String(s.won)} icon={Trophy} />
              <StatCard label="Revenue" value={`₹${s.revenue.toLocaleString("en-IN")}`} icon={TrendingUp} />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Section title="Weekly activity">
                {s.calls === 0 && s.won === 0 ? (
                  <div className="text-sm text-muted-foreground">No activity yet.</div>
                ) : (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend}>
                        <defs>
                          <linearGradient id="agentPortalFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="d" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                        <Area isAnimationActive={false} type="monotone" dataKey="calls" stroke="var(--color-primary)" fill="url(#agentPortalFill)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Section>
              <Section title="Leads by source">
                {(() => {
                  const bySource = ["Website", "Facebook", "Referral", "Google Ads", "Walk-in", "Instagram", "Upload", "Manual"]
                    .map((src) => ({ src, n: leads.filter((l) => l.source === src).length }))
                    .filter((r) => r.n > 0);
                  if (bySource.length === 0) return <div className="text-sm text-muted-foreground">No leads yet.</div>;
                  return (
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={bySource}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <XAxis dataKey="src" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                          <Bar isAnimationActive={false} dataKey="n" radius={[6, 6, 0, 0]} fill="var(--color-primary)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })()}
              </Section>
            </div>
            <Section title="My assigned leads">
              <div className="overflow-x-auto -m-5">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium">Lead</th>
                      <th className="px-3 py-3 text-left font-medium">Source</th>
                      <th className="px-3 py-3 text-left font-medium">Interest</th>
                      <th className="px-3 py-3 text-right font-medium">Value</th>
                      <th className="px-5 py-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((l) => (
                      <tr key={l.id} className="border-t border-border hover:bg-secondary/40">
                        <td className="px-5 py-3">
                          <div className="font-medium">{l.name}</div>
                          <div className="text-[11px] text-muted-foreground">{l.phone}</div>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">{l.source}</td>
                        <td className="px-3 py-3 text-muted-foreground">{l.interest}</td>
                        <td className="px-3 py-3 text-right tabular-nums">₹{l.value.toLocaleString("en-IN")}</td>
                        <td className="px-5 py-3">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-secondary text-secondary-foreground">{l.status}</span>
                        </td>
                      </tr>
                    ))}
                    {leads.length === 0 && (
                      <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">No leads assigned yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
