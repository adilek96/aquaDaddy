/**
 * Мелкая декоративная графика для главной: волны-разделители и
 * иллюстрированные шапки карточек. Всё инлайновым SVG на токенах темы —
 * ни одного растрового файла и ни одного запроса.
 */

/** Волна-разделитель. Прижимается к низу блока через absolute. */
export function WaveDivider({
  className,
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      className={className}
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      {/* Два оттенка зелени вместо синего с бирюзой: дальняя волна темнее,
          ближняя светлее — так полоса читается объёмнее плоской заливки */}
      <path
        d="M0 64c120-34 240-34 360 0s240 34 360 0 240-34 360 0 240 34 360 0v56H0Z"
        fill="hsl(var(--plant-deep))"
        fillOpacity="0.2"
      />
      <path
        d="M0 82c130-30 250-22 370 6s250 28 370 0 250-30 370-6 210 30 330 18v20H0Z"
        fill="hsl(var(--plant))"
        fillOpacity="0.28"
      />
    </svg>
  );
}

type CardArt = "tanks" | "discovery" | "wiki";

/**
 * Шапка карточки-перехода. У каждого раздела свой сюжет, но общий приём:
 * толща воды, волна по низу и пара силуэтов — чтобы три карточки читались
 * как один набор, а не как три случайные картинки.
 */
export function CardIllustration({ art }: { art: CardArt }) {
  return (
    <svg
      viewBox="0 0 320 120"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="h-full w-full"
    >
      <defs>
        <linearGradient id={`card-water-${art}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.28" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.22" />
        </linearGradient>
      </defs>

      <rect width="320" height="120" fill={`url(#card-water-${art})`} />

      {art === "tanks" && (
        <g>
          {/* Ряд аквариумов разной высоты — «мои аквариумы» */}
          <rect
            x="34"
            y="44"
            width="72"
            height="54"
            rx="9"
            stroke="hsl(var(--primary))"
            strokeOpacity="0.55"
            strokeWidth="3"
            fill="hsl(var(--primary))"
            fillOpacity="0.12"
          />
          <rect
            x="122"
            y="28"
            width="82"
            height="70"
            rx="10"
            stroke="hsl(var(--primary))"
            strokeOpacity="0.75"
            strokeWidth="3"
            fill="hsl(var(--primary))"
            fillOpacity="0.16"
          />
          <rect
            x="220"
            y="52"
            width="66"
            height="46"
            rx="8"
            stroke="hsl(var(--primary))"
            strokeOpacity="0.45"
            strokeWidth="3"
            fill="hsl(var(--primary))"
            fillOpacity="0.1"
          />
          <path
            d="M150 62c4-6 15-9 22-9s14 3 17 9c-3 6-10 9-17 9s-18-3-22-9Z"
            fill="hsl(var(--primary))"
            fillOpacity="0.8"
          />
          <path d="M150 62 138 54l3 8-3 8Z" fill="hsl(var(--primary))" fillOpacity="0.6" />
          <circle cx="182" cy="59" r="1.6" fill="hsl(var(--background))" />
          <path
            d="M60 92c-5-11 3-19-1-29"
            stroke="hsl(var(--plant))"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.65"
          />
          <path
            d="M248 92c-4-9 2-15 0-23"
            stroke="hsl(var(--plant))"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        </g>
      )}

      {art === "discovery" && (
        <g>
          {/* Компас и стайка рыб — «сообщество» */}
          <circle
            cx="94"
            cy="60"
            r="34"
            stroke="hsl(var(--secondary))"
            strokeOpacity="0.7"
            strokeWidth="3"
            fill="hsl(var(--secondary))"
            fillOpacity="0.12"
          />
          <path
            d="M108 46 84 58l-12 24 24-12Z"
            fill="hsl(var(--secondary))"
            fillOpacity="0.85"
          />
          <circle cx="94" cy="60" r="3" fill="hsl(var(--background))" />
          {[
            { x: 176, y: 38, s: 1 },
            { x: 216, y: 62, s: 1.25 },
            { x: 178, y: 84, s: 0.85 },
            { x: 252, y: 40, s: 0.9 },
          ].map(({ x, y, s }, i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
              <path
                d="M0 0c3-5 12-8 18-8s11 3 14 8c-3 5-8 8-14 8S3 5 0 0Z"
                fill="hsl(var(--accent))"
                fillOpacity="0.75"
              />
              <path d="M0 0-8-6-6 0-8 6Z" fill="hsl(var(--accent))" fillOpacity="0.6" />
            </g>
          ))}
        </g>
      )}

      {art === "wiki" && (
        <g>
          {/* Раскрытая книга, над ней — рыба */}
          <path
            d="M62 84V44c22-10 42-10 62 0v40c-20-9-40-9-62 0Z"
            fill="hsl(var(--accent))"
            fillOpacity="0.2"
            stroke="hsl(var(--accent))"
            strokeOpacity="0.65"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M124 84V44c20-10 40-10 62 0v40c-22-9-42-9-62 0Z"
            fill="hsl(var(--accent))"
            fillOpacity="0.14"
            stroke="hsl(var(--accent))"
            strokeOpacity="0.5"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M124 44v40"
            stroke="hsl(var(--accent))"
            strokeOpacity="0.7"
            strokeWidth="3"
          />
          {[54, 62, 70].map((y) => (
            <g key={y}>
              <path
                d={`M76 ${y}h32`}
                stroke="hsl(var(--accent))"
                strokeOpacity="0.4"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d={`M140 ${y}h32`}
                stroke="hsl(var(--accent))"
                strokeOpacity="0.3"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          ))}
          <g transform="translate(228 50)">
            <path
              d="M0 0c4-7 16-11 24-11s15 4 19 11c-4 7-11 11-19 11S4 7 0 0Z"
              fill="hsl(var(--primary))"
              fillOpacity="0.8"
            />
            <path d="M0 0-11-8-8 0-11 8Z" fill="hsl(var(--primary))" fillOpacity="0.6" />
            <circle cx="34" cy="-2" r="2" fill="hsl(var(--background))" />
          </g>
          <circle cx="272" cy="28" r="4" fill="#fff" opacity="0.4" />
          <circle cx="286" cy="44" r="2.5" fill="#fff" opacity="0.3" />
        </g>
      )}

      {/* Общая волна по низу — связывает три карточки в набор */}
      <path
        d="M0 96c40-12 80 8 120 2s70-14 110-6 50 12 90 4v24H0Z"
        fill="hsl(var(--surface))"
        fillOpacity="0.85"
      />
    </svg>
  );
}
