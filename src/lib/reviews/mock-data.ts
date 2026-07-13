import type { GoogleLocation, GoogleReview, LocationsPayload, ReviewsPayload } from "./types";

export const MOCK_EMAIL = "owner@mybusiness.com";

export const MOCK_LOCATIONS: GoogleLocation[] = [
  {
    id: "accounts/112345678/locations/456789001",
    accountId: "accounts/112345678",
    displayName: "The Golden Fork Restaurant",
    address: "142 W 49th St, New York, NY 10019",
    placeId: "ChIJd_Y0eVIvwokRY7SWr4kTX6c",
    reviewCount: 248,
    averageRating: 4.7,
  },
  {
    id: "accounts/112345678/locations/456789002",
    accountId: "accounts/112345678",
    displayName: "Luxe Hair Studio",
    address: "88 Atlantic Ave, Brooklyn, NY 11201",
    placeId: "ChIJLU7jZCVawokRy0n9jJDHK0s",
    reviewCount: 91,
    averageRating: 4.4,
  },
];

const GOLDEN_FORK_REVIEWS: GoogleReview[] = [
  {
    id: "review_gf_001",
    reviewerName: "James Hartwell",
    reviewerPhotoUrl: null,
    starRating: 5,
    comment:
      "Absolutely incredible dining experience. The handmade pasta was cooked to absolute perfection and the duck confit melted in my mouth. The staff went above and beyond to make our anniversary dinner truly special. We will absolutely be back.",
    createdAt: "2026-06-18T19:30:00Z",
    ownerReply:
      "Thank you so much for your wonderful review, James! It was our absolute pleasure celebrating your anniversary with you. We look forward to welcoming you back soon!",
    ownerReplyUpdatedAt: "2026-06-19T09:00:00Z",
  },
  {
    id: "review_gf_002",
    reviewerName: "Maria Chen",
    reviewerPhotoUrl: null,
    starRating: 5,
    comment:
      "Best Italian food in NYC, period. I have tried dozens of restaurants and nothing comes close to the freshness and authenticity here. The tiramisu is to die for. Book your table in advance, it fills up fast.",
    createdAt: "2026-06-15T20:15:00Z",
    ownerReply:
      "Maria, thank you! We are so happy our tiramisu hit the spot. Grazie mille for the kind words — see you next time!",
    ownerReplyUpdatedAt: "2026-06-16T10:30:00Z",
  },
  {
    id: "review_gf_003",
    reviewerName: "Derek Osei",
    reviewerPhotoUrl: null,
    starRating: 5,
    comment:
      "Celebrated my 30th birthday here last weekend and it was magical. The staff surprised me with a complimentary dessert and everyone sang happy birthday. Food was phenomenal — the risotto is a must-order.",
    createdAt: "2026-06-10T21:00:00Z",
    ownerReply:
      "Happy belated birthday, Derek! We love making birthdays extra special. Come back and celebrate with us anytime!",
    ownerReplyUpdatedAt: "2026-06-11T08:45:00Z",
  },
  {
    id: "review_gf_004",
    reviewerName: "Priya Nair",
    reviewerPhotoUrl: null,
    starRating: 4,
    comment:
      "Great atmosphere and the food was genuinely delicious. The truffle pizza is a standout. Only giving 4 stars because the wait at the bar was a little long before we were seated, but overall a lovely evening.",
    createdAt: "2026-06-07T19:45:00Z",
    ownerReply:
      "Thanks Priya! We appreciate the honest feedback about the wait — we're working on our reservation flow. So glad you loved the truffle pizza!",
    ownerReplyUpdatedAt: "2026-06-08T11:00:00Z",
  },
  {
    id: "review_gf_005",
    reviewerName: "Thomas Bergmann",
    reviewerPhotoUrl: null,
    starRating: 3,
    comment:
      "Food was decent but nothing that blew me away. The pasta was a little overcooked and the portions felt small for the price. Service was friendly though. Might try again but would not rush back.",
    createdAt: "2026-06-03T18:30:00Z",
    ownerReply: null,
    ownerReplyUpdatedAt: null,
  },
  {
    id: "review_gf_006",
    reviewerName: "Amara Johnson",
    reviewerPhotoUrl: null,
    starRating: 5,
    comment:
      "This place has become my regular spot for client dinners. The ambiance is sophisticated without being stuffy, the wine list is thoughtfully curated, and the food is consistently excellent. My clients are always impressed.",
    createdAt: "2026-05-28T20:00:00Z",
    ownerReply:
      "Amara, we are so honored to be your go-to for client dinners! We always strive for consistency. Thank you for your continued trust in us.",
    ownerReplyUpdatedAt: "2026-05-29T09:15:00Z",
  },
  {
    id: "review_gf_007",
    reviewerName: "Kevin Tran",
    reviewerPhotoUrl: null,
    starRating: 5,
    comment:
      "Walked in without a reservation on a Saturday and they still managed to seat us within 20 minutes. The hostess was incredibly warm and accommodating. The burrata appetizer and the lamb chops were absolutely stunning.",
    createdAt: "2026-05-22T19:20:00Z",
    ownerReply:
      "Kevin, we are so glad we could accommodate you! Saturdays get busy but we always try our best. Enjoy your next visit!",
    ownerReplyUpdatedAt: "2026-05-23T10:00:00Z",
  },
  {
    id: "review_gf_008",
    reviewerName: "Rachel Foster",
    reviewerPhotoUrl: null,
    starRating: 2,
    comment:
      "Disappointed with our visit. We had a reservation at 7:30 and were not seated until nearly 8:15. The waiter seemed distracted and forgot one of our orders entirely. The food itself was fine but the experience let it all down.",
    createdAt: "2026-05-18T22:00:00Z",
    ownerReply:
      "Rachel, we sincerely apologize for the delays and the missed order — that is absolutely not the experience we aim to provide. Please reach out to us directly so we can make this right for you.",
    ownerReplyUpdatedAt: "2026-05-19T09:30:00Z",
  },
  {
    id: "review_gf_009",
    reviewerName: "Lena Hoffman",
    reviewerPhotoUrl: null,
    starRating: 5,
    comment:
      "Perfect date night restaurant. Dim lighting, intimate booths, incredible food and a sommelier who actually listened to our preferences instead of just pushing the most expensive bottle. Highly recommend the tasting menu.",
    createdAt: "2026-05-12T20:30:00Z",
    ownerReply:
      "Thank you Lena! Our sommelier will be thrilled to hear that. The tasting menu is truly a labor of love. See you again soon!",
    ownerReplyUpdatedAt: "2026-05-13T08:00:00Z",
  },
  {
    id: "review_gf_010",
    reviewerName: "Omar Khalil",
    reviewerPhotoUrl: null,
    starRating: 4,
    comment:
      "Really enjoyable meal. The fresh pasta they make in-house is clearly a labor of love and you can taste the difference. I took one star off only because the dessert menu felt limited compared to the rest. Would still recommend.",
    createdAt: "2026-05-05T19:00:00Z",
    ownerReply:
      "Omar, thank you! Great point on the dessert menu — we are actually expanding it this summer. Hope to see you back when it launches!",
    ownerReplyUpdatedAt: "2026-05-06T10:45:00Z",
  },
  {
    id: "review_gf_011",
    reviewerName: "Natalie Brooks",
    reviewerPhotoUrl: null,
    starRating: 5,
    comment:
      "The lunch prix fixe is an absolute steal. Three courses for a very reasonable price and the quality is the same as dinner. The caprese salad uses the most incredible fresh mozzarella I have ever tasted outside of Italy.",
    createdAt: "2026-04-28T13:30:00Z",
    ownerReply:
      "Natalie, we import that mozzarella from Campania weekly! So glad you noticed the difference. The prix fixe lunch is one of our best kept secrets.",
    ownerReplyUpdatedAt: "2026-04-29T09:00:00Z",
  },
  {
    id: "review_gf_012",
    reviewerName: "Carlos Rivera",
    reviewerPhotoUrl: null,
    starRating: 1,
    comment:
      "Had a very bad experience. Found a hair in my food and when I pointed it out the manager was dismissive about it. For the prices they charge I expected much better handling of the situation. Will not be returning.",
    createdAt: "2026-04-20T20:45:00Z",
    ownerReply:
      "Carlos, we are deeply sorry about this experience. This does not reflect our standards at all. Please contact us directly at management@goldenfork.com — we want to address this personally.",
    ownerReplyUpdatedAt: "2026-04-21T08:30:00Z",
  },
  {
    id: "review_gf_013",
    reviewerName: "Sofia Andersen",
    reviewerPhotoUrl: null,
    starRating: 5,
    comment:
      "Took my parents here for their 40th wedding anniversary and it was everything I hoped for. The kitchen even sent out a special amuse-bouche with a congratulations card. The level of care is extraordinary.",
    createdAt: "2026-04-12T19:15:00Z",
    ownerReply:
      "What a beautiful milestone to share with us, Sofia! Congratulations to your parents on 40 wonderful years. It was our honor to be part of the celebration.",
    ownerReplyUpdatedAt: "2026-04-13T09:45:00Z",
  },
  {
    id: "review_gf_014",
    reviewerName: "Marcus Webb",
    reviewerPhotoUrl: null,
    starRating: 4,
    comment:
      "Solid restaurant with genuine quality ingredients. The tagliata was cooked exactly to my requested medium-rare and the house wine is surprisingly good. Slightly loud on a Friday night but that kind of adds to the energy.",
    createdAt: "2026-04-04T21:00:00Z",
    ownerReply: null,
    ownerReplyUpdatedAt: null,
  },
  {
    id: "review_gf_015",
    reviewerName: "Hannah Choi",
    reviewerPhotoUrl: null,
    starRating: 5,
    comment:
      "I am a professional food critic and I do not say this lightly — this is one of the top five Italian restaurants in New York. The house-made tagliatelle with black truffle is worth every penny. Executive chef clearly has deep roots in Italian culinary tradition.",
    createdAt: "2026-03-25T20:00:00Z",
    ownerReply:
      "Hannah, coming from a professional this means the world to our entire team. Chef Marco will be honored. Thank you sincerely.",
    ownerReplyUpdatedAt: "2026-03-26T08:00:00Z",
  },
];

const LUXE_HAIR_REVIEWS: GoogleReview[] = [
  {
    id: "review_lh_001",
    reviewerName: "Destiny Williams",
    reviewerPhotoUrl: null,
    starRating: 5,
    comment:
      "Maria is an absolute wizard with color. I showed her a photo of the balayage I wanted and she matched it perfectly on the first try. The salon is clean, modern and everyone there makes you feel genuinely welcome.",
    createdAt: "2026-06-17T15:30:00Z",
    ownerReply:
      "Thank you Destiny! Maria absolutely loves what she does and it shows. We cannot wait to see you for your next appointment!",
    ownerReplyUpdatedAt: "2026-06-18T09:30:00Z",
  },
  {
    id: "review_lh_002",
    reviewerName: "Chloe Patterson",
    reviewerPhotoUrl: null,
    starRating: 5,
    comment:
      "Best haircut I have had in years. Alex took the time to understand my hair texture and lifestyle before even picking up the scissors. The result was transformative. Already booked my next appointment on the way out.",
    createdAt: "2026-06-13T11:00:00Z",
    ownerReply:
      "Chloe, this review made our day! Alex takes such pride in really understanding each client. See you at your next appointment!",
    ownerReplyUpdatedAt: "2026-06-14T10:00:00Z",
  },
  {
    id: "review_lh_003",
    reviewerName: "Imani Scott",
    reviewerPhotoUrl: null,
    starRating: 4,
    comment:
      "Great salon overall. The styling was excellent and the atmosphere is really lovely. The only minor thing is parking nearby is tough on weekends. The actual service is definitely worth it though.",
    createdAt: "2026-06-08T14:15:00Z",
    ownerReply:
      "Thanks Imani! Totally hear you on the parking — we actually have a parking guide on our website now with nearby garages. Hope it helps next time!",
    ownerReplyUpdatedAt: "2026-06-09T09:45:00Z",
  },
  {
    id: "review_lh_004",
    reviewerName: "Zoe Campbell",
    reviewerPhotoUrl: null,
    starRating: 5,
    comment:
      "Finally found my forever salon. I have been searching for two years for someone who understands curly hair and Jasmine here is incredible. She did a dry cut that has completely changed how my curls fall. This place understands textured hair.",
    createdAt: "2026-06-02T13:00:00Z",
    ownerReply:
      "Zoe, Jasmine specializes in curly hair and loves hearing feedback like this! Welcome to the Luxe family — we are so glad you found us.",
    ownerReplyUpdatedAt: "2026-06-03T08:30:00Z",
  },
  {
    id: "review_lh_005",
    reviewerName: "Fiona Gray",
    reviewerPhotoUrl: null,
    starRating: 3,
    comment:
      "Mixed experience. The blowout itself was fine but I had to wait 25 minutes past my appointment time which put me late for an event. I get that salons run behind but a heads up text would have been appreciated.",
    createdAt: "2026-05-27T16:00:00Z",
    ownerReply: null,
    ownerReplyUpdatedAt: null,
  },
  {
    id: "review_lh_006",
    reviewerName: "Amber Reid",
    reviewerPhotoUrl: null,
    starRating: 5,
    comment:
      "Got my highlights done here for the first time and I am blown away. The stylist mixed a custom color specifically for my skin tone — something no other salon has done. The result is the most natural looking highlights I have ever had.",
    createdAt: "2026-05-20T12:30:00Z",
    ownerReply:
      "Amber, custom color matching is our specialty! So thrilled you loved the result. Can't wait to maintain those beautiful highlights.",
    ownerReplyUpdatedAt: "2026-05-21T10:15:00Z",
  },
  {
    id: "review_lh_007",
    reviewerName: "Tanya Morris",
    reviewerPhotoUrl: null,
    starRating: 5,
    comment:
      "Genuinely the best keratin treatment I have had in my life. My hair was frizzy and unmanageable before and now it is smooth, shiny and effortless. Three months later and it is still going strong. Worth every single dollar.",
    createdAt: "2026-05-14T10:00:00Z",
    ownerReply:
      "Tanya, we are so thrilled! Our keratin treatment uses a premium Brazilian formula. Cannot wait to see you again in a few months!",
    ownerReplyUpdatedAt: "2026-05-15T09:00:00Z",
  },
  {
    id: "review_lh_008",
    reviewerName: "Nia Thompson",
    reviewerPhotoUrl: null,
    starRating: 3,
    comment:
      "The quality of work is good but the prices have gone up significantly since my last visit six months ago. For what I paid I expected a complimentary gloss or at least a proper scalp massage with the wash. Just felt a bit rushed.",
    createdAt: "2026-05-07T15:45:00Z",
    ownerReply: null,
    ownerReplyUpdatedAt: null,
  },
  {
    id: "review_lh_009",
    reviewerName: "Lisa Park",
    reviewerPhotoUrl: null,
    starRating: 5,
    comment:
      "I came in with a Pinterest board of ideas and honestly intimidated to ask for something dramatic. The stylist put me completely at ease, talked through everything, and gave me a result that is even better than my inspo photos. My confidence is through the roof.",
    createdAt: "2026-04-30T13:30:00Z",
    ownerReply:
      "Lisa, this is exactly what we love to hear! Helping clients step out of their comfort zone and feel amazing is why we do this. You looked incredible!",
    ownerReplyUpdatedAt: "2026-05-01T08:45:00Z",
  },
  {
    id: "review_lh_010",
    reviewerName: "Brianna Walker",
    reviewerPhotoUrl: null,
    starRating: 2,
    comment:
      "Disappointed. I booked specifically for a specific stylist and when I arrived they had switched me to someone else without telling me. The new stylist did not understand what I wanted and the result was not what I asked for. Had to get it fixed elsewhere.",
    createdAt: "2026-04-22T14:30:00Z",
    ownerReply:
      "Brianna, we sincerely apologize for not communicating the stylist change in advance — that is absolutely on us. Please reach out to us directly so we can make this right.",
    ownerReplyUpdatedAt: "2026-04-23T09:30:00Z",
  },
  {
    id: "review_lh_011",
    reviewerName: "Elise Fontaine",
    reviewerPhotoUrl: null,
    starRating: 4,
    comment:
      "Lovely experience overall. Great vibe in the salon, music is not too loud and the staff are warm without being over the top. My cut was exactly what I asked for. The only thing is the drinks offered are just water — would love a coffee option.",
    createdAt: "2026-04-15T11:00:00Z",
    ownerReply:
      "Elise, thank you! Great suggestion on the drinks — we are actually adding an espresso bar next month! Hope to see you to enjoy it.",
    ownerReplyUpdatedAt: "2026-04-16T10:00:00Z",
  },
  {
    id: "review_lh_012",
    reviewerName: "Monique Edwards",
    reviewerPhotoUrl: null,
    starRating: 5,
    comment:
      "I have been going to Luxe for two years now and they have never let me down. The team always remembers my preferences without me having to repeat myself. That level of personalized service is rare and it keeps me coming back every time.",
    createdAt: "2026-04-06T12:00:00Z",
    ownerReply:
      "Monique, two years of loyalty means so much to us! You are family here. We keep notes on all our regulars because you deserve a personalized experience every single visit.",
    ownerReplyUpdatedAt: "2026-04-07T09:00:00Z",
  },
];

export function getMockLocations(): LocationsPayload {
  return {
    locations: MOCK_LOCATIONS,
    connectionEmail: MOCK_EMAIL,
  };
}

function countReplied(reviews: GoogleReview[]): number {
  return reviews.filter((r) => r.ownerReply !== null).length;
}

export function getMockReviews(locationId: string): ReviewsPayload | null {
  if (locationId === MOCK_LOCATIONS[0].id) {
    return {
      reviews: GOLDEN_FORK_REVIEWS,
      totalCount: MOCK_LOCATIONS[0].reviewCount,
      averageRating: MOCK_LOCATIONS[0].averageRating,
      repliedCount: countReplied(GOLDEN_FORK_REVIEWS),
      nextPageToken: null,
    };
  }
  if (locationId === MOCK_LOCATIONS[1].id) {
    return {
      reviews: LUXE_HAIR_REVIEWS,
      totalCount: MOCK_LOCATIONS[1].reviewCount,
      averageRating: MOCK_LOCATIONS[1].averageRating,
      repliedCount: countReplied(LUXE_HAIR_REVIEWS),
      nextPageToken: null,
    };
  }
  return null;
}
