-- CreateTable
CREATE TABLE "Demande" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "prenom_nom" TEXT NOT NULL,
    "filiere" TEXT NOT NULL,
    "annee" TEXT NOT NULL,
    "sujet" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duree" INTEGER NOT NULL,
    "date_heure" DATETIME NOT NULL,
    "lieu" TEXT NOT NULL,
    "nb_souhaites" INTEGER NOT NULL,
    "nb_inscrits" INTEGER NOT NULL DEFAULT 0,
    "types_retour" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "demande_id" INTEGER NOT NULL,
    "prenom_nom" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_demande_id_fkey" FOREIGN KEY ("demande_id") REFERENCES "Demande" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Inscription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "demande_id" INTEGER NOT NULL,
    "prenom_nom" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Inscription_demande_id_fkey" FOREIGN KEY ("demande_id") REFERENCES "Demande" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
