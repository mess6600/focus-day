export const KIDS = [
  { id: "mohit", label: "Mohit" },
  { id: "amrit", label: "Amrit" },
] as const;

export type KidId = (typeof KIDS)[number]["id"];

export const KID_COOKIE = "focus_kid";

/** Visit /?pick=1 to return to the Who's studying? starting page. */
export const HOME_PICK_PARAM = "pick";

export const startPageHref = `/?${HOME_PICK_PARAM}=1`;

export function boardHref(kid: KidId): string {
  return `/?kid=${kid}`;
}

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
