import { prisma } from "@/lib/prisma";
import { Users, Droplets, MessageSquare, Star } from "lucide-react";
import { AdminCharts } from "@/components/admin/Charts";

async function getStats() {
  const [userCount, aquariumCount, commentCount, ratingCount] = await Promise.all([
    prisma.user.count(),
    prisma.aquarium.count(),
    prisma.comment.count(),
    prisma.rating.count(),
  ]);

  // Fetch user growth for the last 30 days
  const usersByDay = await prisma.$queryRaw`
    SELECT DATE_TRUNC('day', "createdAt") as day, COUNT(*) as count
    FROM "User"
    WHERE "createdAt" > NOW() - INTERVAL '30 days'
    GROUP BY day
    ORDER BY day ASC
  ` as { day: Date, count: bigint }[];

  const chartData = usersByDay.map(d => ({
    name: d.day.toISOString().split('T')[0],
    users: Number(d.count)
  }));

  const typeData = [
    { name: 'Freshwater', value: await prisma.aquarium.count({ where: { type: 'FRESHWATER' } }) },
    { name: 'Saltwater', value: await prisma.aquarium.count({ where: { type: 'SALTWATER' } }) },
  ];

  return { userCount, aquariumCount, commentCount, ratingCount, chartData, typeData };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: "Total Users", value: stats.userCount, icon: Users, color: "text-blue-500" },
    { label: "Active Tanks", value: stats.aquariumCount, icon: Droplets, color: "text-cyan-500" },
    { label: "Comments", value: stats.commentCount, icon: MessageSquare, color: "text-purple-500" },
    { label: "Total Ratings", value: stats.ratingCount, icon: Star, color: "text-yellow-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Admin Dashboard</h1>
        <p className="text-slate-400 mt-2">Manage the platform and monitor community activity.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <card.icon className={card.color} size={24} />
            </div>
            <div className="text-2xl font-bold text-white" data-numeric>{card.value}</div>
            <div className="text-sm text-slate-400 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <AdminCharts growthData={stats.chartData} distributionData={stats.typeData} />
    </div>
  );
}
