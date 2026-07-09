// Retrato de un golden retriever amistoso (SVG, llena su contenedor).
export default function DogPhoto({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 230"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="dbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef6e9" />
          <stop offset="1" stopColor="#f6e4c2" />
        </linearGradient>
        <linearGradient id="fur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ecb96a" />
          <stop offset="1" stopColor="#dd9c48" />
        </linearGradient>
      </defs>
      <rect width="200" height="230" fill="url(#dbg)" />
      {/* orejas */}
      <ellipse cx="49" cy="120" rx="24" ry="47" fill="#c17d3f" transform="rotate(12 49 120)" />
      <ellipse cx="151" cy="120" rx="24" ry="47" fill="#c17d3f" transform="rotate(-12 151 120)" />
      {/* cabeza */}
      <path d="M100 40 C60 40 44 78 46 112 C48 150 70 180 100 180 C130 180 152 150 154 112 C156 78 140 40 100 40 Z" fill="url(#fur)" />
      {/* copete */}
      <path d="M76 46 q24 -20 48 0 q-9 -8 -24 -8 q-15 0 -24 8 z" fill="#eab766" />
      {/* hocico */}
      <ellipse cx="100" cy="138" rx="38" ry="34" fill="#f6e2b8" />
      {/* ojos */}
      <ellipse cx="78" cy="104" rx="10" ry="12" fill="#ffffff" />
      <ellipse cx="122" cy="104" rx="10" ry="12" fill="#ffffff" />
      <circle cx="79" cy="106" r="6.5" fill="#3a2412" />
      <circle cx="121" cy="106" r="6.5" fill="#3a2412" />
      <circle cx="81" cy="103" r="2" fill="#ffffff" />
      <circle cx="123" cy="103" r="2" fill="#ffffff" />
      {/* nariz */}
      <ellipse cx="100" cy="132" rx="13" ry="9" fill="#3a2416" />
      <ellipse cx="96" cy="130" rx="3" ry="2" fill="#6b4a2e" />
      {/* boca */}
      <path d="M100 141 v10" stroke="#7a5230" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M100 151 q-16 14 -30 4" stroke="#7a5230" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M100 151 q16 14 30 4" stroke="#7a5230" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* lengua */}
      <path d="M91 154 q9 17 18 0 z" fill="#ef8fa0" />
    </svg>
  );
}
