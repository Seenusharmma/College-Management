const adminEmailsString = process.env.ADMIN_EMAILS || '';
const DEFAULT_ADMIN_EMAILS = [
  'roshansharma404error@gmail.com',
  'admin@academichub.com'
];

export const ADMIN_EMAILS = adminEmailsString
  ? adminEmailsString.split(',').map(email => email.trim().toLowerCase())
  : DEFAULT_ADMIN_EMAILS;

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
