import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldApplyDeliveryStatus, statusForWebhookEvent } from "./delivery";
import { classifyTextbeeStatus } from "./textbee";

describe("delivery status", () => {
  it("maps webhook events", () => {
    assert.equal(statusForWebhookEvent("MESSAGE_SENT"), "sent");
    assert.equal(statusForWebhookEvent("MESSAGE_DELIVERED"), "delivered");
    assert.equal(statusForWebhookEvent("MESSAGE_FAILED"), "failed");
    assert.equal(statusForWebhookEvent("SMS_STATUS_UPDATED", "Delivered"), "delivered");
    assert.equal(statusForWebhookEvent("SMS_STATUS_UPDATED", "bogus"), null);
    assert.equal(statusForWebhookEvent("MESSAGE_RECEIVED"), null);
  });

  it("only moves forward and treats delivered/failed as final", () => {
    assert.equal(shouldApplyDeliveryStatus(null, "sent"), true);
    assert.equal(shouldApplyDeliveryStatus("pending", "sent"), true);
    assert.equal(shouldApplyDeliveryStatus("sent", "delivered"), true);
    assert.equal(shouldApplyDeliveryStatus("delivered", "sent"), false);
    assert.equal(shouldApplyDeliveryStatus("delivered", "failed"), false);
    assert.equal(shouldApplyDeliveryStatus("failed", "delivered"), false);
    assert.equal(shouldApplyDeliveryStatus("sent", "sent"), false);
  });

  it("classifies TextBee HTTP errors", () => {
    assert.deepEqual(classifyTextbeeStatus(401), { retryable: false, auth: true });
    assert.deepEqual(classifyTextbeeStatus(403), { retryable: false, auth: true });
    assert.deepEqual(classifyTextbeeStatus(429), { retryable: true, auth: false });
    assert.deepEqual(classifyTextbeeStatus(503), { retryable: true, auth: false });
    assert.deepEqual(classifyTextbeeStatus(400), { retryable: false, auth: false });
  });
});
