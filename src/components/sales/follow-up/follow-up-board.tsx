import { useMemo, useState } from "react";
import {
  Phone, MessageCircle, Star, StickyNote, Bell, Share2, Tag, Clock, CheckCircle2, Ban,
  PhoneOff, Shapes, MapPinOff, Briefcase, ChevronDown, ChevronUp, Plus, X, Flame, EyeOff, PhoneMissed,
} from "lucide-react";
import { useCloudState } from "@/lib/cloud-state";
import type { Agent, Lead } from "@/lib/sales-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const OUTCOMES = [
  { key: "Follow Up", icon: Clock },
  { key: "Deal Close", icon: CheckCircle2 },
  { key: "Not Interested", icon: Ban },
  { key: "Not Contactable", icon: PhoneOff },
  { key: "Wrong Category", icon: Shapes },
  { key: "Out of Area", icon: MapPinOff },
  { key: "Marketing / Job", icon: Briefcase },
] as const;

const SOURCES = ["Facebook", "WhatsApp", "Instagram", "Newspaper", "Banner / Flex", "Notice / Calendar", "Friend's Referral", "Staff / Ex-Student Referral", "Google / Website", "Others"];
const REASONS = ["Fees", "Location", "Timing", "Joined elsewhere", "Not interested"];

export type FollowUpEntry = { date: string; status: string; note: string };
export type Reference = { name: string; phone: string; qualification: string; college: string; place: string; remarks: string };
export type Enquiry = {
  id: string;
  formNo: string;
  createdAt: string;
  name: string;
  phone: string;
  dob: string;
  gender: string;
  email: string;
  course: string;
  address: string;
  city: string;
  query: string;
  sources: string[];
  priority: "Hot" | "Warm" | "Cold";
  demo: string;
  nextAction: string;
  demoDate: string;
  reasons: string[];
  outcome?: string;
  starred: boolean;
  hidden: boolean;
  read: boolean;
  missed: boolean;
  notes: string;
  reminder: string;
  followUps: FollowUpEntry[];
  references: Reference[];
};

function fromLead(l: Lead, i: number): Enquiry {
  return {
    id: l.id, formNo: `FU-${String(1001 + i)}`, createdAt: l.uploadedAt, name: l.name, phone: l.phone,
    dob: "", gender: "", email: l.email, course: l.interest, address: "", city: "", 
    query: `${l.name.split(" ")[0]} enquired for ${l.interest}.`, sources: [l.source], 
    priority: i % 3 === 0 ? "Hot" : i % 3 === 1 ? "Warm" : "Cold", demo: "", nextAction: "", demoDate: "",
    reasons: [], starred: false, hidden: false, read: i % 2 === 0, missed: i % 5 === 2, notes: "", reminder: "",
    followUps: [], references: [],
  };
}

const blank = (n: number): Enquiry => ({
  ...fromLead({ id: `E${Date.now()}`, name: "", phone: "", email: "", source: "", interest: "", status: "New", value: 0, uploadedAt: new Date().toISOString() }, n),
  query: "", sources: [], priority: "Warm", read: false, missed: false,
});

const FILTERS = [
  { k: "All", icon: null },
  { k: "Unresponded", icon: Phone },
  { k: "Hidden", icon: EyeOff },
  { k: "Starred", icon: Star },
  { k: "Notes", icon: StickyNote },
  { k: "Missed Call", icon: PhoneMissed },
  { k: "Hot Enquiries", icon: Flame },
] as const;

export function FollowUpBoard({ agent, leads, scope }: { agent?: Agent; leads: Lead[]; scope?: string }) {
  const [items, setItems] = useCloudState<Enquiry[]>(`followups.${scope ?? agent?.id ?? "all"}`, leads.map(fromLead));
  const [filter, setFilter] = useState<string>("All");
  const [outcomeFilter, setOutcomeFilter] = useState("");
  const [editing, setEditing] = useState<Enquiry | null>(null);

  const update = (id: string, patch: Partial<Enquiry>) =>
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const shown = useMemo(() => items.filter((e) => {
    if (outcomeFilter && e.outcome !== outcomeFilter) return false;
    switch (filter) {
      case "Hidden": return e.hidden;
      case "Unresponded": return !e.hidden && !e.outcome;
      case "Starred": return !e.hidden && e.starred;
      case "Notes": return !e.hidden && !!e.notes;
      case "Missed Call": return !e.hidden && e.missed;
      case "Hot Enquiries": return !e.hidden && e.priority === "Hot";
      default: return !e.hidden;
    }
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [items, filter, outcomeFilter]);

  const save = (e: Enquiry) => {
    setItems((xs) => (xs.some((x) => x.id === e.id) ? xs.map((x) => (x.id === e.id ? e : x)) : [e, ...xs]));
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold">Total Enquiries : {items.filter((e) => !e.hidden).length}</h3>
          <Button size="sm" className="gap-1.5" onClick={() => setEditing(blank(items.length))}>
            <Plus className="size-4" /> Add follow-up
          </Button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button key={f.k} onClick={() => setFilter(f.k)}
              className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition",
                filter === f.k ? "border-primary bg-primary/10 text-primary" : "bg-background hover:bg-accent")}>
              {f.icon && <f.icon className="size-4" />}{f.k}
            </button>
          ))}
          <select value={outcomeFilter} onChange={(e) => setOutcomeFilter(e.target.value)}
            className="shrink-0 rounded-md border bg-background px-3 py-1.5 text-sm font-medium">
            <option value="">Enquiry Status</option>
            {OUTCOMES.map((o) => <option key={o.key}>{o.key}</option>)}
          </select>
        </div>
      </div>

      {shown.length === 0 && <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">No enquiries here.</div>}
      {shown.map((e) => <EnquiryCard key={e.id} e={e} update={update} onEdit={() => setEditing(e)} />)}

      {editing && <FollowUpForm initial={editing} agent={agent} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function EnquiryCard({ e, update, onEdit }: { e: Enquiry; update: (id: string, p: Partial<Enquiry>) => void; onEdit: () => void }) {
  const [open, setOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const wa = e.phone.replace(/\D/g, "");
  const when = new Date(e.createdAt);
  const days = Math.max(0, Math.round((Date.now() - when.getTime()) / 86400000));

  return (
    <div className="rounded-xl border bg-card p-4 shadow-soft" onClick={() => !e.read && update(e.id, { read: true })}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase">
            <span className={cn("rounded px-1.5 py-0.5", e.read ? "bg-primary/10 text-primary" : "bg-warning/15 text-warning")}>• {e.read ? "Read" : "New"}</span>
            {e.priority === "Hot" && <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-destructive">🔥 Hot enquiry</span>}
            {e.outcome && <span className="rounded bg-success/10 px-1.5 py-0.5 text-success">{e.outcome}</span>}
            <span className="text-muted-foreground normal-case font-medium">{e.formNo}</span>
          </div>
          <button onClick={() => update(e.id, { starred: !e.starred })} className="mt-1 flex items-center gap-1.5 text-left text-base font-bold">
            <Star className={cn("size-4", e.starred && "fill-warning text-warning")} />{e.name || "Unnamed"}
          </button>
          {e.city && <p className="text-sm">{e.city}</p>}
          <p className="text-sm">{e.course}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs text-muted-foreground">{when.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
          <div className="flex gap-2">
            <a href={`tel:${e.phone}`} aria-label="Call" className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground"><Phone className="size-5" /></a>
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="grid size-10 place-items-center rounded-lg bg-success text-primary-foreground"><MessageCircle className="size-5" /></a>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
        <Chip icon={StickyNote} onClick={() => setNoteOpen((v) => !v)}>View Note</Chip>
        <Chip icon={Tag} onClick={onEdit}>Follow-up Form</Chip>
        <label className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium">
          <Bell className="size-3.5" /> Reminder
          <input type="datetime-local" value={e.reminder} onChange={(ev) => update(e.id, { reminder: ev.target.value })} className="bg-transparent text-xs outline-none" />
        </label>
        <Chip icon={Share2} onClick={() => navigator.clipboard?.writeText(`${e.name} — ${e.phone} — ${e.course}`)}>Share</Chip>
        <Chip icon={EyeOff} onClick={() => update(e.id, { hidden: !e.hidden })}>{e.hidden ? "Unhide" : "Hide"}</Chip>
      </div>
      {noteOpen && (
        <textarea value={e.notes} onChange={(ev) => update(e.id, { notes: ev.target.value })} placeholder="Add a note…"
          className="mt-2 w-full rounded-md border bg-background p-2 text-sm" rows={2} />
      )}

      {e.query && <><p className="mt-3 text-xs text-muted-foreground">Query</p><p className="text-sm font-semibold">{e.query}</p></>}
      <p className="mt-2 text-xs text-muted-foreground">Enquiry Source</p>
      <p className="text-sm font-semibold">{e.sources.join(", ") || "—"}</p>

      <div className="mt-2 flex items-center justify-between">
        <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          {open ? "Hide Details" : "Show Details"} {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        <span className="text-xs text-muted-foreground">Connected {days === 0 ? "today" : `${days} Day${days > 1 ? "s" : ""} Ago`}</span>
      </div>

      {open && (
        <div className="mt-2 rounded-lg bg-accent p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {OUTCOMES.map((o) => (
              <button key={o.key}
                onClick={() => { update(e.id, { outcome: o.key }); if (o.key === "Follow Up") onEdit(); }}
                className={cn("flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-left text-sm transition hover:border-primary",
                  e.outcome === o.key && "border-primary bg-primary/10 font-semibold text-primary")}>
                <o.icon className="size-4" />{o.key}
              </button>
            ))}
          </div>
          {e.followUps.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Follow-up history</p>
              {e.followUps.map((f, i) => (
                <div key={i} className="flex justify-between rounded bg-card px-3 py-1.5 text-xs"><span>{f.date} · {f.note}</span><span className="font-semibold">{f.status}</span></div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Chip({ icon: Icon, children, onClick }: { icon: typeof Star; children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium hover:bg-accent">
      <Icon className="size-3.5" />{children}
    </button>
  );
}

/* ---------- Student Follow Up Form (from the Skill AI form) ---------- */

function FollowUpForm({ initial, agent, onClose, onSave }: { initial: Enquiry; agent: Agent | undefined; onClose: () => void; onSave: (e: Enquiry) => void }) {
  const [f, setF] = useState<Enquiry>(initial);
  const [fu, setFu] = useState<FollowUpEntry>({ date: new Date().toISOString().slice(0, 10), status: "Follow Up", note: "" });
  const set = <K extends keyof Enquiry>(k: K, v: Enquiry[K]) => setF((x) => ({ ...x, [k]: v }));
  const toggle = (k: "sources" | "reasons", v: string) => set(k, f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v]);
  const setRef = (i: number, k: keyof Reference, v: string) => set("references", f.references.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  const submit = () => {
    if (!f.name.trim() || !f.phone.trim()) return alert("Student name and phone are required.");
    const followUps = fu.note.trim() ? [...f.followUps, fu] : f.followUps;
    onSave({ ...f, followUps, city: f.city || f.address.split(",").pop()?.trim() || "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4" onClick={onClose}>
      <div className="my-6 w-full max-w-3xl rounded-2xl border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <p className="text-xs font-semibold text-primary">Skill AI</p>
            <h2 className="text-lg font-extrabold tracking-tight">STUDENT FOLLOW UP FORM</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1.5 hover:bg-accent"><X className="size-5" /></button>
        </div>

        <div className="space-y-6 px-6 py-5 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Application Form No"><input className="fi" value={f.formNo} onChange={(e) => set("formNo", e.target.value)} /></Field>
            <Field label="Date"><input className="fi" type="date" value={f.createdAt.slice(0, 10)} onChange={(e) => set("createdAt", new Date(e.target.value).toISOString())} /></Field>
          </div>

          <Block title="Student Details">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Student Name *"><input className="fi" value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
              <Field label="Phone No *"><input className="fi" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
              <Field label="Date of Birth"><input className="fi" type="date" value={f.dob} onChange={(e) => set("dob", e.target.value)} /></Field>
              <Field label="Gender">
                <select className="fi" value={f.gender} onChange={(e) => set("gender", e.target.value)}>
                  <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
                </select>
              </Field>
              <Field label="Email"><input className="fi" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
              <Field label="Course Interested"><input className="fi" value={f.course} onChange={(e) => set("course", e.target.value)} /></Field>
              <Field label="City"><input className="fi" value={f.city} onChange={(e) => set("city", e.target.value)} /></Field>
              <Field label="Address"><input className="fi" value={f.address} onChange={(e) => set("address", e.target.value)} /></Field>
            </div>
            <Field label="Query"><textarea className="fi" rows={2} value={f.query} onChange={(e) => set("query", e.target.value)} /></Field>
          </Block>

          <Block title="Where did the student hear about Skill AI?">
            <div className="grid gap-2 sm:grid-cols-3">
              {SOURCES.map((s) => <Check key={s} label={s} on={f.sources.includes(s)} onChange={() => toggle("sources", s)} />)}
            </div>
          </Block>

          <Block title="Lead Outcome & Admission">
            <div className="grid gap-4 sm:grid-cols-2">
              <Radios label="Lead Priority" opts={["Hot", "Warm", "Cold"]} value={f.priority} onChange={(v) => set("priority", v as Enquiry["priority"])} />
              <Radios label="Demo Class / Counselling" opts={["Offered", "Attended", "Not Attended"]} value={f.demo} onChange={(v) => set("demo", v)} />
              <Radios label="Next Action" opts={["Brochure", "Demo", "Follow up"]} value={f.nextAction} onChange={(v) => set("nextAction", v)} />
              <Field label="Demo Date"><input className="fi" type="date" value={f.demoDate} onChange={(e) => set("demoDate", e.target.value)} /></Field>
            </div>
            <p className="mt-3 text-xs font-semibold text-muted-foreground">Reason for Not Joining</p>
            <div className="mt-1 flex flex-wrap gap-3">
              {REASONS.map((r) => <Check key={r} label={r} on={f.reasons.includes(r)} onChange={() => toggle("reasons", r)} />)}
            </div>
          </Block>

          <Block title="Follow Up Details">
            {f.followUps.length > 0 && (
              <table className="mb-3 w-full text-xs">
                <thead className="text-muted-foreground"><tr><th className="text-left">SL</th><th className="text-left">Date</th><th className="text-left">Note</th><th className="text-left">Status</th></tr></thead>
                <tbody>{f.followUps.map((x, i) => <tr key={i} className="border-t"><td className="py-1">{i + 1}</td><td>{x.date}</td><td>{x.note}</td><td>{x.status}</td></tr>)}</tbody>
              </table>
            )}
            <div className="grid gap-2 sm:grid-cols-[140px_160px_1fr]">
              <input className="fi" type="date" value={fu.date} onChange={(e) => setFu({ ...fu, date: e.target.value })} />
              <select className="fi" value={fu.status} onChange={(e) => setFu({ ...fu, status: e.target.value })}>
                {OUTCOMES.map((o) => <option key={o.key}>{o.key}</option>)}
              </select>
              <input className="fi" placeholder="What happened on this call? (added when you save)" value={fu.note} onChange={(e) => setFu({ ...fu, note: e.target.value })} />
            </div>
          </Block>

          <Block title="Reference Follow Up">
            {f.references.map((r, i) => (
              <div key={i} className="mb-2 grid gap-2 sm:grid-cols-6">
                {(["name", "phone", "qualification", "college", "place", "remarks"] as const).map((k) => (
                  <input key={k} className="fi" placeholder={k[0]!.toUpperCase() + k.slice(1)} value={r[k]} onChange={(e) => setRef(i, k, e.target.value)} />
                ))}
              </div>
            ))}
            <Button size="sm" variant="outline" className="gap-1" onClick={() => set("references", [...f.references, { name: "", phone: "", qualification: "", college: "", place: "", remarks: "" }])}>
              <Plus className="size-4" /> Add reference
            </Button>
          </Block>

          <p className="text-xs text-muted-foreground">Checked by sales executive: <b>{agent?.name ?? "—"}</b></p>
        </div>

        <div className="flex justify-end gap-2 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Save follow-up</Button>
        </div>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 border-b pb-1 text-xs font-bold uppercase tracking-wider text-primary">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}
function Check({ label, on, onChange }: { label: string; on: boolean; onChange: () => void }) {
  return <label className="inline-flex items-center gap-2"><input type="checkbox" checked={on} onChange={onChange} className="size-4 accent-primary" />{label}</label>;
}
function Radios({ label, opts, value, onChange }: { label: string; opts: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-3">
        {opts.map((o) => <label key={o} className="inline-flex items-center gap-1.5"><input type="radio" checked={value === o} onChange={() => onChange(o)} className="accent-primary" />{o}</label>)}
      </div>
    </div>
  );
}
