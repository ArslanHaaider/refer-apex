import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isContactEligible, isValidServiceDate, normalizeEmail, normalizePhone } from "./eligibility";
import { getMockSheetValues } from "./mock-sheet-data";

/**
 * Smoke test for mock sheet shape + identity/eligibility rules used by sync.
 * Full DB upsert coverage requires a live Supabase instance.
 */
describe("sync parse smoke", () => {
  it("mock sheet has required headers and valid rows", () => {
    const values = getMockSheetValues();
    assert.ok(values.length > 1);

    const headers = values[0].map((h) => h.toLowerCase());
    for (const required of ["full_name", "phone", "email", "last_service_date"]) {
      assert.ok(headers.includes(required), `missing ${required}`);
    }

    let validRows = 0;
    for (let i = 1; i < values.length; i += 1) {
      const row = values[i];
      const phone = normalizePhone(row[1] ?? "");
      const email = normalizeEmail(row[2] ?? "");
      const date = row[3] ?? "";
      if (row[0] && phone && email && isValidServiceDate(date)) {
        validRows += 1;
        // Identity uniqueness key components must both exist.
        assert.ok(phone.length > 5);
        assert.ok(email.includes("@"));
        void isContactEligible(date);
      }
    }

    assert.ok(validRows >= 5);
  });
});
