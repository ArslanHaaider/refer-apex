/**
 * Google Business Profile API client.
 *
 * Endpoints used:
 *   List accounts:   GET https://mybusinessaccountmanagement.googleapis.com/v1/accounts
 *   List locations:  GET https://mybusinessbusinessinformation.googleapis.com/v1/{account}/locations
 *   List reviews:    GET https://mybusiness.googleapis.com/v4/{account}/locations/{location}/reviews
 *
 * OAuth scopes required: https://www.googleapis.com/auth/business.manage
 *
 * To enable real API:
 *   1. Apply for Google Business Profile API access at https://developers.google.com/my-business/content/prereqs
 *   2. Create OAuth 2.0 credentials in Google Cloud Console
 *   3. Set env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
 *   4. Set GOOGLE_MOCK=false in your .env.local
 */

import type { GoogleLocation, GoogleReview, StarRating } from "./types";

const ACCOUNTS_API = "https://mybusinessaccountmanagement.googleapis.com/v1";
const LOCATIONS_API = "https://mybusinessbusinessinformation.googleapis.com/v1";
const REVIEWS_API = "https://mybusiness.googleapis.com/v4";

const TOKEN_URL = "https://oauth2.googleapis.com/token";

export const OAUTH_SCOPES = ["https://www.googleapis.com/auth/business.manage"];

export function buildOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: process.env.GOOGLE_REDIRECT_URI ?? "",
    response_type: "code",
    scope: OAUTH_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: process.env.GOOGLE_REDIRECT_URI ?? "",
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error("Token refresh failed");
  }

  const data = await res.json();
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

export async function fetchAccounts(accessToken: string): Promise<
  Array<{ name: string; accountName: string }>
> {
  const res = await fetch(`${ACCOUNTS_API}/accounts`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Accounts fetch failed: ${res.status}`);

  const data = await res.json();
  return data.accounts ?? [];
}

export async function fetchLocations(
  accessToken: string,
  accountName: string,
): Promise<GoogleLocation[]> {
  const res = await fetch(
    `${LOCATIONS_API}/${accountName}/locations?readMask=name,title,storefrontAddress,metadata`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!res.ok) throw new Error(`Locations fetch failed: ${res.status}`);

  const data = await res.json();

  return (data.locations ?? []).map(
    (loc: {
      name: string;
      title: string;
      storefrontAddress?: { addressLines?: string[]; locality?: string; administrativeArea?: string };
      metadata?: { placeId?: string };
    }) => ({
      id: loc.name,
      accountId: accountName,
      displayName: loc.title,
      address: [
        ...(loc.storefrontAddress?.addressLines ?? []),
        loc.storefrontAddress?.locality,
        loc.storefrontAddress?.administrativeArea,
      ]
        .filter(Boolean)
        .join(", "),
      placeId: loc.metadata?.placeId ?? null,
      reviewCount: 0,
      averageRating: 0,
    }),
  );
}

const STAR_MAP: Record<string, StarRating> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

export async function fetchReviews(
  accessToken: string,
  locationName: string,
  pageToken?: string,
): Promise<{
  reviews: GoogleReview[];
  averageRating: number;
  totalCount: number;
  nextPageToken: string | null;
}> {
  const params = new URLSearchParams({ pageSize: "50" });
  if (pageToken) params.set("pageToken", pageToken);

  const res = await fetch(
    `${REVIEWS_API}/${locationName}/reviews?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!res.ok) throw new Error(`Reviews fetch failed: ${res.status}`);

  const data = await res.json();

  const reviews: GoogleReview[] = (data.reviews ?? []).map(
    (r: {
      name: string;
      reviewer?: { displayName?: string; profilePhotoUrl?: string };
      starRating?: string;
      comment?: string;
      createTime?: string;
      reviewReply?: { comment?: string; updateTime?: string };
    }) => ({
      id: r.name,
      reviewerName: r.reviewer?.displayName ?? "Anonymous",
      reviewerPhotoUrl: r.reviewer?.profilePhotoUrl ?? null,
      starRating: STAR_MAP[r.starRating ?? "FIVE"] ?? 5,
      comment: r.comment ?? "",
      createdAt: r.createTime ?? new Date().toISOString(),
      ownerReply: r.reviewReply?.comment ?? null,
      ownerReplyUpdatedAt: r.reviewReply?.updateTime ?? null,
    }),
  );

  return {
    reviews,
    averageRating: data.averageRating ?? 0,
    totalCount: data.totalReviewCount ?? reviews.length,
    nextPageToken: data.nextPageToken ?? null,
  };
}

export async function replyToReview(
  accessToken: string,
  reviewName: string,
  comment: string,
): Promise<void> {
  const res = await fetch(`${REVIEWS_API}/${reviewName}/reply`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comment }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Reply failed: ${res.status} ${err}`);
  }
}

const REVOKE_URL = "https://oauth2.googleapis.com/revoke";

export async function revokeToken(token: string): Promise<void> {
  const res = await fetch(REVOKE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token revoke failed: ${res.status} ${err}`);
  }
}
