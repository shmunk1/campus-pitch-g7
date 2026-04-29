import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/demandes/[id]/inscrire — s'inscrire comme auditeur
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const demandeId = parseInt(id);
  const body = await req.json();
  const { prenom_nom } = body;

  if (!prenom_nom) {
    return NextResponse.json({ error: "Prénom et nom requis" }, { status: 400 });
  }

  // Récupérer la demande
  const demande = await prisma.demande.findUnique({
    where: { id: demandeId },
  });

  if (!demande) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }

  // Vérifier que le pitch n'est pas passé
  if (demande.date_heure < new Date()) {
    return NextResponse.json({ error: "Ce pitch est déjà passé" }, { status: 400 });
  }

  // Vérifier qu'il reste des places
  if (demande.nb_inscrits >= demande.nb_souhaites) {
    return NextResponse.json({ error: "Plus de places disponibles" }, { status: 400 });
  }

  // Vérifier que l'utilisateur n'est pas déjà inscrit
  const dejaInscrit = await prisma.inscription.findFirst({
    where: { demande_id: demandeId, prenom_nom },
  });

  if (dejaInscrit) {
    return NextResponse.json(
      { error: "Vous êtes déjà inscrit à ce pitch" },
      { status: 400 }
    );
  }

  // Créer l'inscription et incrémenter le compteur (transaction)
  const [inscription] = await prisma.$transaction([
    prisma.inscription.create({
      data: { demande_id: demandeId, prenom_nom },
    }),
    prisma.demande.update({
      where: { id: demandeId },
      data: { nb_inscrits: { increment: 1 } },
    }),
  ]);

  return NextResponse.json(inscription, { status: 201 });
}
