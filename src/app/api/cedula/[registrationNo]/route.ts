import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildCedulaPdf } from "@/lib/cedula-pdf";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ registrationNo: string }> },
) {
  const { registrationNo } = await params;
  const record = await prisma.petRecord.findUnique({
    where: { registrationNo: decodeURIComponent(registrationNo) },
  });
  if (!record) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const pdf = await buildCedulaPdf(record);

  return new NextResponse(Buffer.from(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="cedula-${record.registrationNo}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
