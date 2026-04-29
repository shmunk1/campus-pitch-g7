const TRACK_TONES: Record<string, { bg: string; fg: string }> = {
  "Informatique":          { bg: "var(--lav-50)",   fg: "var(--lav-700)" },
  "Web & Mobile":          { bg: "var(--sky-50)",   fg: "var(--sky-700)" },
  "3D & Animation":        { bg: "var(--peach-50)", fg: "var(--peach-700)" },
  "Audiovisuel":           { bg: "var(--mint-50)",  fg: "var(--mint-700)" },
  "Marketing":             { bg: "var(--rose-50)",  fg: "var(--rose-700)" },
  "Design":                { bg: "var(--lav-50)",   fg: "var(--lav-700)" },
  "Cybersécurité":         { bg: "var(--sky-50)",   fg: "var(--sky-700)" },
  "IA & Data":             { bg: "var(--mint-50)",  fg: "var(--mint-700)" },
  "Création & Design":     { bg: "var(--lav-50)",   fg: "var(--lav-700)" },
  "Business":              { bg: "var(--peach-50)", fg: "var(--peach-700)" },
};

export function TrackTag({ track }: { track: string }) {
  const tone = TRACK_TONES[track] ?? { bg: "var(--lav-50)", fg: "var(--lav-700)" };
  return (
    <span className="cp-tag" style={{ background: tone.bg, color: tone.fg }}>
      {track}
    </span>
  );
}

export function YearTag({ year }: { year: string }) {
  return <span className="cp-tag cp-tag--ghost">{year}</span>;
}
