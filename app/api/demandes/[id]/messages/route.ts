import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/demandes/[id]/messages — récupérer le fil de messages
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const demandeId = parseInt(id);

  const messages = await prisma.message.findMany({
    where: { demande_id: demandeId },
    orderBy: { created_at: "asc" },
  });

  return NextResponse.json(messages);
}

// POST /api/demandes/[id]/messages — poster un message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const demandeId = parseInt(id);
  const body = await req.json();
  const { prenom_nom, contenu } = body;

  if (!prenom_nom || !contenu) {
    return NextResponse.json(
      { error: "Prénom, nom et contenu requis" },
      { status: 400 }
    );
  }

  // Vérifier que la demande existe
  const demande = await prisma.demande.findUnique({
    where: { id: demandeId },
  });

  if (!demande) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }

  const message = await prisma.message.create({
    data: {
      demande_id: demandeId,
      prenom_nom,
      contenu,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
