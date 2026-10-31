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
 * email or membership of the Melon organization (NEXT_PUBLIC_MELON_ORG_ID).
 * Only controls what the UI shows; the API enforces access itself.
 */
export function isMelonPlatformUser(
  user?: MelonCheckUser | null,
  organization?: MelonCheckOrganization | null,
): boolean {
  if (user?.email?.toLowerCase().endsWith('@melon.ng')) return true;
  if (organization?.domain?.toLowerCase() === 'melon.ng') return true;

  const orgId = organization?.id || user?.organizationId || user?.organization?.id;
  const melonOrgId = process.env.NEXT_PUBLIC_MELON_ORG_ID;
  // Never infer staff status from an organization name: customers choose those
  return !!melonOrgId && !!orgId && orgId === melonOrgId;
}
