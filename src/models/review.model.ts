export type ReviewStatus = 'PENDING' | 'PUBLISHED' | 'HIDDEN' | 'REJECTED';

export interface ReviewModel {
  id: string;
  productId: string;
  authorId: string;
  orderItemId?: string;
  rating: number;
  qualityRating: number;
  finishRating: number;
  accuracyRating: number;
  valueRating: number;
  title: string;
  body: string;
  status: ReviewStatus;
}
