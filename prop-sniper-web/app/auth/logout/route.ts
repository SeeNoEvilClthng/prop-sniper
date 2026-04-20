import { notFound } from "next/navigation";
import { findNavMeta } from "../dashboardData";
import DashboardRouteClient from "../DashboardRouteClient";

export default async function DashboardRoutePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const pathname = `/dashboard/${slug.join("/")}`;
  const meta = findNavMeta(pathname);

  if (!meta) {
    notFound();
  }

  return <DashboardRouteClient pathname={pathname} />;
}