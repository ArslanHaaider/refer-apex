/**
 * Eligibility helpers for referral campaign targeting.
 * REFERRAL_ELIGIBILITY_DAYS is the global fallback; each user can override
 * this in their sheet connection settings.
 */

export function getEligibilityDays(): number {
  const raw = process.env.REFERRAL_ELIGIBILITY_DAYS;
  if (!raw) return 30;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 30;
  return parsed;
}

/** Returns true when lastServiceDate + eligibilityDays is on or before today (UTC date). */
export function isContactEligible(
  lastServiceDate: string,
  asOf: Date = new Date(),
  eligibilityDays: number = getEligibilityDays(),
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lastServiceDate)) {
    return false;
  }

  const [year, month, day] = lastServiceDate.split("-").map(Number);
  const serviceUtc = Date.UTC(year, month - 1, day);
  const eligibleFromUtc = serviceUtc + eligibilityDays * 24 * 60 * 60 * 1000;

  const asOfUtc = Date.UTC(
    asOf.getUTCFullYear(),
    asOf.getUTCMonth(),
    asOf.getUTCDate(),
  );

  return eligibleFromUtc <= asOfUtc;
}

export function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+]/g, "").trim();
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidServiceDate(raw: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false;
  const date = new Date(`${raw}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(raw);
}
