export interface RatingSubmissionInput {
  readonly orderItemId: string;
  readonly qualityRating: number;
  readonly finishRating: number;
  readonly accuracyRating: number;
  readonly valueRating: number;
  readonly communicationRating: number;
  readonly dispatchSpeedRating: number;
  readonly customisationRating: number;
  readonly title: string;
  readonly body: string;
}

export interface ReviewEligibilityRecord {
  readonly orderItemId: string;
  readonly buyerId: string;
  readonly sellerUserId: string;
  readonly productId: string | null;
  readonly orderStatus: string;
  readonly fulfilmentStatus: string | null;
  readonly hasProductReview: boolean;
  readonly hasSellerReview: boolean;
}

export interface ReviewActionState {
  readonly status: 'idle' | 'success' | 'error';
  readonly message: string;
}
