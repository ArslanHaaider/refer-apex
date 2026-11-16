import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";
import { verifyTextbeeSignature } from "./webhook-verify";

const secret = "a".repeat(32);
const body = JSON.stringify({ webhookEvent: "MESSAGE_DELIVERED", smsId: "abc" });
const now = 1_800_000_000;

function sign(t: number, raw = body, key = secret) {
  return `t=${t},v1=${createHmac("sha256", key).update(`${t}.${raw}`).digest("hex")}`;
}

describe("verifyTextbeeSignature", () => {
  it("accepts a valid signature", () => {
    assert.equal(verifyTextbeeSignature({ rawBody: body, header: sign(now), secret, nowSeconds: now }), true);
  });

  it("rejects a tampered body", () => {
    assert.equal(
      verifyTextbeeSignature({ rawBody: body + " ", header: sign(now), secret, nowSeconds: now }),
      false,
    );
  });

  it("rejects the wrong secret", () => {
    assert.equal(
      verifyTextbeeSignature({ rawBody: body, header: sign(now, body, "b".repeat(32)), secret, nowSeconds: now }),
      false,
    );
  });

  it("rejects a stale timestamp", () => {
    assert.equal(
      verifyTextbeeSignature({ rawBody: body, header: sign(now - 301), secret, nowSeconds: now }),
      false,
    );
  });

  it("rejects missing or malformed headers", () => {
    assert.equal(verifyTextbeeSignature({ rawBody: body, header: null, secret, nowSeconds: now }), false);
    assert.equal(verifyTextbeeSignature({ rawBody: body, header: "garbage", secret, nowSeconds: now }), false);
    assert.equal(verifyTextbeeSignature({ rawBody: body, header: `t=${now},v1=abc`, secret, nowSeconds: now }), false);
  });
});
