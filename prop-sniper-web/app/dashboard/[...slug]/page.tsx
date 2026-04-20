import DashboardRouteClient from "../DashboardRouteClient";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

export default async function DashboardSlugPage({ params }: PageProps) {
  const { slug } = await params;

  return <DashboardRouteClient params={{ slug }} />;
}
