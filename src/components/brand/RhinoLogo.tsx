import * as React from "react";

type RhinoLogoProps = {
  /** Tailwind classes for sizing (e.g. "h-10 w-10"). */
  className?: string;
  /** Show the "Roam Saathi" wordmark next to the mark. */
  withWordmark?: boolean;
  /** Light variant — for dark backgrounds. */
  light?: boolean;
  /** Optional title for accessibility. */
  title?: string;
};

/**
 * Inline SVG one-horned Assam rhino mark for Roam Saathi.
 * Forest green body with a saffron road-line flowing through it.
 * No external image dependency.
 */
export function RhinoLogo({
  className = "h-10 w-10",
  withWordmark = false,
  light = false,
  title = "Roam Saathi",
}: RhinoLogoProps) {
  const ink = light ? "#FFFBF5" : "#14532D";
  const saffron = "#F59E0B";
  const sub = light ? "rgba(255,251,245,0.85)" : "#166534";
  return (
    <span className="inline-flex items-center gap-2.5" aria-label={title}>
      <svg
        viewBox="0 0 64 64"
        className={className}
        role="img"
        aria-hidden="true"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{title}</title>
        {/* Saffron road line flowing through the rhino */}
        <path
          d="M4 50 C 18 44, 30 52, 44 44 S 60 36, 60 36"
          fill="none"
          stroke={saffron}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M6 54 C 20 48, 32 56, 46 48 S 60 40, 60 40"
          fill="none"
          stroke={saffron}
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* Rhino body — chunky silhouette */}
        <path
          d="M12 40
             C 10 32, 14 26, 22 24
             L 24 18
             C 25 14, 28 13, 30 15
             L 32 20
             C 36 18, 40 18, 44 20
             L 50 22
             C 53 22, 55 24, 54 27
             L 52 30
             C 54 32, 55 36, 53 40
             L 50 40
             L 50 46
             L 46 46
             L 46 41
             L 26 41
             L 26 46
             L 22 46
             L 22 41
             C 18 41, 14 41, 12 40 Z"
          fill={ink}
        />
        {/* Horn */}
        <path
          d="M22 24 L 16 12 L 24 18 Z"
          fill={ink}
        />
        {/* Eye */}
        <circle cx="44" cy="26" r="1.6" fill={saffron} />
        {/* Ear */}
        <path
          d="M30 18 L 32 14 L 34 18 Z"
          fill={sub}
        />
        {/* Tail */}
        <path
          d="M53 38 L 60 34 L 58 40 Z"
          fill={ink}
        />
      </svg>
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className="font-extrabold tracking-tight text-lg"
            style={{ color: ink }}
          >
            Roam{" "}
            <span style={{ color: saffron }}>Saathi</span>
          </span>
          <span
            className="text-[10px] font-medium uppercase tracking-[0.18em]"
            style={{ color: sub }}
          >
            Northeast Road Companion
          </span>
        </span>
      )}
    </span>
  );
}

export default RhinoLogo;
