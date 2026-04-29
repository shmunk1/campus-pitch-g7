import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/demandes/[id] — détail d'une demande
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const demandeId = parseInt(id);

  const demande = await prisma.demande.findUnique({
    where: { id: demandeId },
    include: { inscriptions: true },
  });

  if (!demande) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }

  return NextResponse.json(demande);
}
