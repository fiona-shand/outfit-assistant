// Chunky, hand-drawn-feeling glyphs (thick round strokes, solid ink).

type P = { className?: string };
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function Sun({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} {...base}>
      <circle cx="24" cy="24" r="7.5" fill="currentColor" />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i * Math.PI) / 5;
        return (
          <line key={i} x1={24 + 12 * Math.cos(a)} y1={24 + 12 * Math.sin(a)} x2={24 + 19 * Math.cos(a)} y2={24 + 19 * Math.sin(a)} />
        );
      })}
    </svg>
  );
}

export function Burst({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} {...base} strokeWidth={4.2}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 8;
        return <line key={i} x1={24 - 19 * Math.cos(a)} y1={24 - 19 * Math.sin(a)} x2={24 + 19 * Math.cos(a)} y2={24 + 19 * Math.sin(a)} />;
      })}
    </svg>
  );
}

export function Drops({ className }: P) {
  const drop = (x: number, y: number, k: number) => (
    <path key={k} d={`M${x} ${y - 5}c3 3 4.5 5.2 4.5 7.2a4.5 4.5 0 0 1-9 0c0-2 1.5-4.2 4.5-7.2z`} fill="currentColor" stroke="none" />
  );
  return (
    <svg viewBox="0 0 48 48" className={className}>
      {[
        [14, 16], [24, 14], [34, 16], [10, 30], [20, 30], [30, 30], [40, 30],
      ].map(([x, y], i) => drop(x, y, i))}
    </svg>
  );
}

export function Cloud({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <path d="M14 36h21a8 8 0 0 0 .8-16A11 11 0 0 0 14.5 22 7 7 0 0 0 14 36z" fill="currentColor" />
    </svg>
  );
}

export function Snow({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} {...base} strokeWidth={3.2}>
      {[0, 60, 120].map((d) => (
        <g key={d} transform={`rotate(${d} 24 24)`}>
          <line x1="24" y1="5" x2="24" y2="43" />
          <path d="M19 10l5 5 5-5M19 38l5-5 5 5" />
        </g>
      ))}
    </svg>
  );
}

export function Hanger({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} {...base}>
      <path d="M20 13a4 4 0 1 1 5.5 3.7c-1 .4-1.5 1.2-1.5 2.3v2.5L6 34h36L24 21.5" />
    </svg>
  );
}

export function Camera({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} {...base}>
      <path d="M8 16h7l3-5h12l3 5h7v20H8z" />
      <circle cx="24" cy="25" r="6" />
    </svg>
  );
}

export function Home({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} {...base}>
      <path d="M9 21L24 9l15 12v17H9z" />
      <path d="M20 38V27h8v11" />
    </svg>
  );
}

export function Sparkle({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <path d="M24 5c1.6 9.5 4.5 12.4 14 14-9.5 1.6-12.4 4.5-14 14-1.6-9.5-4.5-12.4-14-14 9.5-1.6 12.4-4.5 14-14z" fill="currentColor" />
      <path d="M37 30c.7 4 1.9 5.3 6 6-4.1.7-5.3 1.9-6 6-.7-4.1-1.9-5.3-6-6 4.1-.7 5.3-2 6-6z" fill="currentColor" />
    </svg>
  );
}

export function Gear({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} {...base}>
      <circle cx="24" cy="24" r="6" />
      <path d="M24 6v6M24 36v6M6 24h6M36 24h6M11.3 11.3l4.2 4.2M32.5 32.5l4.2 4.2M11.3 36.7l4.2-4.2M32.5 15.5l4.2-4.2" />
    </svg>
  );
}

export function Heart({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <path d="M24 41C10 31 5 24 5 16.5 5 10.7 9.5 7 14.5 7c4 0 7.3 2.3 9.5 6 2.2-3.7 5.5-6 9.5-6C38.5 7 43 10.7 43 16.5 43 24 38 31 24 41z" fill="currentColor" />
    </svg>
  );
}

export function Paperclip({ className }: P) {
  return (
    <svg viewBox="0 0 24 64" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M6 18V50a6 6 0 0 0 12 0V12a4.5 4.5 0 0 0-9 0v34a1.5 1.5 0 0 0 3 0V16" />
    </svg>
  );
}

/** Weather glyph for an Open-Meteo WMO code. */
export function WeatherIcon({ code, className }: { code: number; className?: string }) {
  if (code === 0 || code <= 1) return <Sun className={className} />;
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return <Drops className={className} />;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return <Snow className={className} />;
  return <Cloud className={className} />;
}
