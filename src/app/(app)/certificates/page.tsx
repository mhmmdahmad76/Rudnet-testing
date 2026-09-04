import { Award } from "lucide-react";

import { EmptyState } from "@/components/lisaan/empty-state";

export default function CertificatesPage() {
  return (
    <div className="rounded-2xl border border-stroke-default bg-bg-surface">
      <EmptyState
        icon={Award}
        title="No certificates yet"
        body="Finish a course to earn a certificate — it'll show up here, ready to download and share."
      />
    </div>
  );
}
