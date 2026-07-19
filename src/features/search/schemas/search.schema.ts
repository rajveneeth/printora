import { z } from 'zod';

export const searchSuggestionRequestSchema = z.object({
  query: z.string().trim().min(2).max(80),
  category: z.string().trim().min(1).max(80).optional(),
});

export const searchSuggestionSchema = z.object({
  id: z.string(),
  kind: z.enum(['product', 'category', 'seller', 'popular', 'recent']),
  label: z.string(),
  description: z.string(),
  href: z.string(),
});

export const searchSuggestionsResponseSchema = z.object({
  suggestions: z.array(searchSuggestionSchema).max(5),
});
