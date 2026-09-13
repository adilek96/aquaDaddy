import { prisma } from "@/lib/prisma";
import { deleteAquariumAdmin } from "@/actions/admin";

async function getAquariums() {
  return await prisma.aquarium.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true },
      },
      _count: {
        select: { inhabitants: true, comments: true },
      },
    },
  });
}

export default async function AdminAquariumsPage() {
  const aquariums = await getAquariums();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Aquarium Management</h1>
        <p className="text-slate-400 mt-2">Monitor and moderate all user-created aquariums on the platform.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50">
              <th className="p-4 font-medium text-slate-400">Name / ID</th>
              <th className="p-4 font-medium text-slate-400">Owner</th>
              <th className="p-4 font-medium text-slate-400">Type</th>
              <th className="p-4 font-medium text-slate-400">Visibility</th>
              <th className="p-4 font-medium text-slate-400 text-center">Stats</th>
              <th className="p-4 font-medium text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {aquariums.map((tank) => (
              <tr key={tank.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-blue-400">{tank.name}</div>
                  <div className="text-[10px] font-mono text-slate-600 mt-0.5">{tank.id}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-medium text-slate-200">{tank.user.name || "Anonymous"}</div>
                  <div className="text-xs text-slate-500">{tank.user.email}</div>
                </td>
                <td className="p-4">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">{tank.type}</span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                    tank.isPublic ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                  }`}>
                    {tank.isPublic ? "Public" : "Private"}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
                    <span title="Inhabitants">{tank._count.inhabitants} 🐟</span>
                    <span title="Comments">{tank._count.comments} 💬</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                   <div className="flex justify-end gap-2">
                    <form action={deleteAquariumAdmin.bind(null, tank.id)}>
                      <button 
                        type="submit"
                        className="text-rose-400 hover:text-white hover:bg-rose-500/20 px-3 py-1 border border-rose-900/30 rounded-lg text-xs transition-all font-medium"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
