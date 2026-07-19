import { NextResponse } from 'next/server';
import { searchSuggestionRequestSchema, searchSuggestions } from '@/features/search';
import type { SearchSuggestionsResponse } from '@/features/search';

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
    const suggestions = await searchSuggestions({
      query: parsedRequest.data.query,
      ...(parsedRequest.data.category ? { category: parsedRequest.data.category } : {}),
    });
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] }, { status: 503 });
  }
}
