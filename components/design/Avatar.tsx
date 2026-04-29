import { toneForName, type AvatarTone } from "@/lib/utils-pitch";

interface AvatarProps {
  first: string;
  last?: string;
  size?: number;
  tone?: AvatarTone;
}

export default function Avatar({ first, last = "", size = 32, tone }: AvatarProps) {
  const t = tone ?? toneForName(first + last);
  const initials = `${(first || "?")[0]}${(last || "")[0] ?? ""}`.toUpperCase();
  return (
    <div
      className="cp-avatar"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
        background: `var(--${t}-100)`,
        color: `var(--${t}-700)`,
      }}
    >
      {initials}
    </div>
  );
}
