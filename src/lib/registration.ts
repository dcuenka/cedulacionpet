import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/brand";

// Genera un número de registro nacional único con formato CP-AAAA-NNNNNN.
export async function generateRegistrationNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `${BRAND.prefix}-${year}-`;

  // Cuenta los registros del año en curso para el correlativo.
  const count = await prisma.petRecord.count({
    where: { registrationNo: { startsWith: prefix } },
  });

  // Intenta correlativos consecutivos; si hay colisión (concurrencia), avanza.
  for (let i = 1; i <= 50; i++) {
    const candidate = `${prefix}${String(count + i).padStart(6, "0")}`;
    const exists = await prisma.petRecord.findUnique({
      where: { registrationNo: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }

  // Respaldo extremadamente improbable: sufijo aleatorio.
  return `${prefix}${Date.now().toString().slice(-6)}`;
}
