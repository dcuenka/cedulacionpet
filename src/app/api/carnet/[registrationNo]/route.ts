import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildCarnetPdf } from "@/lib/carnet-pdf";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ registrationNo: string }> },
) {
  const { registrationNo } = await params;
  const record = await prisma.petRecord.findUnique({
    where: { registrationNo: decodeURIComponent(registrationNo) },
    include: {
      healthEvents: { where: { status: "validado" }, orderBy: { date: "desc" } },
    },
  });
  if (!record) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const pdf = await buildCarnetPdf(record);

  return new NextResponse(Buffer.from(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="carnet-${record.registrationNo}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
