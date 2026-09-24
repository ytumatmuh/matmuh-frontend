"use client";

import { useEffect, useState } from "react";
import { useCmsRoute } from "inscribed";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

export const MIN_CHARS = 3;

const HREF = {
  ANNOUNCEMENT: (hit) => `/duyurular/${hit.slug}`,
  NEWS: (hit) => `/haberler/${hit.slug}`,
  LECTURE: (hit) => `/egitim/mufredat/${hit.slug}`,
  ELECTIVE_GROUP: () => "/egitim/mufredat",
  STAFF: () => "/personel",
};

export const hrefForHit = (hit) => (HREF[hit.type] ?? (() => "/duyurular"))(hit);

export function useSiteSearch(query, { perGroup = 3 } = {}) {
  const { locale } = useCmsRoute();
  const [result, setResult] = useState({ term: "", groups: [], failed: false });
  const term = query.trim();

  useEffect(() => {
    if (term.length < MIN_CHARS) return undefined;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API}/search?q=${encodeURIComponent(term)}&limit=${perGroup}&locale=${locale}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(String(res.status));
        const body = await res.json();
        setResult({ term, groups: body?.data?.groups ?? [], failed: false });
      } catch {
        if (controller.signal.aborted) return;
        setResult({ term, groups: [], failed: true });
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term, perGroup, locale]);

  const settled = result.term === term;
  const groups = settled ? result.groups.filter((g) => g.items?.length > 0) : [];
  const hasResults = groups.length > 0;

  const status =
    term.length < MIN_CHARS
      ? "idle"
      : !settled
        ? "loading"
        : result.failed
          ? "error"
          : hasResults
            ? "ready"
            : "empty";

  return { term, groups, hasResults, status };
}
