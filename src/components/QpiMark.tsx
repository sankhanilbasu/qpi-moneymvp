export function QpiMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-label="QPi">
      <rect width="512" height="512" rx="112" className="fill-primary" />
      <circle cx="240" cy="236" r="112" fill="none" className="stroke-primary-foreground" strokeWidth="44" />
      <path d="M310 306l84 84" className="stroke-primary-foreground" strokeWidth="44" strokeLinecap="round" />
    </svg>
  );
}
