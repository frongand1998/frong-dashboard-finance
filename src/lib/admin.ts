export const DEFAULT_ADMIN_EMAIL = "frongand1998@gmail.com";

type AdminLikeUser = {
  primaryEmailAddress?: { emailAddress?: string | null } | null;
  emailAddresses?: Array<{ emailAddress?: string | null }>;
  publicMetadata?: { isAdmin?: boolean };
};

export const getPrimaryEmail = (
  user: AdminLikeUser | null | undefined,
): string =>
  user?.primaryEmailAddress?.emailAddress ||
  user?.emailAddresses?.[0]?.emailAddress ||
  "";

export const isDefaultAdminEmail = (email: string) =>
  email.trim().toLowerCase() === DEFAULT_ADMIN_EMAIL;

export const hasAdminAccess = (user: AdminLikeUser | null | undefined) => {
  const email = getPrimaryEmail(user);
  const metadataAdmin = Boolean(user?.publicMetadata?.isAdmin);
  return isDefaultAdminEmail(email) || metadataAdmin;
};
