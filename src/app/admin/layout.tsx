import { AdminShell } from "@/components/admin/admin-shell";
import { AdminMuiProvider } from "@/components/admin/admin-mui-provider";

export default function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminMuiProvider>
      <AdminShell>{children}</AdminShell>
    </AdminMuiProvider>
  );
}
