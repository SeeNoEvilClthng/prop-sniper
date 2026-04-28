import type { ReactNode } from "react";

import WorkspaceLayout from "@/components/ui/WorkspaceLayout";

export default function LeadsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}
