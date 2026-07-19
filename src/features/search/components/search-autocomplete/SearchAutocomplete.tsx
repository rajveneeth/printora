'use client';

import type { FormEvent, KeyboardEvent, ReactNode } from 'react';
import { useEffect, useId, useMemo, useState } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { Clock3, FolderSearch2, Search, Store, TrendingUp } from 'lucide-react';
import { searchSuggestionsResponseSchema } from '@/features/search/schemas';
import {
  clearRecentSearches,
  readRecentSearches,
  recentSearchToSuggestion,
  saveRecentSearch,
} from '@/features/search/services';
import type {
  SearchAutocompleteProps,
  SearchSuggestion,
  SearchSuggestionKind,
} from '@/features/search/models';
import styles from './SearchAutocomplete.module.scss';

const DEBOUNCE_MILLISECONDS = 250;

const suggestionIcons: Readonly<Record<SearchSuggestionKind, ReactNode>> = {
  product: <Search size={16} aria-hidden="true" />,
  category: <FolderSearch2 size={16} aria-hidden="true" />,
  seller: <Store size={16} aria-hidden="true" />,
  popular: <TrendingUp size={16} aria-hidden="true" />,
  recent: <Clock3 size={16} aria-hidden="true" />,
};

type SuggestionStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error';

const panelStateMessage = (status: SuggestionStatus): string => {
  if (status === 'loading') return 'Finding useful matches…';
  if (status === 'error') return 'Suggestions are unavailable. Press Enter to search.';
  return 'No suggestions yet. Press Enter to search for this phrase.';
};

const HighlightMatch = ({ label, query }: { readonly label: string; readonly query: string }) => {
  const matchIndex = label.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
  if (matchIndex < 0 || !query) return label;
  const matchEnd = matchIndex + query.length;
  return (
    <>
      {label.slice(0, matchIndex)}
      <mark>{label.slice(matchIndex, matchEnd)}</mark>
      {label.slice(matchEnd)}
    </>
  );
};

const buildSearchHref = (query: string, category?: string): string => {
  const parameters = new URLSearchParams();
  if (query) parameters.set('q', query);
  if (category) parameters.set('category', category);
  const search = parameters.toString();
  return search ? `/search?${search}` : '/search';
};

export function SearchAutocomplete({
  id,
  initialQuery = '',
  category,
  placeholder = 'What would you like to create?',
  compact = false,
  onNavigate,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const generatedId = useId();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<readonly SearchSuggestion[]>([]);
  const [recentSuggestions, setRecentSuggestions] = useState<readonly SearchSuggestion[]>([]);
  const [status, setStatus] = useState<SuggestionStatus>('idle');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const trimmedQuery = query.trim();
  const isRecentMode = trimmedQuery.length < 2;
  const visibleSuggestions = isRecentMode ? recentSuggestions : suggestions;
  const listboxId = `${id}-${generatedId.replaceAll(':', '')}-suggestions`;
  const activeSuggestion = visibleSuggestions[activeIndex];

  const statusMessage = useMemo(() => {
    if (status === 'loading') return 'Finding search suggestions.';
    if (status === 'error') return 'Search suggestions are temporarily unavailable.';
    if (status === 'empty') return 'No search suggestions found.';
    if (status === 'ready')
      return `${suggestions.length} search ${suggestions.length === 1 ? 'suggestion' : 'suggestions'} available.`;
    return '';
  }, [status, suggestions.length]);

  useEffect(() => {
    if (trimmedQuery.length < 2) return;
    const abortController = new AbortController();
    const requestTimer = window.setTimeout(async () => {
      setStatus('loading');
      const parameters = new URLSearchParams({ q: trimmedQuery });
      if (category) parameters.set('category', category);
      try {
        const response = await fetch(`/api/search/suggestions?${parameters.toString()}`, {
          signal: abortController.signal,
        });
        if (!response.ok) throw new Error('Suggestion request failed');
        const responseBody: unknown = await response.json();
        const parsedResponse = searchSuggestionsResponseSchema.safeParse(responseBody);
        if (!parsedResponse.success) throw new Error('Suggestion response was invalid');
        setSuggestions(parsedResponse.data.suggestions);
        setStatus(parsedResponse.data.suggestions.length ? 'ready' : 'empty');
        setActiveIndex(-1);
        setIsOpen(true);
      } catch {
        if (abortController.signal.aborted) return;
        setSuggestions([]);
        setStatus('error');
        setActiveIndex(-1);
        setIsOpen(true);
      }
    }, DEBOUNCE_MILLISECONDS);
    return () => {
      window.clearTimeout(requestTimer);
      abortController.abort();
    };
  }, [category, trimmedQuery]);

  const refreshRecentSuggestions = () => {
    setRecentSuggestions(readRecentSearches(window.localStorage).map(recentSearchToSuggestion));
  };

  const rememberSearch = (searchQuery: string) => {
    const recentSearches = saveRecentSearch(window.localStorage, {
      query: searchQuery,
      ...(category ? { category } : {}),
    });
    setRecentSuggestions(recentSearches.map(recentSearchToSuggestion));
  };

  const navigateToSuggestion = (suggestion: SearchSuggestion) => {
    if (trimmedQuery) rememberSearch(trimmedQuery);
    setIsOpen(false);
    onNavigate?.();
    router.push(suggestion.href as Route);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (trimmedQuery) rememberSearch(trimmedQuery);
    setIsOpen(false);
    onNavigate?.();
    router.push(buildSearchHref(trimmedQuery, category) as Route);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!visibleSuggestions.length) return;
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((currentIndex) => {
        if (event.key === 'ArrowDown') return (currentIndex + 1) % visibleSuggestions.length;
        return currentIndex <= 0 ? visibleSuggestions.length - 1 : currentIndex - 1;
      });
      return;
    }
    if (event.key === 'Enter' && isOpen && activeSuggestion) {
      event.preventDefault();
      navigateToSuggestion(activeSuggestion);
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setActiveIndex(-1);
    setIsOpen(true);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setStatus('idle');
    }
  };

  const handleClearRecentSearches = () => {
    clearRecentSearches(window.localStorage);
    setRecentSuggestions([]);
    setIsOpen(false);
  };

  return (
    <form
      className={styles.root}
      data-compact={compact}
      role="search"
      action="/search"
      method="get"
      onSubmit={handleSubmit}
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setIsOpen(false);
          setActiveIndex(-1);
        }
      }}
    >
      <div className={styles.inputShell}>
        <Search size={compact ? 17 : 20} aria-hidden="true" />
        <label className="sr-only" htmlFor={id}>
          Search products, categories, or makers
        </label>
        <input
          id={id}
          name="q"
          type="search"
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={isOpen && visibleSuggestions.length > 0}
          aria-activedescendant={
            activeSuggestion ? `${listboxId}-${activeSuggestion.id}` : undefined
          }
          onChange={(event) => handleQueryChange(event.target.value)}
          onFocus={() => {
            refreshRecentSuggestions();
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
        {category ? <input type="hidden" name="category" value={category} /> : null}
        <button type="submit" aria-label="Search marketplace">
          <Search size={17} aria-hidden="true" />
          <span>Search</span>
        </button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {statusMessage}
      </span>
      {isOpen && (visibleSuggestions.length > 0 || (!isRecentMode && status !== 'idle')) ? (
        <div className={styles.panel}>
          <div className={styles.panelHeading}>
            <span>{isRecentMode ? 'Recent searches' : 'Suggestions'}</span>
            {isRecentMode && visibleSuggestions.length ? (
              <button type="button" onClick={handleClearRecentSearches}>
                Clear
              </button>
            ) : null}
          </div>
          {visibleSuggestions.length ? (
            <div id={listboxId} role="listbox" aria-label="Search suggestions">
              {visibleSuggestions.map((suggestion, index) => (
                <button
                  className={styles.option}
                  id={`${listboxId}-${suggestion.id}`}
                  key={suggestion.id}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => navigateToSuggestion(suggestion)}
                >
                  <span className={styles.optionIcon}>{suggestionIcons[suggestion.kind]}</span>
                  <span>
                    <b>
                      <HighlightMatch label={suggestion.label} query={trimmedQuery} />
                    </b>
                    <small>{suggestion.description}</small>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className={styles.panelState}>{panelStateMessage(status)}</p>
          )}
        </div>
      ) : null}
    </form>
  );
}
