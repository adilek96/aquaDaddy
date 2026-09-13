import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar, AdminMobileNav } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  return (
    // min-h-dvh вместо h-screen: на мобильных 100vh не учитывает адресную
    // строку, из-за чего нижняя часть панели уезжала за край экрана
    <div className="flex min-h-dvh bg-slate-950 text-white">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-x-hidden p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
        {children}
      </main>

      <AdminMobileNav />
    </div>
  );
}
