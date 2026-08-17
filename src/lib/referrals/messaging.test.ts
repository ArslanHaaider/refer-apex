import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { backoffMs, renderTemplate, sendEmailMessage, sendWhatsAppMessage } from "./messaging";

describe("messaging", () => {
  it("renders template variables", () => {
    const out = renderTemplate("Hi {{first_name}}, get {{discount}} via {{referral_link}}", {
      first_name: "Ava",
      discount: "15% off",
      referral_link: "https://example.com/r/abc",
    });
    assert.equal(out, "Hi Ava, get 15% off via https://example.com/r/abc");
  });

  it("leaves unknown variables empty", () => {
    assert.equal(renderTemplate("Hello {{missing}}", {}), "Hello ");
  });

  it("computes bounded backoff", () => {
    const delay = backoffMs(3, 1000, 10_000);
    assert.ok(delay >= 4000);
    assert.ok(delay <= 10_250);
  });

  it("mock whatsapp and email sends succeed", async () => {
    process.env.MESSAGING_MOCK = "true";

    const wa = await sendWhatsAppMessage({
      phoneNumberId: "123",
      accessToken: "token",
      toPhone: "+1555010001",
      body: "Hello",
    });
    assert.equal(wa.ok, true);

    const email = await sendEmailMessage({
      toEmail: "ava@example.com",
      subject: "Hi",
      body: "Body",
    });
    assert.equal(email.ok, true);
  });
});
