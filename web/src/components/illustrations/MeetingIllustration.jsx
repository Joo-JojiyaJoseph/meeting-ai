export function MeetingIllustration({ className }) {
  return (
    <svg viewBox="0 0 480 480" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mi-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
        <linearGradient id="mi-b" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
      </defs>

      {/* orbit rings */}
      <circle cx="240" cy="240" r="170" stroke="white" strokeOpacity="0.35" strokeWidth="1" />
      <circle cx="240" cy="240" r="120" stroke="white" strokeOpacity="0.45" strokeWidth="1" />

      {/* connection lines between participant nodes and the center */}
      <g stroke="white" strokeOpacity="0.5" strokeWidth="1.5">
        <line x1="240" y1="240" x2="240" y2="90" />
        <line x1="240" y1="240" x2="380" y2="180" />
        <line x1="240" y1="240" x2="370" y2="330" />
        <line x1="240" y1="240" x2="150" y2="360" />
        <line x1="240" y1="240" x2="95" y2="200" />
      </g>

      {/* central AI node */}
      <circle cx="240" cy="240" r="46" fill="url(#mi-a)" />
      <circle cx="240" cy="240" r="46" stroke="white" strokeOpacity="0.6" strokeWidth="2" />
      <path d="M240 216l7 16 16 7-16 7-7 16-7-16-16-7 16-7z" fill="white" />

      {/* participant tiles (rounded squares) around the orbit */}
      <g>
        <rect x="212" y="58" width="56" height="42" rx="12" fill="url(#mi-b)" opacity="0.95" />
        <rect x="356" y="150" width="56" height="42" rx="12" fill="white" opacity="0.9" />
        <rect x="344" y="304" width="56" height="42" rx="12" fill="url(#mi-b)" opacity="0.85" />
        <rect x="122" y="332" width="56" height="42" rx="12" fill="white" opacity="0.85" />
        <rect x="68" y="174" width="56" height="42" rx="12" fill="url(#mi-b)" opacity="0.9" />
      </g>

      {/* waveform accent along the bottom */}
      <g stroke="white" strokeOpacity="0.55" strokeWidth="2.5" strokeLinecap="round">
        <line x1="150" y1="430" x2="150" y2="418" />
        <line x1="165" y1="430" x2="165" y2="404" />
        <line x1="180" y1="430" x2="180" y2="422" />
        <line x1="195" y1="430" x2="195" y2="396" />
        <line x1="210" y1="430" x2="210" y2="414" />
        <line x1="225" y1="430" x2="225" y2="426" />
        <line x1="240" y1="430" x2="240" y2="392" />
        <line x1="255" y1="430" x2="255" y2="410" />
        <line x1="270" y1="430" x2="270" y2="420" />
        <line x1="285" y1="430" x2="285" y2="400" />
        <line x1="300" y1="430" x2="300" y2="416" />
        <line x1="315" y1="430" x2="315" y2="424" />
        <line x1="330" y1="430" x2="330" y2="408" />
      </g>
    </svg>
  );
}
