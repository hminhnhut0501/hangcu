import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const nextUrl = typeof params.next === "string" && params.next.trim() ? params.next : "/admin";
  return (
    <AdminLoginForm nextUrl={nextUrl} />
  );
}
