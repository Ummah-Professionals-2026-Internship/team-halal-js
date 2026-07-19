// Canonical color/spacing tokens. Standardized on the "dashboard/booking era"
// palette (sourced directly from the real web components — MentorCard.jsx,
// SessionCard.jsx, MentorServicesCard.jsx) rather than the earlier
// approximated auth-screen palette, since it's the more faithful match to
// the actual website.
export const colors = {
  text: '#00212C',
  textMuted: '#656565',
  placeholder: '#9a9a9a',
  primary: '#007CA6',
  primaryButton: '#0089b8',
  accent: '#fdbb36',
  secondaryDark: '#003F55',
  border: '#CFC5B3',
  error: '#c0392b',
  background: '#f5f7f8',
  card: '#ffffff',
  cardBorder: '#f1f5f9', // slate-100
  // Auth screens use a deliberate dark hero background, distinct from the
  // light background used everywhere else post-login.
  authBackground: '#00202b',
  errorOnDark: '#e57373',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;

// RN shadow props (iOS) + elevation (Android) for a subtle card lift —
// NativeWind's shadow-* utilities map to these automatically, this is the
// raw form for components that set style props directly.
export const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 3,
  elevation: 2,
} as const;
