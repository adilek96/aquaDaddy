/**
 * Иллюстрация аквариума для главной.
 *
 * Рисуется инлайновым SVG, а не картинкой: так она весит пару килобайт,
 * остаётся резкой на любом экране и — главное — берёт цвета из токенов темы,
 * поэтому в тёмной теме не превращается в светлое пятно.
 *
 * Анимации (пузырьки, покачивание растений, рыбы) объявлены в globals.css
 * под классом .aq-scene и сами выключаются при prefers-reduced-motion
 * и при выключенных анимациях в настройках приложения.
 */
export function AquariumScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label=""
      aria-hidden="true"
      className={`aq-scene ${className ?? ""}`}
    >
      <defs>
        {/* Толща воды: сверху светлее, ко дну глубже */}
        <linearGradient id="aq-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.38" />
          <stop offset="55%" stopColor="hsl(var(--primary))" stopOpacity="0.34" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.45" />
        </linearGradient>

        {/* Блик по стеклу слева направо */}
        <linearGradient id="aq-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.14" />
        </linearGradient>

        <linearGradient id="aq-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity="0.5" />
          <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity="0.24" />
        </linearGradient>

        {/* Луч света от лампы */}
        <linearGradient id="aq-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        {/* Всё внутреннее содержимое обрезается по форме аквариума */}
        <clipPath id="aq-tank">
          <rect x="26" y="44" width="368" height="232" rx="26" />
        </clipPath>

        {/* Силуэт рыбы — один раз, дальше через <use> */}
        <g id="aq-fish">
          <path
            d="M0 0c7-10 26-16 38-16s24 6 30 16c-6 10-18 16-30 16S7 10 0 0Z"
            fill="currentColor"
          />
          <path d="M0 0-16-13-13 0-16 13Z" fill="currentColor" opacity="0.75" />
          <circle cx="54" cy="-4" r="2.4" fill="hsl(var(--background))" />
        </g>
      </defs>

      {/* ---------- Мягкая тень под аквариумом ---------- */}
      <ellipse
        cx="210"
        cy="288"
        rx="150"
        ry="12"
        fill="hsl(var(--primary))"
        opacity="0.18"
      />
      <ellipse
        cx="210"
        cy="288"
        rx="96"
        ry="7"
        fill="hsl(var(--primary))"
        opacity="0.16"
      />

      {/* ---------- Содержимое аквариума ---------- */}
      <g clipPath="url(#aq-tank)">
        <rect x="26" y="44" width="368" height="232" fill="url(#aq-water)" />

        {/* Лучи от лампы */}
        <g className="aq-beams">
          <polygon points="96,44 126,44 168,276 108,276" fill="url(#aq-beam)" />
          <polygon points="212,44 234,44 268,276 224,276" fill="url(#aq-beam)" />
          <polygon points="308,44 322,44 340,276 302,276" fill="url(#aq-beam)" />
        </g>

        {/* Дальние камни — создают глубину */}
        <ellipse cx="118" cy="266" rx="50" ry="14" fill="hsl(var(--accent))" opacity="0.18" />
        <ellipse cx="286" cy="264" rx="40" ry="12" fill="hsl(var(--accent))" opacity="0.15" />

        {/* Растения. Каждое качается со своей задержкой,
            иначе группа выглядит как один жёсткий объект */}
        <g className="aq-plants" stroke="hsl(var(--success))" strokeLinecap="round" fill="none">
          <path
            className="aq-sway"
            style={{ animationDelay: "0s", transformOrigin: "64px 262px" }}
            d="M64 262c-10-22 6-38-2-58s4-32-2-46"
            strokeWidth="7"
            opacity="0.75"
          />
          <path
            className="aq-sway"
            style={{ animationDelay: "-1.4s", transformOrigin: "86px 264px" }}
            d="M86 264c8-18-4-32 4-48s-2-24 2-34"
            strokeWidth="5"
            opacity="0.6"
          />
          <path
            className="aq-sway"
            style={{ animationDelay: "-2.6s", transformOrigin: "348px 264px" }}
            d="M348 264c-9-20 5-34-1-52s3-26-1-38"
            strokeWidth="6"
            opacity="0.66"
          />
          <path
            className="aq-sway"
            style={{ animationDelay: "-0.8s", transformOrigin: "326px 266px" }}
            d="M326 266c7-16-4-28 3-42"
            strokeWidth="4.5"
            opacity="0.5"
          />
        </g>

        {/* Широколистное растение */}
        <g
          className="aq-sway"
          style={{ animationDelay: "-2s", transformOrigin: "246px 262px" }}
        >
          <path
            d="M246 262c-16-26-12-54 0-64 12 10 16 38 0 64Z"
            fill="hsl(var(--success))"
            opacity="0.45"
          />
          <path
            d="M246 262c-24-16-28-40-22-50 12 4 24 26 22 50Z"
            fill="hsl(var(--success))"
            opacity="0.32"
          />
          <path
            d="M246 262c24-16 28-40 22-50-12 4-24 26-22 50Z"
            fill="hsl(var(--success))"
            opacity="0.32"
          />
        </g>

        {/* Грунт */}
        <path
          d="M26 268c34-14 62 6 96-2s54-18 92-10 58 16 92 8 54-10 88-4v16H26Z"
          fill="url(#aq-sand)"
        />
        <circle cx="132" cy="268" r="6" fill="hsl(var(--warning))" opacity="0.4" />
        <circle cx="198" cy="272" r="4" fill="hsl(var(--warning))" opacity="0.34" />
        <circle cx="300" cy="269" r="5" fill="hsl(var(--warning))" opacity="0.3" />

        {/* Рыбы на трёх планах */}
        <use
          href="#aq-fish"
          x="150"
          y="118"
          className="aq-fish aq-fish-1"
          color="hsl(var(--primary))"
        />
        <use
          href="#aq-fish"
          x="268"
          y="186"
          className="aq-fish aq-fish-2"
          color="hsl(var(--accent))"
          transform="scale(0.7)"
          style={{ transformOrigin: "268px 186px" }}
        />
        <use
          href="#aq-fish"
          x="112"
          y="212"
          className="aq-fish aq-fish-3"
          color="hsl(var(--secondary))"
          transform="scale(0.55)"
          style={{ transformOrigin: "112px 212px" }}
        />

        {/* Пузырьки от распылителя */}
        <g className="aq-bubbles" fill="#fff">
          <circle cx="352" cy="250" r="4" opacity="0.5" style={{ animationDelay: "0s" }} />
          <circle cx="344" cy="250" r="2.6" opacity="0.42" style={{ animationDelay: "-1.1s" }} />
          <circle cx="358" cy="250" r="3.2" opacity="0.36" style={{ animationDelay: "-2.3s" }} />
          <circle cx="348" cy="250" r="2" opacity="0.45" style={{ animationDelay: "-3.1s" }} />
          <circle cx="356" cy="250" r="2.8" opacity="0.3" style={{ animationDelay: "-4.2s" }} />
        </g>

        {/* Поверхность воды */}
        <path
          d="M26 62c30-9 54 9 84 3s52-14 84-7 52 13 82 6 40-9 38-9v-11H26Z"
          fill="#fff"
          opacity="0.16"
        />
      </g>

      {/* ---------- Стекло и рама ---------- */}
      <rect
        x="26"
        y="44"
        width="368"
        height="232"
        rx="26"
        fill="url(#aq-glass)"
      />
      <rect
        x="26"
        y="44"
        width="368"
        height="232"
        rx="26"
        stroke="hsl(var(--primary))"
        strokeOpacity="0.45"
        strokeWidth="3"
      />

      {/* Крышка с лампой */}
      <rect
        x="16"
        y="26"
        width="388"
        height="26"
        rx="13"
        fill="hsl(var(--primary))"
        opacity="0.85"
      />
      <rect x="150" y="36" width="120" height="6" rx="3" fill="#fff" opacity="0.55" />
    </svg>
  );
}
