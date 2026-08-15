interface CelestialBgProps {
  /** "light" = navy line-art for cream backgrounds. "dark" = cream line-art for navy backgrounds. */
  tone?: "light" | "dark"
  className?: string
}

// Decorative orbit-rings-and-stars line art, matching the astrology motif from the reference
// design. Purely decorative — absolutely positioned, non-interactive, low-opacity by default
// via the caller's className.
export function CelestialBg({ tone = "light", className = "" }: CelestialBgProps) {
  const stroke = tone === "light" ? "#211E3E" : "#F8EEDF"
  const dot = tone === "light" ? "#EE8266" : "#EE8266"

  return (
    <svg
      viewBox="0 0 800 800"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="400" cy="400" r="340" stroke={stroke} strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 10" />
      <circle cx="400" cy="400" r="250" stroke={stroke} strokeOpacity="0.3" strokeWidth="1" strokeDasharray="1 8" />
      <circle cx="400" cy="400" r="160" stroke={stroke} strokeOpacity="0.35" strokeWidth="1" />
      <circle cx="400" cy="400" r="60" stroke={stroke} strokeOpacity="0.4" strokeWidth="1" />

      <line x1="400" y1="20" x2="400" y2="780" stroke={stroke} strokeOpacity="0.15" strokeWidth="1" />
      <line x1="20" y1="400" x2="780" y2="400" stroke={stroke} strokeOpacity="0.15" strokeWidth="1" />
      <line x1="105" y1="105" x2="695" y2="695" stroke={stroke} strokeOpacity="0.1" strokeWidth="1" />
      <line x1="695" y1="105" x2="105" y2="695" stroke={stroke} strokeOpacity="0.1" strokeWidth="1" />

      {/* planet/star markers along the orbits */}
      <circle cx="400" cy="60" r="9" fill={dot} />
      <circle cx="650" cy="400" r="6" fill={stroke} fillOpacity="0.5" />
      <circle cx="400" cy="740" r="5" fill={stroke} fillOpacity="0.4" />
      <circle cx="150" cy="400" r="7" fill={dot} fillOpacity="0.6" />
      <circle cx="565" cy="235" r="4" fill={stroke} fillOpacity="0.5" />
      <circle cx="235" cy="565" r="4" fill={stroke} fillOpacity="0.5" />

      {/* small four-point sparkles */}
      <path d="M120 180 L124 192 L136 196 L124 200 L120 212 L116 200 L104 196 L116 192 Z" fill={dot} fillOpacity="0.7" />
      <path d="M680 560 L683 569 L692 572 L683 575 L680 584 L677 575 L668 572 L677 569 Z" fill={stroke} fillOpacity="0.5" />
      <path d="M660 180 L662 186 L668 188 L662 190 L660 196 L658 190 L652 188 L658 186 Z" fill={stroke} fillOpacity="0.4" />
    </svg>
  )
}
