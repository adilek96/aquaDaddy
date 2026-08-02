import { prisma } from "@/lib/prisma";
import { toggleUserStatus } from "@/actions/admin";

async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { aquariums: true, comments: true },
      },
    },
  });
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-mono uppercase tracking-tighter">User Directory</h1>
        <p className="text-slate-400 mt-2">Manage user accounts and monitor platform growth metrics.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40">
              <th className="p-4 font-semibold text-slate-400 uppercase text-[10px] tracking-widest leading-none">Avatar / User</th>
              <th className="p-4 font-semibold text-slate-400 uppercase text-[10px] tracking-widest leading-none">Joined On</th>
              <th className="p-4 font-semibold text-slate-400 uppercase text-[10px] tracking-widest leading-none text-center">Aquariums</th>
              <th className="p-4 font-semibold text-slate-400 uppercase text-[10px] tracking-widest leading-none text-center">Comments</th>
              <th className="p-4 font-semibold text-slate-400 uppercase text-[10px] tracking-widest leading-none text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-800/20 transition-all duration-200">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                      {user.image ? (
                        <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-400 text-sm font-bold">{(user.name || "U")[0]}</span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-200">{user.name || "Anonymous"}</div>
                      <div className="text-[10px] font-mono text-slate-500 lowercase tracking-tighter">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-xs font-medium text-slate-400">
                  {user.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="p-4 text-center">
                  <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-md border border-blue-400/20">
                    {user._count.aquariums}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <span className="text-xs font-bold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-md border border-purple-400/20">
                    {user._count.comments}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <form action={toggleUserStatus.bind(null, user.id)}>
                    <button
                      type="submit"
                      disabled
                      title="Требуется поле статуса в модели User"
                      className="text-[10px] font-bold uppercase tracking-widest text-slate-600 cursor-not-allowed"
                    >
                      Suspend
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
