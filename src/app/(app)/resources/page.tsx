import { Folder } from "lucide-react";

import { EmptyState } from "@/components/lisaan/empty-state";

export default function ResourcesPage() {
  return (
    <div className="rounded-2xl border border-stroke-default bg-bg-surface">
      <EmptyState
        icon={Folder}
        title="No resources yet"
        body="Downloadable worksheets and cheat sheets will show up here as your instructor publishes them."
      />
    </div>
  );
}
