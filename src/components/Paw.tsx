// Huella de mascota como SVG (hereda el color con currentColor).
export default function Paw({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="currentColor" aria-hidden="true">
      <ellipse cx="60" cy="82" rx="22" ry="17" />
      <ellipse cx="30" cy="54" rx="9" ry="12" />
      <ellipse cx="50" cy="40" rx="9" ry="13" />
      <ellipse cx="70" cy="40" rx="9" ry="13" />
      <ellipse cx="90" cy="54" rx="9" ry="12" />
    </svg>
  );
}
