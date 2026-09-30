export const C = {
  bg: '#04060C',
  bg2: '#0A1120',
  panel: 'rgba(15, 23, 42, 0.62)',
  panelSolid: '#0E1628',
  border: 'rgba(148, 163, 184, 0.20)',
  text: '#F8FAFC',
  muted: '#94A3B8',
  dim: '#475569',
  cyan: '#38BDF8',
  emerald: '#10B981',
  green: '#22C55E',
  crimson: '#EF4444',
  red: '#DC2626',
  gold: '#F5B942',
  amber: '#F59E0B',
  orange: '#FB923C',
  navy: '#1E3A8A',
  royal: '#2563EB',
  violet: '#8B5CF6',
  slate: '#64748B',
};

export const FONT = "'Inter', system-ui, sans-serif";
export const MONO = "'JetBrains Mono', ui-monospace, monospace";

export const glow = (color: string, px = 24) => `0 0 ${px}px ${color}`;

/** hex (#rrggbb) -> rgba string */
export const alpha = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
