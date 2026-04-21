import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { AdminAppShell } from "@/components/admin/admin-app-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) {
    redirect("/login?next=/admin");
  }
  if (profile.role !== "admin") {
    redirect("/garagem");
  }

  const userLabel = profile.full_name?.trim() || "Administrador";

  return <AdminAppShell userLabel={userLabel}>{children}</AdminAppShell>;
}
