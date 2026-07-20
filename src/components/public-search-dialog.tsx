"use client";

import { ArrowUpRight, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useTransition } from "react";
import type { FormEvent } from "react";
import { PrefetchLink } from "@/components/prefetch-link";
import type {
  PublicSearchResult,
  PublicSearchResultType,
} from "@/lib/public-search";

type PublicSearchDialogProps = {
  searchPath: string;
  homePath: string;
  query: string;
  results: PublicSearchResult[];
  failed: boolean;
  labels: {
    title: string;
    inputLabel: string;
    placeholder: string;
    submit: string;
    close: string;
    loading: string;
    initialText: string;
    emptyText: string;
    errorText: string;
    resultCount: string;
    types: Record<PublicSearchResultType, string>;
  };
};

export function PublicSearchDialog({
  searchPath,
  homePath,
  query,
  results,
  failed,
  labels,
}: PublicSearchDialogProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const { emptyText, errorText } = labels;

  const closeDialog = useCallback(() => {
    router.push(homePath);
  }, [homePath, router]);

  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDialog();
      if (event.key === "Tab") {
        const focusable = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ) ?? [],
        ).filter((element) => element.offsetParent !== null);
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeDialog]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextQuery = String(formData.get("q") ?? "").trim();
    const nextUrl = nextQuery
      ? `${searchPath}?${new URLSearchParams({ q: nextQuery }).toString()}`
      : searchPath;
    startTransition(() => router.push(nextUrl));
  }

  const statusText = failed
    ? errorText
    : isPending
      ? labels.loading
      : query
        ? results.length
          ? labels.resultCount.replace("{count}", String(results.length))
          : emptyText
        : labels.initialText;

  return (
    <div className="public-search-overlay" role="presentation">
      <section
        ref={dialogRef}
        className="public-search-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="public-search-title"
      >
        <header className="public-search-header">
          <h1 id="public-search-title">{labels.title}</h1>
          <button
            type="button"
            className="public-search-close cursor-target"
            aria-label={labels.close}
            title={labels.close}
            onClick={closeDialog}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <form
          className="public-search-form"
          action={searchPath}
          method="get"
          role="search"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="public-search-input">
            {labels.inputLabel}
          </label>
          <Search size={20} aria-hidden="true" />
          <input
            ref={inputRef}
            id="public-search-input"
            name="q"
            type="search"
            defaultValue={query}
            placeholder={labels.placeholder}
            maxLength={80}
            autoComplete="off"
          />
          <button type="submit" className="public-search-submit cursor-target">
            <Search size={17} aria-hidden="true" />
            <span>{labels.submit}</span>
          </button>
        </form>

        <p className="public-search-status" aria-live="polite">
          {statusText}
        </p>

        {!failed && results.length ? (
          <div className="public-search-results">
            {results.map((result) => (
              <PrefetchLink
                key={result.id}
                href={result.href}
                className="public-search-result cursor-target"
              >
                <span className="public-search-result-type">
                  {labels.types[result.type]}
                </span>
                <span className="public-search-result-copy">
                  <strong>{result.title}</strong>
                  <small>{result.excerpt}</small>
                </span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </PrefetchLink>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
