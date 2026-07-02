export type StarRating = 1 | 2 | 3 | 4 | 5;

export type GoogleLocation = {
  id: string;
  accountId: string;
  displayName: string;
  address: string;
  placeId: string | null;
  reviewCount: number;
  averageRating: number;
};

export type GoogleReview = {
  id: string;
  reviewerName: string;
  reviewerPhotoUrl: string | null;
  starRating: StarRating;
  comment: string;
  createdAt: string;
  ownerReply: string | null;
  ownerReplyUpdatedAt: string | null;
};

export type ReviewsPayload = {
  reviews: GoogleReview[];
  totalCount: number;
  averageRating: number;
  repliedCount: number;
  nextPageToken: string | null;
};

export type LocationsPayload = {
  locations: GoogleLocation[];
  connectionEmail: string;
};

export type StatusPayload = {
  connected: boolean;
  email: string | null;
  isMock: boolean;
};
