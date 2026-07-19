import {
  clearRecentSearches,
  readRecentSearches,
  saveRecentSearch,
} from '@/features/search/services';

describe('recent search service', () => {
  beforeEach(() => window.localStorage.clear());

  it('stores the newest unique searches and keeps category context', () => {
    saveRecentSearch(window.localStorage, { query: 'phone stand' });
    saveRecentSearch(window.localStorage, {
      query: 'phone stand',
      category: 'phone-electronics-accessories',
    });
    saveRecentSearch(window.localStorage, { query: 'Phone Stand' });

    expect(readRecentSearches(window.localStorage)).toEqual([
      { query: 'Phone Stand' },
      { query: 'phone stand', category: 'phone-electronics-accessories' },
    ]);
  });

  it('recovers from invalid storage and clears saved searches', () => {
    window.localStorage.setItem('formivo-recent-searches', '{not valid json');
    expect(readRecentSearches(window.localStorage)).toEqual([]);

    saveRecentSearch(window.localStorage, { query: 'planter' });
    clearRecentSearches(window.localStorage);
    expect(readRecentSearches(window.localStorage)).toEqual([]);
  });
});
