import { FileText } from "lucide-react";

import { EmptyState } from "@/components/lisaan/empty-state";

export default function AdminGradingPage() {
  return (
    <div className="rounded-2xl border border-stroke-default bg-bg-surface">
      <EmptyState
        icon={FileText}
        title="No essays waiting"
        body="Essay submissions get an AI-assisted score first — you'll only see the ones worth a second look."
      />
    </div>
  );
}
