"use client";

import { useEffect, useState, useCallback, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Countdown from "@/components/design/Countdown";
import SlotsRow from "@/components/design/SlotsRow";
import Avatar from "@/components/design/Avatar";
import { TrackTag, YearTag } from "@/components/design/Tags";
import { Ico } from "@/components/design/icons";
import { toneForName, fmtMessageTime, dayLabel, fmtAbsolute } from "@/lib/utils-pitch";
import { Demande, Message } from "@/lib/types";

/* ── Modal inscription ─────────────────────────────────────────────────────── */
function InscriptionModal({
  demandeId,
  onClose,
  onDone,
}: {
  demandeId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prenom.trim() || !nom.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/demandes/${demandeId}/inscrire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom_nom: `${prenom.trim()} ${nom.trim()}` }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Une erreur est survenue");
      } else {
        onDone();
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cp-modal-bg" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cp-modal">
        <div className="cp-modal-eyebrow">Inscription</div>
        <h2 className="cp-modal-title">Je m&apos;inscris comme auditeur</h2>
        <p className="cp-modal-sub">
          Tu seras notifié dans le fil si le pitcheur partage des infos. Dis-nous juste qui tu es.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="cp-modal-grid">
            <label className="cp-field">
              <span className="cp-field-lbl">Prénom<em>*</em></span>
              <input className="cp-input" placeholder="Camille" value={prenom} onChange={(e) => setPrenom(e.target.value)} required autoFocus />
            </label>
            <label className="cp-field">
              <span className="cp-field-lbl">Nom<em>*</em></span>
              <input className="cp-input" placeholder="Renard" value={nom} onChange={(e) => setNom(e.target.value)} required />
            </label>
          </div>
          {error && (
            <p style={{ color: "var(--rose-700)", fontSize: 13, marginBottom: 12 }}>{error}</p>
          )}
          <div className="cp-modal-actions">
            <button type="button" className="cp-btn cp-btn--ghost cp-btn--md" onClick={onClose}>
              <span>Annuler</span>
            </button>
            <button type="submit" className="cp-btn cp-btn--primary cp-btn--md" disabled={loading || !prenom.trim() || !nom.trim()}>
              <span className="cp-btn-ico">{Ico.check}</span>
              <span>{loading ? "Inscription…" : "Confirmer"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────────── */
export default function DemandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [demande, setDemande] = useState<Demande | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Composer state
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [contenu, setContenu] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [inscrit, setInscrit] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [dRes, mRes] = await Promise.all([
        fetch(`/api/demandes/${id}`),
        fetch(`/api/demandes/${id}/messages`),
      ]);
      if (dRes.ok) setDemande(await dRes.json());
      if (mRes.ok) setMessages(await mRes.json());
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!prenom.trim() || !nom.trim() || !contenu.trim()) return;
    setSending(true);
    setSendError("");
    try {
      const res = await fetch(`/api/demandes/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom_nom: `${prenom.trim()} ${nom.trim()}`,
          contenu: contenu.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSendError(data.error ?? "Erreur");
      } else {
        setContenu("");
        const mRes = await fetch(`/api/demandes/${id}/messages`);
        if (mRes.ok) setMessages(await mRes.json());
      }
    } catch {
      setSendError("Erreur réseau");
    } finally {
      setSending(false);
    }
  }

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="cp-screen">
        <div style={{ display: "flex", gap: 32, marginTop: 16 }}>
          <div style={{ width: 360, height: 480, background: "var(--paper-2)", borderRadius: "var(--r-lg)", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ flex: 1, height: 480, background: "var(--paper-2)", borderRadius: "var(--r-lg)", animation: "pulse 1.5s ease-in-out infinite" }} />
        </div>
      </div>
    );
  }

  if (!demande) {
    return (
      <div className="cp-screen" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, minHeight: "60vh" }}>
        <p style={{ color: "var(--ink-2)" }}>Cette demande n&apos;existe pas ou est expirée.</p>
        <button className="cp-btn cp-btn--ghost cp-btn--md" onClick={() => router.push("/")}>
          {Ico.back}<span>Retour au feed</span>
        </button>
      </div>
    );
  }

  const typesRetour: string[] = (() => {
    try { return JSON.parse(demande.types_retour); } catch { return []; }
  })();

  const [first = "", last = ""] = demande.prenom_nom.split(" ");
  const authorTone = toneForName(demande.prenom_nom);

  // Build inscriptions list from the nb_inscrits count (we don't have names in demande)
  const slotsTotal = demande.nb_souhaites;
  const slotsFilled = demande.nb_inscrits;

  /* Day separator logic */
  function renderMessages() {
    if (messages.length === 0) {
      return (
        <div className="cp-msg-sys">
          <span className="cp-msg-sys-ico">{Ico.spark}</span>
          <span>Pas encore de messages — sois le premier à réagir.</span>
        </div>
      );
    }

    const items: React.ReactNode[] = [];
    let lastDay = "";

    messages.forEach((m) => {
      const day = new Date(m.created_at).toDateString();
      if (day !== lastDay) {
        lastDay = day;
        items.push(
          <div key={`sep-${m.id}`} className="cp-day-sep">
            <span>{dayLabel(m.created_at)}</span>
          </div>
        );
      }
      const mTone = toneForName(m.prenom_nom);
      const [mFirst = "", mLast = ""] = m.prenom_nom.split(" ");
      items.push(
        <div key={m.id} className="cp-msg">
          <Avatar first={mFirst} last={mLast} size={32} tone={mTone} />
          <div className="cp-msg-stack">
            <div className="cp-msg-head">
              <b>{m.prenom_nom}</b>
              <span className="cp-msg-time">{fmtMessageTime(m.created_at)}</span>
            </div>
            <div className="cp-msg-bubble">{m.contenu}</div>
          </div>
        </div>
      );
    });

    return items;
  }

  return (
    <div className="cp-screen">
      <header className="cp-page-head">
        <button className="cp-back" onClick={() => router.push("/")}>
          {Ico.back}<span>Retour au feed</span>
        </button>
        <div className="cp-eyebrow">Bordeaux</div>
      </header>

      <div className="cp-chat-grid">
        {/* ── Sidebar ── */}
        <aside className="cp-chat-side">
          {/* Countdown + slots */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <Countdown deadline={demande.date_heure} />
            <SlotsRow count={demande.nb_inscrits} max={demande.nb_souhaites} />
          </div>

          <h2 className="cp-chat-title">{demande.sujet}</h2>

          {demande.description && (
            <p className="cp-side-desc">{demande.description}</p>
          )}

          {/* Facts */}
          <dl className="cp-side-facts">
            <div>
              <dt>Durée</dt>
              <dd>{demande.duree} min</dd>
            </div>
            <div>
              <dt>Lieu</dt>
              <dd>{demande.lieu}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{fmtAbsolute(demande.date_heure)}</dd>
            </div>
            <div>
              <dt>Auditeurs</dt>
              <dd>{slotsFilled}/{slotsTotal}</dd>
            </div>
          </dl>

          {/* Types de retour */}
          {typesRetour.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {typesRetour.map((t) => (
                <span key={t} className="cp-tag cp-tag--ghost">{t}</span>
              ))}
            </div>
          )}

          {/* Author */}
          <div className="cp-side-author">
            <Avatar first={first} last={last} size={40} tone={authorTone} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{demande.prenom_nom}</div>
              <div className="cp-author-track" style={{ marginTop: 4 }}>
                {demande.filiere && <TrackTag track={demande.filiere} />}
                {demande.annee && <YearTag year={demande.annee} />}
              </div>
            </div>
          </div>

          {/* Listeners section */}
          <div className="cp-side-listeners">
            <div className="cp-side-listeners-head">
              <span>Auditeurs inscrits</span>
              <span>{slotsFilled}/{slotsTotal}</span>
            </div>
            <ul className="cp-listeners">
              {Array.from({ length: slotsTotal }, (_, i) => (
                i < slotsFilled ? (
                  <li key={i}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: "var(--accent-100)", color: "var(--accent-700)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 600, flexShrink: 0,
                    }}>✓</div>
                    <span>Auditeur inscrit</span>
                  </li>
                ) : (
                  <li key={i} className="cp-listener-empty">
                    <div className="cp-listener-empty-dot" />
                    <span>Place disponible</span>
                  </li>
                )
              ))}
            </ul>
          </div>

          {/* CTA */}
          {inscrit ? (
            <p style={{ textAlign: "center", color: "var(--accent-700)", fontSize: 13, fontWeight: 600 }}>
              {Ico.check} Tu es inscrit·e !
            </p>
          ) : (
            <button
              className="cp-btn cp-btn--primary cp-btn--md"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={slotsFilled >= slotsTotal}
              onClick={() => setShowModal(true)}
            >
              <span className="cp-btn-ico">{Ico.check}</span>
              <span>{slotsFilled >= slotsTotal ? "Complet" : "Je m’inscris"}</span>
            </button>
          )}
        </aside>

        {/* ── Chat main ── */}
        <div className="cp-chat-main">
          {/* Header */}
          <div className="cp-chat-head">
            <div>
              <div className="cp-chat-h-eyebrow">Le fil · {messages.length} message{messages.length !== 1 ? "s" : ""}</div>
              <div className="cp-chat-h-meta">{demande.sujet}</div>
            </div>
            <button
              className="cp-btn cp-btn--ghost"
              onClick={() => fetchData()}
              title="Actualiser"
            >
              {Ico.refresh}
            </button>
          </div>

          {/* Messages scroll area */}
          <div className="cp-chat-scroll" ref={scrollRef}>
            <div className="cp-chat-msgs">
              {renderMessages()}
            </div>
          </div>

          {/* Composer */}
          <form className="cp-chat-composer" onSubmit={handleSend}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input
                  className="cp-input"
                  placeholder="Prénom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  required
                />
                <input
                  className="cp-input"
                  placeholder="Nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                />
              </div>
              <textarea
                className="cp-input cp-composer-input"
                placeholder="Ton message…"
                value={contenu}
                onChange={(e) => setContenu(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (prenom.trim() && nom.trim() && contenu.trim() && !sending) {
                      handleSend(e as unknown as React.FormEvent);
                    }
                  }
                }}
                rows={2}
              />
              {sendError && (
                <p style={{ color: "var(--rose-700)", fontSize: 12, margin: 0 }}>{sendError}</p>
              )}
            </div>
            <button
              type="submit"
              className="cp-btn cp-btn--primary"
              disabled={sending || !prenom.trim() || !nom.trim() || !contenu.trim()}
              style={{ alignSelf: "flex-end" }}
            >
              <span className="cp-btn-ico">{Ico.send}</span>
              <span>{sending ? "…" : "Envoyer"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <InscriptionModal
          demandeId={id}
          onClose={() => setShowModal(false)}
          onDone={() => {
            setShowModal(false);
            setInscrit(true);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
