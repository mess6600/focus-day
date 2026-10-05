export const KIDS = [
  { id: "mohit", label: "Mohit" },
  { id: "amrit", label: "Amrit" },
] as const;

export type KidId = (typeof KIDS)[number]["id"];

export const KID_COOKIE = "focus_kid";

export function isKidId(value: string | null | undefined): value is KidId {
  return value === "mohit" || value === "amrit";
}

export function parseKidId(value: string | null | undefined): KidId | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return isKidId(normalized) ? normalized : null;
}

export function kidLabel(kid: KidId): string {
  return KIDS.find((entry) => entry.id === kid)?.label ?? kid;
}
