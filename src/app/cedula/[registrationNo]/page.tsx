import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { qrDataUrl, localizeUrl, lookupCode } from "@/lib/qr";
import CedulaCard from "@/components/CedulaCard";

export default async function CedulaPage({
  params,
}: {
  params: Promise<{ registrationNo: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { registrationNo } = await params;
  const record = await prisma.petRecord.findUnique({
    where: { registrationNo: decodeURIComponent(registrationNo) },
  });
  if (!record) notFound();

  const code = lookupCode(record);
  const qr = await qrDataUrl(code);
  const url = localizeUrl(code);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="no-print mb-6 rounded-xl border border-teal/30 bg-teal/5 p-5">
        <h1 className="text-xl font-black text-navy">✓ ¡Ficha creada!</h1>
        <p className="mt-1 text-sm text-slate-600">
          La cédula de <strong>{record.petName}</strong> se emitió con el número{" "}
          <strong className="font-mono">{record.registrationNo}</strong> y quedó
          guardada en el sistema.
          {!record.microchip && (
            <>
              {" "}
              <span className="font-semibold text-amber-700">
                Recuerda registrar el número de serie del microchip
              </span>{" "}
              cuando se implante, editando la ficha.
            </>
          )}
        </p>
      </div>

      <CedulaCard record={record} qr={qr} />

      <div className="no-print mt-6 flex flex-wrap gap-3">
        <a
          href={`/api/cedula/${encodeURIComponent(record.registrationNo)}`}
          className="rounded-lg bg-teal px-6 py-3 font-semibold text-white transition hover:bg-teal-600"
        >
          ⬇ Descargar cédula (PDF)
        </a>
        <a
          href={`/api/pasaporte/${encodeURIComponent(record.registrationNo)}`}
          className="rounded-lg bg-[#6b1f2a] px-6 py-3 font-semibold text-white transition hover:brightness-110"
        >
          ⬇ Descargar pasaporte (PDF)
        </a>
        <Link
          href={`/admin/${record.id}`}
          className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-navy transition hover:bg-slate-50"
        >
          Ver ficha completa
        </Link>
        <Link
          href="/admin/nueva"
          className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-navy transition hover:bg-slate-50"
        >
          Registrar otra mascota
        </Link>
      </div>

      <div className="no-print mt-6 rounded-lg bg-white p-4 text-sm shadow-sm">
        <p className="font-semibold text-navy">Enlace de localización (QR):</p>
        <a href={url} className="break-all text-teal hover:underline">
          {url}
        </a>
      </div>
    </div>
  );
}
