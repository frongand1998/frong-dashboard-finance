export const DEFAULT_ADMIN_EMAIL = "frongand1998@gmail.com";

export const getPrimaryEmail = (user: any): string =>
  user?.primaryEmailAddress?.emailAddress ||
  user?.emailAddresses?.[0]?.emailAddress ||
  "";

export const isDefaultAdminEmail = (email: string) =>
  email.trim().toLowerCase() === DEFAULT_ADMIN_EMAIL;

export const hasAdminAccess = (user: any) => {
  const email = getPrimaryEmail(user);
  const metadataAdmin = Boolean(user?.publicMetadata?.isAdmin);
  return isDefaultAdminEmail(email) || metadataAdmin;
};
