export type DeliveryStatus =
  | "pending"
  | "dispatched"
  | "sent"
  | "delivered"
  | "failed"
  | "unknown";

const RANK: Record<DeliveryStatus, number> = {
  pending: 0,
  unknown: 1,
  dispatched: 2,
  sent: 3,
  delivered: 4,
  failed: 4,
};

const VALID = new Set<string>(Object.keys(RANK));

export function statusForWebhookEvent(
  event: string,
  payloadStatus?: unknown,
): DeliveryStatus | null {
  switch (event) {
    case "MESSAGE_SENT":
      return "sent";
    case "MESSAGE_DELIVERED":
      return "delivered";
    case "MESSAGE_FAILED":
      return "failed";
    case "UNKNOWN_STATE":
      return "unknown";
    case "SMS_STATUS_UPDATED": {
      const s = typeof payloadStatus === "string" ? payloadStatus.toLowerCase() : "";
      return VALID.has(s) ? (s as DeliveryStatus) : null;
    }
    default:
      return null;
  }
}

/**
 * Webhooks can arrive out of order or be retried, so a status only moves
 * forward. `delivered` and `failed` are final.
 */
export function shouldApplyDeliveryStatus(
  current: DeliveryStatus | null,
  next: DeliveryStatus,
): boolean {
  if (!current) return true;
  if (current === "delivered" || current === "failed") return false;
  return RANK[next] > RANK[current];
}
