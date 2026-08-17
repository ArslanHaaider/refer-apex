import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getEligibilityDays,
  isContactEligible,
  isValidServiceDate,
  normalizeEmail,
  normalizePhone,
} from "./eligibility";

describe("eligibility", () => {
  it("normalizes phone and email", () => {
    assert.equal(normalizePhone("+1 (555) 010-001"), "+1555010001");
    assert.equal(normalizeEmail("  Ava@Example.COM "), "ava@example.com");
  });

  it("validates YYYY-MM-DD service dates", () => {
    assert.equal(isValidServiceDate("2026-01-15"), true);
    assert.equal(isValidServiceDate("01/15/2026"), false);
    assert.equal(isValidServiceDate("2026-13-01"), false);
  });

  it("marks contacts eligible after configured delay", () => {
    const asOf = new Date("2026-08-09T12:00:00.000Z");
    assert.equal(isContactEligible("2026-07-01", asOf, 30), true);
    assert.equal(isContactEligible("2026-07-20", asOf, 30), false);
    assert.equal(isContactEligible("2026-07-10", asOf, 30), true);
  });

  it("defaults eligibility days to 30 when env invalid", () => {
    const previous = process.env.REFERRAL_ELIGIBILITY_DAYS;
    process.env.REFERRAL_ELIGIBILITY_DAYS = "not-a-number";
    assert.equal(getEligibilityDays(), 30);
    process.env.REFERRAL_ELIGIBILITY_DAYS = previous;
  });
});
