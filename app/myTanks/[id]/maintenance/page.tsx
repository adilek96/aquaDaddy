import MaintenancePageClient from "../../../../components/component/MaintenancePageClient";

// Серверный компонент-обертка
export default async function MaintenancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MaintenancePageClient id={id} />;
}
