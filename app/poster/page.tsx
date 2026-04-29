"use client";

import { useState } from "react";
import Link from "next/link";
import Countdown from "@/components/design/Countdown";
import SlotsRow from "@/components/design/SlotsRow";
import Avatar from "@/components/design/Avatar";
import { TrackTag, YearTag } from "@/components/design/Tags";
import { Ico } from "@/components/design/icons";
import { toneForName } from "@/lib/utils-pitch";
import { FILIERES, ANNEES, DUREES, TYPES_RETOUR } from "@/lib/types";

function ChipPicker({
  value, options, onChange,
  format = (v: string) => v,
}: {
  value: string; options: readonly string[];
  onChange: (v: string) => void;
  format?: (v: string) => string;
}) {
  return (
    <div className="cp-chips">
      {options.map((o) => (
        <button
          key={o} type="button"
          className={"cp-chip " + (value === o ? "is-on" : "")}
          onClick={() => onChange(o)}
        >
          {format(o)}
        </button>
      ))}
    </div>
  );
}

function Stepper({ value, min, max, onChange }: {
  value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div className="cp-stepper">
      <button type="button" className="cp-step-btn" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>−</button>
      <div className="cp-step-val">
        <b>{value}</b><span> auditeur{value > 1 ? "s" : ""}</span>
      </div>
      <button type="button" className="cp-step-btn" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</button>
      <div className="cp-step-track">
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={"cp-step-dot " + (i < value ? "is-on" : "")} />
        ))}
      </div>
    </div>
  );
}

export default function PosterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [filiere, setFiliere] = useState("Informatique");
  const [annee, setAnnee] = useState("M1");
  const [sujet, setSujet] = useState("");
  const [description, setDescription] = useState("");
  const [duree, setDuree] = useState(10);
  const [dateHeure, setDateHeure] = useState(() => {
    const d = new Date(Date.now() + 24 * 3_600_000);
    return d.toISOString().slice(0, 16);
  });
  const [nbPersonnes, setNbPersonnes] = useState(3);
  const [lieu, setLieu] = useState("");
  const [typesRetour, setTypesRetour] = useState<string[]>([]);

  const minDateTime = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  const valid = prenom.trim() && nom.trim() && sujet.trim().length > 2 && description.trim().length > 4 && dateHeure && duree > 0;

  function toggleTypeRetour(t: string) {
    setTypesRetour((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!valid) { setError("Merci de remplir tous les champs obligatoires."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/demandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom_nom: `${prenom.trim()} ${nom.trim()}`,
          filiere, annee, sujet, description,
          duree, date_heure: new Date(dateHeure).toISOString(),
          lieu: lieu || "À convenir dans le fil",
          nb_souhaites: nbPersonnes,
          types_retour: typesRetour,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      window.location.href = "/";
    } catch {
      setError("Erreur réseau. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  const previewDeadline = dateHeure ? new Date(dateHeure).toISOString() : null;
  const tone = toneForName((prenom || "x") + (nom || "y"));

  return (
    <div className="cp-screen cp-post">
      <header className="cp-page-head">
        <Link href="/">
          <button className="cp-back">
            {Ico.back}<span>Retour au feed</span>
          </button>
        </Link>
        <div className="cp-eyebrow">Bordeaux</div>
      </header>

      <div className="cp-post-grid">
        {/* ── Form ── */}
        <div className="cp-post-form">
          <h1 className="cp-h1">
            Tu as un pitch <span className="cp-h1-serif">à répéter</span>.
          </h1>
          <p className="cp-page-sub">
            Décris-le en deux lignes. On affichera ta demande aux autres étudiants de Bordeaux, ils pourront s&apos;inscrire pour t&apos;écouter.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Section 01 — Toi */}
            <div className="cp-section">
              <div className="cp-section-num">01</div>
              <h3 className="cp-section-title">Toi</h3>
              <div className="cp-form-grid">
                <label className="cp-field">
                  <span className="cp-field-lbl">Prénom<em>*</em></span>
                  <input className="cp-input" placeholder="Camille" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
                </label>
                <label className="cp-field">
                  <span className="cp-field-lbl">Nom<em>*</em></span>
                  <input className="cp-input" placeholder="Renard" value={nom} onChange={(e) => setNom(e.target.value)} required />
                </label>
                <label className="cp-field" style={{ gridColumn: "span 2" }}>
                  <span className="cp-field-lbl">Filière</span>
                  <ChipPicker value={filiere} options={FILIERES} onChange={setFiliere} />
                </label>
                <label className="cp-field" style={{ gridColumn: "span 2" }}>
                  <span className="cp-field-lbl">Année</span>
                  <ChipPicker value={annee} options={ANNEES} onChange={setAnnee} />
                </label>
              </div>
            </div>

            {/* Section 02 — Ton pitch */}
            <div className="cp-section">
              <div className="cp-section-num">02</div>
              <h3 className="cp-section-title">Ton pitch</h3>
              <div className="cp-form-grid">
                <label className="cp-field" style={{ gridColumn: "span 2" }}>
                  <span className="cp-field-lbl">
                    Titre du pitch<em>*</em>
                    <span style={{ fontWeight: 400, color: "var(--ink-4)", marginLeft: 6 }}>{sujet.length}/100</span>
                  </span>
                  <input className="cp-input" placeholder="Ex. Soutenance mémoire — IA générative pour l'éducation" value={sujet} onChange={(e) => setSujet(e.target.value.slice(0, 100))} required />
                </label>
                <label className="cp-field" style={{ gridColumn: "span 2" }}>
                  <span className="cp-field-lbl">Description / contexte<em>*</em></span>
                  <textarea
                    className="cp-input cp-input--area"
                    rows={4}
                    placeholder="Je passe devant un jury jeudi. J'aimerais surtout un retour sur l'intro et la transition vers la démo."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                  <span className="cp-field-hint">Donne du contexte sur le retour que tu veux : timing, fond, accroche…</span>
                </label>
                <label className="cp-field" style={{ gridColumn: "span 2" }}>
                  <span className="cp-field-lbl">Type de retour souhaité</span>
                  <div className="cp-chips">
                    {TYPES_RETOUR.map((t) => (
                      <button
                        key={t} type="button"
                        className={"cp-chip " + (typesRetour.includes(t) ? "is-on" : "")}
                        onClick={() => toggleTypeRetour(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </label>
              </div>
            </div>

            {/* Section 03 — Quand & combien */}
            <div className="cp-section">
              <div className="cp-section-num">03</div>
              <h3 className="cp-section-title">Quand &amp; combien</h3>
              <div className="cp-form-grid">
                <label className="cp-field">
                  <span className="cp-field-lbl">Date &amp; heure<em>*</em></span>
                  <input className="cp-input" type="datetime-local" min={minDateTime} value={dateHeure} onChange={(e) => setDateHeure(e.target.value)} required />
                  <span className="cp-field-hint">Au moins 1h dans le futur</span>
                </label>
                <label className="cp-field">
                  <span className="cp-field-lbl">Durée<em>*</em></span>
                  <ChipPicker
                    value={String(duree)}
                    options={DUREES.map(String)}
                    onChange={(v) => setDuree(Number(v))}
                    format={(v) => `${v} min`}
                  />
                </label>
                <label className="cp-field" style={{ gridColumn: "span 2" }}>
                  <span className="cp-field-lbl">Lieu</span>
                  <input
                    className="cp-input"
                    list="lieux-suggestions"
                    placeholder="Salle B204, bibliothèque, visio…"
                    value={lieu}
                    onChange={(e) => setLieu(e.target.value)}
                  />
                  <datalist id="lieux-suggestions">
                    {["Amphi A","Salle B204","Bibliothèque, table 4","Caf' du 2e","Visio (lien partagé)"].map((l) => (
                      <option key={l} value={l} />
                    ))}
                  </datalist>
                </label>
                <label className="cp-field" style={{ gridColumn: "span 2" }}>
                  <span className="cp-field-lbl">Nombre d&apos;auditeurs souhaités<em>*</em></span>
                  <Stepper value={nbPersonnes} min={1} max={8} onChange={setNbPersonnes} />
                </label>
              </div>
            </div>

            {error && (
              <p style={{ color: "var(--rose-700)", background: "var(--rose-50)", padding: "12px 16px", borderRadius: "var(--r-sm)", fontSize: 13, margin: "0 0 16px" }}>
                {error}
              </p>
            )}

            <div className="cp-form-foot">
              <Link href="/">
                <button type="button" className="cp-btn cp-btn--ghost cp-btn--md">
                  <span>Annuler</span>
                </button>
              </Link>
              <button type="submit" className="cp-btn cp-btn--primary cp-btn--md" disabled={!valid || loading}>
                <span className="cp-btn-ico">{Ico.arrow}</span>
                <span>{loading ? "Publication…" : "Publier ma demande"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* ── Live preview (desktop only) ── */}
        <aside className="cp-post-preview" aria-label="Aperçu de ta demande">
          <div className="cp-preview-eyebrow">
            <span className="cp-preview-dot" />
            Aperçu sur le feed
          </div>
          <div className="cp-preview-card">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              {previewDeadline ? (
                <Countdown deadline={previewDeadline} />
              ) : (
                <div className="cp-cd-block">
                  <div className="cp-cd-num--date">—</div>
                  <div className="cp-cd-lbl">avant le pitch</div>
                </div>
              )}
              <SlotsRow count={0} max={nbPersonnes} />
            </div>
            <h3 className="cp-card-title">{sujet || "Le titre de ton pitch apparaîtra ici"}</h3>
            <p className="cp-card-desc">{description || "Et le contexte que tu donnes — pour que tes camarades sachent dans quoi ils s'engagent."}</p>
            <div className="cp-card-meta">
              <span className="cp-meta-item">{Ico.clock}<span>{duree} min</span></span>
              <span className="cp-meta-item">{Ico.users}<span>{nbPersonnes} auditeur{nbPersonnes > 1 ? "s" : ""}</span></span>
            </div>
            <footer className="cp-card-foot">
              <div className="cp-card-author">
                <Avatar first={prenom || "?"} last={nom || "?"} size={36} tone={tone} />
                <div className="cp-author-meta">
                  <div className="cp-author-name">{prenom || "Prénom"} {nom || "Nom"}</div>
                  <div className="cp-author-track">
                    {filiere && <TrackTag track={filiere} />}
                    {annee && <YearTag year={annee} />}
                  </div>
                </div>
              </div>
            </footer>
          </div>
          <p className="cp-preview-foot">
            Ce que verront tes camarades. Ta demande disparaît du feed automatiquement après ton pitch.
          </p>
        </aside>
      </div>
    </div>
  );
}
