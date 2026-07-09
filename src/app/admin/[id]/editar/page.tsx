import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import PetFichaForm from "@/components/PetFichaForm";

export const metadata: Metadata = { title: "Editar ficha" };

export default async function EditarFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const record = await prisma.petRecord.findUnique({ where: { id } });
  if (!record) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href={`/admin/${id}`} className="text-sm font-semibold text-teal hover:underline">
        ← Volver a la ficha
      </Link>
      <h1 className="mt-2 text-3xl font-black text-navy">Editar ficha</h1>
      <p className="mb-8 mt-2 text-slate-600">
        {record.petName} · <span className="font-mono">{record.registrationNo}</span>
      </p>
      <PetFichaForm record={record} />
    </div>
  );
}
