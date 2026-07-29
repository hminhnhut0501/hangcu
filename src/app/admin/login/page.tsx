import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const requestedNext = typeof params.next === "string" ? params.next.trim() : "";
  const nextUrl = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/admin";
  return (
    <AdminLoginForm nextUrl={nextUrl} />
  );
}
