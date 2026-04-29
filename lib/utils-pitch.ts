const DAYS = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
const MONTHS = ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];

/** "jeudi 30 avr. · 14:00" */
export function fmtAbsolute(iso: string): string {
  const d = new Date(iso);
  const dayName = DAYS[d.getDay()];
  const dayNum  = d.getDate();
  const month   = MONTHS[d.getMonth()];
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${dayName} ${dayNum} ${month} · ${hh}:${mm}`;
}

/** Split fmtAbsolute into { datePart, timePart } */
export function splitAbsolute(iso: string): { datePart: string; timePart: string } {
  const label = fmtAbsolute(iso);
  const parts = label.split(" · ");
  return { datePart: parts[0] ?? label, timePart: parts[1] ?? "" };
}

/** Urgency tone from deadline */
export type Tone = "rose" | "peach" | "sky" | "mint";
export function urgencyTone(iso: string): Tone {
  const diff = new Date(iso).getTime() - Date.now();
  const h = diff / 3_600_000;
  if (diff <= 0 || h < 1.5) return "rose";
  if (h < 6)  return "peach";
  if (h < 24) return "sky";
  return "mint";
}

/** "il y a 3 min" */
export function fmtRelativePast(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1)  return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.floor(h / 24)} j`;
}

/** "14:32" or "29/4 · 14:32" */
export function fmtMessageTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  if (d.toDateString() === now.toDateString()) return `${hh}:${mm}`;
  return `${d.getDate()}/${d.getMonth() + 1} · ${hh}:${mm}`;
}

/** Deterministic avatar tone from name */
const TONES = ["lav", "peach", "mint", "rose", "sky"] as const;
export type AvatarTone = typeof TONES[number];
export function toneForName(name: string): AvatarTone {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return TONES[Math.abs(h) % TONES.length];
}

/** Day separator label */
export function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yest  = new Date(); yest.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yest.toDateString())  return "Hier";
  const dayNames = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
  return `${dayNames[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
