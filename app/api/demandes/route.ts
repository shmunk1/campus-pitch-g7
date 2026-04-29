import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/demandes — retourne les demandes actives (non passées, non complètes)
export async function GET() {
  const now = new Date();

  const demandes = await prisma.demande.findMany({
    where: {
      date_heure: { gt: now },
      // On filtre les complètes côté JS pour simplifier (SQLite ne supporte pas les champs calculés)
    },
    orderBy: { date_heure: "asc" },
  });

  // Exclure les demandes complètes
  const actives = demandes.filter((d) => d.nb_inscrits < d.nb_souhaites);

  return NextResponse.json(actives);
}

// POST /api/demandes — créer une nouvelle demande
export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    prenom_nom,
    filiere,
    annee,
    sujet,
    description,
    duree,
    date_heure,
    lieu,
    nb_souhaites,
    types_retour,
  } = body;

  // Validation basique
  if (!prenom_nom || !sujet || !date_heure || !lieu || !nb_souhaites) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const dateObj = new Date(date_heure);
  const minDate = new Date(Date.now() + 60 * 60 * 1000); // +1h

  if (dateObj < minDate) {
    return NextResponse.json(
      { error: "Le pitch doit être prévu au moins 1h dans le futur" },
      { status: 400 }
    );
  }

  const demande = await prisma.demande.create({
    data: {
      prenom_nom,
      filiere: filiere ?? "",
      annee: annee ?? "",
      sujet: sujet.slice(0, 100),
      description: description ?? "",
      duree: Number(duree),
      date_heure: dateObj,
      lieu,
      nb_souhaites: Number(nb_souhaites),
      types_retour: JSON.stringify(types_retour ?? []),
    },
  });

  return NextResponse.json(demande, { status: 201 });
}
