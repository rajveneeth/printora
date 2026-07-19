import { z } from 'zod';

const rating = z.coerce.number().int().min(1).max(5);

export const ratingSubmissionSchema = z.object({
  orderItemId: z.string().trim().min(1),
  qualityRating: rating,
  finishRating: rating,
  accuracyRating: rating,
  valueRating: rating,
  communicationRating: rating,
  dispatchSpeedRating: rating,
  customisationRating: rating,
  title: z.string().trim().min(4, 'Add a short review title.').max(100),
  body: z.string().trim().min(20, 'Share at least 20 characters of helpful detail.').max(1000),
});
