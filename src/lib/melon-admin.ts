interface MelonCheckUser {
  email?: string;
  organizationId?: string;
  organization?: { id?: string; name?: string } | null;
}

interface MelonCheckOrganization {
  id?: string;
  name?: string;
  domain?: string;
}

/**
 * Whether the signed-in user is Melon staff. Mirrors the backend: a @melon.ng
 * email or membership of the Melon organization. Organization names are
 * user-chosen at signup, so they are only used when NEXT_PUBLIC_MELON_ORG_ID
 * is not configured.
 */
export function isMelonPlatformUser(
  user?: MelonCheckUser | null,
  organization?: MelonCheckOrganization | null,
): boolean {
  if (user?.email?.toLowerCase().endsWith('@melon.ng')) return true;
  if (organization?.domain?.toLowerCase() === 'melon.ng') return true;

  const orgId = organization?.id || user?.organizationId || user?.organization?.id;
  const melonOrgId = process.env.NEXT_PUBLIC_MELON_ORG_ID;
  if (melonOrgId) return !!orgId && orgId === melonOrgId;

  const orgName = organization?.name || user?.organization?.name || '';
  return orgName.toLowerCase().includes('melon');
}
