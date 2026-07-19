// Direct port of the web client's phone formatter (used identically by
// MentorProfileSetup.jsx and MenteeProfileSetup.jsx).
export function formatPhoneNumber(value: string): string {
  if (!value) return value;
  let phoneNumber = value.replace(/[^\d]/g, '');
  if (phoneNumber.length === 11 && phoneNumber.startsWith('1')) {
    phoneNumber = phoneNumber.slice(1);
  }
  const len = phoneNumber.length;
  if (len < 4) return phoneNumber;
  if (len < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
}
