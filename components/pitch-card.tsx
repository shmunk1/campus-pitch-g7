"use client";

import { useState } from "react";
import Link from "next/link";
import Countdown from "@/components/design/Countdown";
import SlotsRow from "@/components/design/SlotsRow";
import Avatar from "@/components/design/Avatar";
import { TrackTag, YearTag } from "@/components/design/Tags";
import { Ico } from "@/components/design/icons";
import { toneForName } from "@/lib/utils-pitch";
import { Demande } from "@/lib/types";

interface PitchCardProps {
  demande: Demande;
  onInscription?: () => void;
}

export default function PitchCard({ demande: d, onInscription }: PitchCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const typesRetour: string[] = (() => {
    try { return JSON.parse(d.types_retour); } catch { return []; }
  })();

  const [first = "", last = ""] = d.prenom_nom.split(" ");
  const tone = toneForName(d.prenom_nom);

  async function handleInscription(e: React.FormEvent) {
    e.preventDefault();
    if (!prenom.trim() || !nom.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/demandes/${d.id}/inscrire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom_nom: `${prenom.trim()} ${nom.trim()}` }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Une erreur est survenue");
      } else {
        setSuccess(true);
        setShowForm(false);
        onInscription?.();
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="cp-card">
      {/* Head: countdown + slots */}
      <header className="cp-card-head">
        <Countdown deadline={d.date_heure} />
        <SlotsRow count={d.nb_inscrits} max={d.nb_souhaites} />
      </header>

      {/* Body */}
      <div className="cp-card-body">
        <h3 className="cp-card-title">{d.sujet}</h3>
        {d.description && (
          <p className="cp-card-desc">{d.description}</p>
        )}
      </div>

      {/* Meta: durée / lieu / auditeurs */}
      <div className="cp-card-meta">
        <span className="cp-meta-item">
          {Ico.clock}
          <span>{d.duree} min</span>
        </span>
        <span className="cp-meta-item">
          {Ico.pin}
          <span>{d.lieu}</span>
        </span>
        <span className="cp-meta-item">
          {Ico.users}
          <span>{d.nb_souhaites} auditeur{d.nb_souhaites > 1 ? "s" : ""}</span>
        </span>
      </div>

      {/* Footer: author + actions */}
      <footer className="cp-card-foot">
        <div className="cp-card-author">
          <Avatar first={first} last={last} size={36} tone={tone} />
          <div className="cp-author-meta">
            <div className="cp-author-name">{d.prenom_nom}</div>
            <div className="cp-author-track">
              {d.filiere && <TrackTag track={d.filiere} />}
              {d.annee && <YearTag year={d.annee} />}
            </div>
          </div>
        </div>

        {/* Types de retour */}
        {typesRetour.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {typesRetour.map((t) => (
              <span key={t} className="cp-tag cp-tag--ghost">{t}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        {success ? (
          <p style={{ textAlign: "center", color: "var(--accent-700)", fontSize: 13, fontWeight: 600 }}>
            {Ico.check} Tu es inscrit·e !
          </p>
        ) : showForm ? (
          <form onSubmit={handleInscription} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <input
                className="cp-input"
                placeholder="Prénom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
                autoFocus
              />
              <input
                className="cp-input"
                placeholder="Nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
            </div>
            {error && <p style={{ color: "var(--rose-700)", fontSize: 12, margin: 0 }}>{error}</p>}
            <div className="cp-card-actions">
              <button type="submit" className="cp-btn cp-btn--primary" disabled={loading}>
                <span className="cp-btn-ico">{Ico.check}</span>
                <span>{loading ? "…" : "Confirmer"}</span>
              </button>
              <button type="button" className="cp-btn cp-btn--ghost" onClick={() => setShowForm(false)}>
                <span>Annuler</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="cp-card-actions">
            <Link href={`/demandes/${d.id}`} style={{ flex: 1, display: "flex" }}>
              <button className="cp-btn cp-btn--ghost" style={{ flex: 1, justifyContent: "center" }}>
                <span className="cp-btn-ico">{Ico.chat}</span>
                <span>Le fil</span>
              </button>
            </Link>
            <button
              className="cp-btn cp-btn--primary"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => setShowForm(true)}
            >
              <span className="cp-btn-ico">{Ico.check}</span>
              <span>Je m&apos;inscris</span>
            </button>
          </div>
        )}
      </footer>
    </article>
  );
}
