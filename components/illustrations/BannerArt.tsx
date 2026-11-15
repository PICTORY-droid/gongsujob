import type { BannerArt as BannerArtName } from "@/features/home/home-menus";

/**
 * 홈 배너 일러스트 (공수잡 전용으로 직접 그린 SVG).
 * 외부 이미지 없이 색상 토큰만 사용해 가볍고 선명하다. 장식용이라 스크린리더에는 숨긴다.
 */

const NAVY = "var(--gs-navy)";
const BLUE = "var(--gs-blue)";
const ORANGE = "var(--gs-brand-bright)";
const ORANGE_DEEP = "var(--gs-brand)";
const SOFT = "#ffffff";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 240 180" width="100%" height="100%" aria-hidden="true" focusable="false" style={{ display: "block" }}>
      <defs>
        <radialGradient id="gs-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="96" rx="104" ry="78" fill="url(#gs-glow)" />
      <ellipse cx="120" cy="160" rx="74" ry="8" fill={NAVY} opacity="0.08" />
      {children}
    </svg>
  );
}

function Today() {
  return (
    <Frame>
      {/* 달력 */}
      <rect x="44" y="40" width="96" height="100" rx="14" fill={SOFT} stroke={NAVY} strokeWidth="3" />
      <rect x="44" y="40" width="96" height="26" rx="14" fill={BLUE} />
      <rect x="44" y="56" width="96" height="10" fill={BLUE} />
      <circle cx="66" cy="38" r="5" fill={NAVY} />
      <circle cx="118" cy="38" r="5" fill={NAVY} />
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <rect key={`${row}-${col}`} x={56 + col * 20} y={76 + row * 19} width="12" height="10" rx="3" fill={row === 1 && col === 1 ? ORANGE : "#e3e9f7"} />
        )),
      )}
      {/* 안전모 */}
      <path d="M128 120c0-26 18-44 42-44s42 18 42 44" fill={ORANGE} stroke={ORANGE_DEEP} strokeWidth="3" />
      <rect x="120" y="118" width="100" height="12" rx="6" fill={ORANGE_DEEP} />
      <rect x="164" y="74" width="12" height="46" rx="5" fill="#ffd2b8" />
      {/* 해 */}
      <circle cx="200" cy="44" r="14" fill="#ffd166" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <rect key={deg} x="199" y="20" width="2.5" height="7" rx="1.2" fill="#ffd166" transform={`rotate(${deg} 200 44)`} />
      ))}
    </Frame>
  );
}

function Privacy() {
  return (
    <Frame>
      {/* 휴대폰 */}
      <rect x="58" y="30" width="70" height="124" rx="14" fill={NAVY} />
      <rect x="64" y="40" width="58" height="102" rx="8" fill={SOFT} />
      <rect x="72" y="52" width="42" height="8" rx="4" fill="#e3e9f7" />
      <rect x="72" y="66" width="30" height="8" rx="4" fill="#e3e9f7" />
      <rect x="72" y="86" width="42" height="18" rx="6" fill="#e3e9f7" />
      <text x="93" y="99" textAnchor="middle" fontSize="10" fontWeight="700" fill={NAVY}>
        010-••••-••••
      </text>
      {/* 방패 */}
      <path d="M170 46l38 14v28c0 26-17 44-38 52-21-8-38-26-38-52V60z" fill={BLUE} stroke={NAVY} strokeWidth="3" strokeLinejoin="round" />
      <path d="M154 94l12 12 22-26" fill="none" stroke={SOFT} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="132" cy="122" r="12" fill={ORANGE} />
      <path d="M127 122l4 4 7-8" fill="none" stroke={SOFT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

function NetPay() {
  return (
    <Frame>
      {/* 계산기 */}
      <rect x="50" y="34" width="84" height="116" rx="14" fill={NAVY} />
      <rect x="60" y="46" width="64" height="26" rx="6" fill="#dfe8fb" />
      <text x="118" y="64" textAnchor="end" fontSize="13" fontWeight="800" fill={NAVY}>
        196,715
      </text>
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <rect key={`${row}-${col}`} x={62 + col * 21} y={82 + row * 20} width="16" height="14" rx="4" fill={row === 2 && col === 2 ? ORANGE : "#3b5aa6"} />
        )),
      )}
      {/* 동전 */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <ellipse cx="180" cy={140 - i * 12} rx="28" ry="9" fill={ORANGE_DEEP} />
          <ellipse cx="180" cy={136 - i * 12} rx="28" ry="9" fill={ORANGE} />
        </g>
      ))}
      <text x="180" y="104" textAnchor="middle" fontSize="13" fontWeight="900" fill={SOFT}>
        ₩
      </text>
      <circle cx="210" cy="56" r="16" fill={SOFT} stroke={BLUE} strokeWidth="3" />
      <path d="M203 56h14M210 49v14" stroke={BLUE} strokeWidth="3" strokeLinecap="round" />
    </Frame>
  );
}

function Documents() {
  return (
    <Frame>
      {/* 엑셀 표 */}
      <rect x="40" y="44" width="104" height="100" rx="12" fill={SOFT} stroke={NAVY} strokeWidth="3" />
      <rect x="40" y="44" width="104" height="20" rx="12" fill="#1f7a4d" />
      <rect x="40" y="56" width="104" height="8" fill="#1f7a4d" />
      {[0, 1, 2, 3].map((row) => (
        <g key={row}>
          <rect x="50" y={74 + row * 16} width="28" height="9" rx="3" fill="#e3e9f7" />
          <rect x="84" y={74 + row * 16} width="20" height="9" rx="3" fill="#e3e9f7" />
          <rect x="110" y={74 + row * 16} width="26" height="9" rx="3" fill={row === 3 ? ORANGE : "#cfe9da"} />
        </g>
      ))}
      {/* 계약서 */}
      <g transform="rotate(8 178 98)">
        <rect x="140" y="38" width="78" height="104" rx="10" fill={SOFT} stroke={BLUE} strokeWidth="3" />
        <rect x="152" y="54" width="54" height="7" rx="3.5" fill={BLUE} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x="152" y={70 + i * 12} width={i === 3 ? 34 : 54} height="5" rx="2.5" fill="#d6def0" />
        ))}
        <path d="M156 126c8-10 14 6 22-4s12 2 20-4" fill="none" stroke={ORANGE_DEEP} strokeWidth="3" strokeLinecap="round" />
      </g>
    </Frame>
  );
}

function Resume() {
  return (
    <Frame>
      <rect x="62" y="30" width="96" height="124" rx="14" fill={SOFT} stroke={NAVY} strokeWidth="3" />
      <circle cx="110" cy="66" r="18" fill="#e3e9f7" />
      <path d="M92 66c0-12 8-20 18-20s18 8 18 20" fill={ORANGE} />
      <rect x="90" y="64" width="40" height="5" rx="2.5" fill={ORANGE_DEEP} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x="78" y={98 + i * 14} width={i === 2 ? 40 : 64} height="7" rx="3.5" fill="#d6def0" />
      ))}
      {/* 안전교육 배지 */}
      <circle cx="170" cy="120" r="26" fill="#15803d" />
      <path d="M158 120l8 8 16-18" fill="none" stroke={SOFT} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      {/* 알림 말풍선 */}
      <rect x="150" y="34" width="66" height="32" rx="12" fill={BLUE} />
      <path d="M162 66l-4 10 14-10z" fill={BLUE} />
      <text x="183" y="55" textAnchor="middle" fontSize="12" fontWeight="800" fill={SOFT}>
        제안 도착
      </text>
    </Frame>
  );
}

const ART: Record<BannerArtName, () => React.ReactElement> = {
  today: Today,
  privacy: Privacy,
  netpay: NetPay,
  documents: Documents,
  resume: Resume,
};

export function BannerArt({ name }: { name: BannerArtName }) {
  const Art = ART[name];
  return <Art />;
}
