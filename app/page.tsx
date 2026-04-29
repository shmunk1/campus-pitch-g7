"use client";

import { useEffect, useState, useCallback } from "react";
import PitchCard from "@/components/pitch-card";
import { Ico } from "@/components/design/icons";
import { Demande } from "@/lib/types";

export default function FeedPage() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "today" | "available">("all");

  const fetchDemandes = useCallback(async () => {
    try {
      const res = await fetch("/api/demandes");
      const data = await res.json();
      setDemandes(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDemandes(); }, [fetchDemandes]);

  const now = new Date();
  const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);

  const filtered = demandes.filter((d) => {
    if (filter === "today")     return new Date(d.date_heure) <= endOfDay;
    if (filter === "available") return d.nb_inscrits < d.nb_souhaites;
    return true;
  });

  const stats = {
    active: demandes.length,
    soon:   demandes.filter((d) => (new Date(d.date_heure).getTime() - Date.now()) < 6 * 3_600_000).length,
    spots:  demandes.reduce((a, d) => a + Math.max(0, d.nb_souhaites - d.nb_inscrits), 0),
  };

  return (
    <div className="cp-screen cp-feed">
      {/* Hero */}
      <section className="cp-hero">
        <div className="cp-hero-left">
          <div className="cp-eyebrow">Bordeaux · feed</div>
          <h1 className="cp-h1">
            <span className="cp-h1-serif">Quelqu&apos;un</span>{" "}a besoin d&apos;oreilles aujourd&apos;hui&nbsp;?
          </h1>
          {!loading && (
            <p className="cp-hero-sub">
              {stats.active} pitch{stats.active > 1 ? "s" : ""} à venir
              {" · "}
              {stats.spots} place{stats.spots > 1 ? "s" : ""} à prendre
              {" · "}
              {stats.soon} dans les 6 prochaines heures
            </p>
          )}
          <div className="cp-hero-cta">
            <a href="/poster">
              <button className="cp-btn cp-btn--primary cp-btn--md">
                <span className="cp-btn-ico">{Ico.plus}</span>
                <span>Poster ma demande</span>
              </button>
            </a>
            <button
              className="cp-btn cp-btn--ghost cp-btn--md"
              onClick={() => document.getElementById("cp-list")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              <span className="cp-btn-ico">{Ico.spark}</span>
              <span>Voir les demandes</span>
            </button>
          </div>
        </div>
        <div className="cp-hero-right" aria-hidden="true">
          <div className="cp-hero-orb cp-hero-orb--1" />
          <div className="cp-hero-orb cp-hero-orb--2" />
          <div className="cp-hero-orb cp-hero-orb--3" />
        </div>
      </section>

      {/* List head + tabs */}
      <div className="cp-list-head" id="cp-list">
        <h2 className="cp-h2">Demandes actives</h2>
        <div className="cp-tabs" role="tablist">
          {[
            { id: "all"       as const, label: "Toutes",       count: demandes.length },
            { id: "today"     as const, label: "Aujourd'hui" },
            { id: "available" as const, label: "Places disponibles" },
          ].map((t) => (
            <button
              key={t.id}
              className={"cp-tab " + (filter === t.id ? "is-active" : "")}
              onClick={() => setFilter(t.id)}
            >
              {t.label}
              {t.count != null && (
                <span className="cp-tab-count">{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="cp-grid">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: "var(--paper-2)", border: "0.5px solid var(--line)",
                borderRadius: "var(--r-lg)", height: 280,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="cp-grid">
          <div className="cp-empty">
            <div className="cp-empty-art">∼</div>
            <h3>Pas de demande sur ce filtre</h3>
            <p>Soit personne n&apos;a posté, soit toutes les places sont prises. Bonne chance pour ton pitch !</p>
            <button className="cp-btn cp-btn--ghost cp-btn--md" onClick={() => setFilter("all")}>
              <span>Voir toutes les demandes</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="cp-grid">
          {filtered.map((d) => (
            <PitchCard key={d.id} demande={d} onInscription={fetchDemandes} />
          ))}
        </div>
      )}

      {/* Refresh FAB (bottom right, hidden on desktop) */}
      <button
        onClick={fetchDemandes}
        title="Actualiser"
        style={{
          position: "fixed", bottom: 80, right: 20,
          width: 44, height: 44, borderRadius: "50%",
          background: "var(--paper)", border: "0.5px solid var(--line-2)",
          boxShadow: "var(--shadow-md)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--ink-2)", cursor: "pointer", zIndex: 40,
        }}
      >
        {Ico.refresh}
      </button>
    </div>
  );
}
