import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { randomBytes } from "node:crypto";
import { decryptToken, encryptToken } from "./token-crypto";

describe("token-crypto", () => {
  it("round-trips encrypted tokens", () => {
    const previous = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;
    process.env.GOOGLE_TOKEN_ENCRYPTION_KEY = randomBytes(32).toString("base64");

    const plaintext = "super-secret-access-token";
    const encrypted = encryptToken(plaintext);
    assert.notEqual(encrypted, plaintext);
    assert.equal(decryptToken(encrypted), plaintext);

    process.env.GOOGLE_TOKEN_ENCRYPTION_KEY = previous;
  });

  it("rejects malformed payloads", () => {
    const previous = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;
    process.env.GOOGLE_TOKEN_ENCRYPTION_KEY = randomBytes(32).toString("base64");
    assert.throws(() => decryptToken("not-valid"), /Malformed encrypted token/);
    process.env.GOOGLE_TOKEN_ENCRYPTION_KEY = previous;
  });
});
