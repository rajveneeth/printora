import { NextResponse } from 'next/server';
import { searchSuggestionRequestSchema, searchSuggestions } from '@/features/search';
import type { SearchSuggestionsResponse } from '@/features/search';
import { enforceRateLimit, RateLimitExceededError } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse<SearchSuggestionsResponse>> {
  const requestUrl = new URL(request.url);
  const query = requestUrl.searchParams.get('q') ?? '';
  const category = requestUrl.searchParams.get('category') ?? undefined;
  const parsedRequest = searchSuggestionRequestSchema.safeParse({
    query,
    ...(category ? { category } : {}),
  });

  if (!parsedRequest.success) {
    return NextResponse.json({ suggestions: [] }, { status: 400 });
  }

  try {
    const clientAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    await enforceRateLimit(clientAddress, {
      scope: 'search-suggestions:ip',
      limit: 120,
      windowInMilliseconds: 60_000,
    });
    const suggestions = await searchSuggestions({
      query: parsedRequest.data.query,
      ...(parsedRequest.data.category ? { category: parsedRequest.data.category } : {}),
    });
    return NextResponse.json(
      { suggestions },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return NextResponse.json(
        { suggestions: [] },
        {
          status: 429,
          headers: {
            'Cache-Control': 'private, no-store',
            'Retry-After': String(error.retryAfterInSeconds),
          },
        },
      );
    }
    return NextResponse.json({ suggestions: [] }, { status: 503 });
  }
}
