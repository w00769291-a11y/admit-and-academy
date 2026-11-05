import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/ui/page";
import { FollowUpBoard } from "@/components/sales/follow-up/follow-up-board";
import { useSales } from "@/lib/sales-store";

export const Route = createFileRoute("/admission/follow-up")({
  head: () => ({
    meta: [
      { title: "Follow Up — Admission" },
      { name: "description", content: "Justdial-style enquiry follow-up board: candidate details, call & WhatsApp actions, outcomes and the student follow-up form." },
      { property: "og:title", content: "Follow Up — Admission" },
      { property: "og:description", content: "Enquiry follow-up board with candidate details and outcome actions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FollowUpPage,
});

function FollowUpPage() {
  const { leads } = useSales();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <ClipboardList className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Follow Up</h2>
          <p className="text-xs text-muted-foreground">
            Every enquiry across agents — call, WhatsApp, note, reminder and outcome in one list.
          </p>
        </div>
      </div>
      <FollowUpBoard leads={leads} scope="all" />
    </div>
  );
}
