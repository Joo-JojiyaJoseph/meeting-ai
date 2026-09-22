/**
 * Small set of self-authored, contextual illustrations for empty/zero
 * states across the app. Kept in the brand gradient so they read as part
 * of the same product as the login hero, not stock art bolted on.
 */

export function EmptyCalendarIllustration({ className }) {
  return (
    <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ec-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
      </defs>
      <rect x="30" y="28" width="140" height="112" rx="16" fill="white" fillOpacity="0.6" stroke="url(#ec-a)" strokeOpacity="0.5" strokeWidth="1.5" />
      <rect x="30" y="28" width="140" height="34" rx="16" fill="url(#ec-a)" fillOpacity="0.9" />
      <rect x="54" y="16" width="8" height="24" rx="4" fill="url(#ec-a)" />
      <rect x="138" y="16" width="8" height="24" rx="4" fill="url(#ec-a)" />
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3, 4].map((col) => (
          <circle key={`${row}-${col}`} cx={54 + col * 24} cy={84 + row * 16} r="3" fill="#818CF8" opacity={row === 1 && col === 2 ? 1 : 0.25} />
        )),
      )}
      <circle cx="102" cy="100" r="7" fill="url(#ec-a)" />
    </svg>
  );
}

export function AllCaughtUpIllustration({ className }) {
  return (
    <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cu-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="86" r="52" fill="white" fillOpacity="0.55" stroke="url(#cu-a)" strokeOpacity="0.5" strokeWidth="1.5" />
      <circle cx="100" cy="86" r="34" fill="url(#cu-a)" />
      <path d="M84 86l11 11 22-22" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="60" y="132" width="80" height="8" rx="4" fill="url(#cu-a)" opacity="0.25" />
    </svg>
  );
}

export function EmptySearchIllustration({ className }) {
  return (
    <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="es-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <circle cx="88" cy="76" r="40" fill="white" fillOpacity="0.5" stroke="url(#es-a)" strokeOpacity="0.6" strokeWidth="3" />
      <line x1="117" y1="105" x2="150" y2="138" stroke="url(#es-a)" strokeWidth="6" strokeLinecap="round" />
      <path d="M72 76l12 12 20-24" stroke="url(#es-a)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.35" />
    </svg>
  );
}
