/**
 * Admin Configuration
 * 
 * Centralized list of designated Administrator accounts for BeginFin.
 * 
 * You can grant admin privileges in three ways:
 * 1. Add their email to DEFAULT_ADMIN_EMAILS below (case-insensitive).
 * 2. In Firebase Console > Firestore Database > `users` collection > document `{userUID}`,
 *    add a field: `role` = `"admin"`.
 * 3. Set custom claims on the Firebase user token (`admin: true` or `role: "admin"`).
 */

export const DEFAULT_ADMIN_EMAILS: string[] = [
  'vishnukakarla108@gmail.com',
  'kv303157@gmail.com',
  'kruzksmith@gmail.com',
  'vishnuprasad.kakarla@mybisd.net'
];

/**
 * Check if a given email is in the admin email list
 */
export function isEmailAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return DEFAULT_ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase().trim() === normalized);
}

/**
 * Comprehensive check for admin privileges across email, token claims, and Firestore document
 */
export function checkIsAdmin(
  user: { email?: string | null; uid?: string } | null,
  firestoreRole?: string | null,
  tokenClaims?: Record<string, any> | null
): boolean {
  if (!user) return false;

  // 1. Check email whitelist
  if (user.email && isEmailAdmin(user.email)) {
    return true;
  }

  // 2. Check token claims
  if (tokenClaims && (tokenClaims.admin === true || tokenClaims.role === 'admin')) {
    return true;
  }

  // 3. Check Firestore document role
  if (firestoreRole === 'admin') {
    return true;
  }

  return false;
}
