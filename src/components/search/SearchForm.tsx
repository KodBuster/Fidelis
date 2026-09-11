"use client";

import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  flattenAutocompleteSuggestions,
  type SearchAutocompleteResult,
  type SearchAutocompleteSuggestion,
} from "@/lib/search-types";
import { SearchAutocompleteList } from "./SearchAutocompleteList";

const AUTOCOMPLETE_DEBOUNCE_MS = 300;
const MIN_AUTOCOMPLETE_LENGTH = 2;

type SearchFormProps = {
  autoFocus?: boolean;
  defaultQuery?: string;
  onSubmit?: () => void;
  className?: string;
  inputClassName?: string;
  compact?: boolean;
  enableAutocomplete?: boolean;
};

async function fetchAutocomplete(
  query: string,
  signal: AbortSignal,
): Promise<SearchAutocompleteResult> {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`/api/search/autocomplete?${params.toString()}`, {
    signal,
  });
  const data = (await response.json()) as SearchAutocompleteResult & {
    error?: string;
  };

  if (!response.ok) {
    return { products: [], categories: [] };
  }

  return {
    products: data.products ?? [],
    categories: data.categories ?? [],
  };
}

function searchHref(query: string) {
  return `/search?q=${encodeURIComponent(query.trim())}`;
}

/**
 * Search form with autocomplete (Sharoduvy-style):
 * real <form onSubmit>, enterKeyHint=search, no onBlur setState race,
 * suggestions use onMouseDown preventDefault.
 */
export function SearchForm({
  autoFocus = false,
  defaultQuery = "",
  onSubmit,
  className = "",
  inputClassName = "",
  compact = false,
  enableAutocomplete = true,
}: SearchFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [suggestQuery, setSuggestQuery] = useState(defaultQuery);
  const [suggestions, setSuggestions] = useState<SearchAutocompleteResult | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setSuggestQuery(defaultQuery);
    if (inputRef.current) {
      inputRef.current.value = defaultQuery;
    }
  }, [defaultQuery]);

  useEffect(() => {
    if (!enableAutocomplete) return;

    const trimmed = suggestQuery.trim();
    if (trimmed.length < MIN_AUTOCOMPLETE_LENGTH) {
      setSuggestions(null);
      setLoading(false);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setLoading(true);
      setOpen(true);

      fetchAutocomplete(trimmed, controller.signal)
        .then((result) => {
          setSuggestions(result);
          setActiveIndex(-1);
        })
        .catch((error: unknown) => {
          if (error instanceof Error && error.name === "AbortError") return;
          setSuggestions({ products: [], categories: [] });
        })
        .finally(() => {
          setLoading(false);
        });
    }, AUTOCOMPLETE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [suggestQuery, enableAutocomplete]);

  const readQuery = () => inputRef.current?.value ?? suggestQuery;

  const leaveTo = (href: string) => {
    onSubmit?.();
    setOpen(false);
    window.location.assign(href);
  };

  const flatSuggestions = suggestions
    ? flattenAutocompleteSuggestions(suggestions)
    : [];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (activeIndex >= 0 && flatSuggestions[activeIndex]) {
      leaveTo(flatSuggestions[activeIndex].href);
      return;
    }
    const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    if (!q) {
      inputRef.current?.focus();
      return;
    }
    leaveTo(searchHref(q));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!enableAutocomplete || !open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        index < flatSuggestions.length - 1 ? index + 1 : index,
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index > 0 ? index - 1 : -1));
    }
  };

  return (
    <form
      action="/search"
      method="get"
      onSubmit={handleSubmit}
      className={`relative ${className}`}
      role="search"
    >
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="search"
          name="q"
          defaultValue={defaultQuery}
          onInput={(event) => setSuggestQuery(event.currentTarget.value)}
          onFocus={() => {
            if (
              enableAutocomplete &&
              readQuery().trim().length >= MIN_AUTOCOMPLETE_LENGTH
            ) {
              setOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          enterKeyHint="search"
          autoComplete="off"
          aria-autocomplete={enableAutocomplete ? "list" : undefined}
          aria-controls={open ? listId : undefined}
          aria-expanded={enableAutocomplete ? open : undefined}
          placeholder="Кольцо, серьги, артикул…"
          className={`min-w-0 flex-1 rounded-lg border border-brand-olive/20 bg-white px-4 text-base text-brand-text placeholder:text-brand-muted focus:border-brand-olive focus:outline-none focus:ring-2 focus:ring-brand-olive/20 ${
            compact ? "py-2" : "py-2.5"
          } ${inputClassName}`}
        />
        <button
          type="submit"
          onMouseDown={(event) => event.preventDefault()}
          className={`shrink-0 touch-manipulation rounded-lg bg-brand-terracotta px-4 font-medium text-white transition-colors hover:bg-brand-terracotta-logo [-webkit-tap-highlight-color:transparent] ${
            compact ? "py-2 text-sm" : "py-2.5 text-base"
          }`}
        >
          Найти
        </button>
      </div>

      {enableAutocomplete ? (
        <SearchAutocompleteList
          query={suggestQuery.trim()}
          result={suggestions}
          loading={loading}
          open={open}
          activeIndex={activeIndex}
          listId={listId}
          onSelect={(suggestion: SearchAutocompleteSuggestion) =>
            leaveTo(suggestion.href)
          }
          onShowAll={() => {
            const q = readQuery().trim();
            if (q) leaveTo(searchHref(q));
          }}
        />
      ) : null}
    </form>
  );
}
