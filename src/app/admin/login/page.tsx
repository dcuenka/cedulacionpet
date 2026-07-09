import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import AdminLoginForm from "@/components/AdminLoginForm";

export const metadata: Metadata = { title: "Administración" };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-black text-navy">Panel de administración</h1>
        <p className="mb-6 mt-1 text-sm text-slate-600">
          Acceso al respaldo de registros nacionales.
        </p>
        <AdminLoginForm />
      </div>
    </div>
  );
}
