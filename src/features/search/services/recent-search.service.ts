import type { RecentSearch, SearchSuggestion } from '@/features/search/models';

const RECENT_SEARCHES_KEY = 'formivo-recent-searches';
const MAXIMUM_RECENT_SEARCHES = 5;

interface SearchStorage {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

const isRecentSearch = (value: unknown): value is RecentSearch => {
  if (!value || typeof value !== 'object' || !('query' in value)) return false;
  const query = Reflect.get(value, 'query');
  const category = Reflect.get(value, 'category');
  return (
    typeof query === 'string' &&
    query.trim().length > 0 &&
    (category === undefined || typeof category === 'string')
  );
};

export const readRecentSearches = (storage: SearchStorage): readonly RecentSearch[] => {
  try {
    const storedValue = storage.getItem(RECENT_SEARCHES_KEY);
    if (!storedValue) return [];
    const parsed: unknown = JSON.parse(storedValue);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecentSearch).slice(0, MAXIMUM_RECENT_SEARCHES);
  } catch {
    return [];
  }
};

export const saveRecentSearch = (
  storage: SearchStorage,
  recentSearch: RecentSearch,
): readonly RecentSearch[] => {
  const query = recentSearch.query.trim();
  if (!query) return readRecentSearches(storage);
  const normalisedSearch: RecentSearch = {
    query,
    ...(recentSearch.category ? { category: recentSearch.category } : {}),
  };
  const updatedSearches = [
    normalisedSearch,
    ...readRecentSearches(storage).filter(
      (entry) =>
        entry.query.toLocaleLowerCase() !== query.toLocaleLowerCase() ||
        entry.category !== normalisedSearch.category,
    ),
  ].slice(0, MAXIMUM_RECENT_SEARCHES);
  storage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
  return updatedSearches;
};

export const clearRecentSearches = (storage: SearchStorage): void => {
  storage.removeItem(RECENT_SEARCHES_KEY);
};

export const recentSearchToSuggestion = (recentSearch: RecentSearch): SearchSuggestion => {
  const search = new URLSearchParams({ q: recentSearch.query });
  if (recentSearch.category) search.set('category', recentSearch.category);
  return {
    id: `recent-${recentSearch.category ?? 'all'}-${recentSearch.query.toLocaleLowerCase()}`,
    kind: 'recent',
    label: recentSearch.query,
    description: recentSearch.category
      ? 'Recent search in a category'
      : 'Recent marketplace search',
    href: `/search?${search.toString()}`,
  };
};
