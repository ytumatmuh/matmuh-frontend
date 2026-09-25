"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";

import SearchResults, { SearchEmpty } from "@/app/components/Search/SearchResults";
import { useSiteSearch } from "@/app/components/Search/useSiteSearch";
import { useLocaleNav } from "@/i18n/useLocaleNav";
import { useT } from "@/i18n/useT";

const neverChanges = () => () => {};

export default function HeroSearch() {
  const t = useT();
  const [query, setQuery] = useState("");
  const [dismissed, setDismissed] = useState("");
  const boxRef = useRef(null);
  const panelRef = useRef(null);
  const listId = useId();

  const [rect, setRect] = useState(null);
  const mounted = useSyncExternalStore(neverChanges, () => true, () => false);

  const { term, groups, hasResults, status } = useSiteSearch(query);
  const open =
    (status === "ready" || status === "empty" || status === "error") &&
    dismissed !== term;
  const reducedMotion = useReducedMotion();
  const { href } = useLocaleNav();

  useEffect(() => {
    function onPointerDown(event) {
      const inside =
        boxRef.current?.contains(event.target) || panelRef.current?.contains(event.target);
      if (!inside) setDismissed(term);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [term]);

  useLayoutEffect(() => {
    if (!open) return undefined;

    const measure = () => {
      const node = boxRef.current;
      if (node) setRect(node.getBoundingClientRect());
    };

    measure();
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [open]);

  return (
    <div ref={boxRef} className="relative w-full">
      <form action={href("/duyurular")} className="relative w-full">
        <div
          className={`relative flex items-center bg-white/95 backdrop-blur-md shadow-lg border border-white/20 overflow-hidden transition-all duration-200 focus-within:shadow-xl w-full ${
            open ? "rounded-t-xl rounded-b-none" : "rounded-xl"
          }`}
        >
          <input
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setDismissed("")}
            onKeyDown={(event) => event.key === "Escape" && setDismissed(term)}
            placeholder={t("Duyuru, haber, ders veya personel ara...")}
            role="combobox"
            aria-label={t("Sitede ara")}
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listId}
            autoComplete="off"
            className="w-full py-3 px-6 text-base text-slate-700 placeholder-slate-400 outline-none bg-transparent font-medium"
          />
          <button
            type="submit"
            aria-label={t("Ara")}
            className="px-6 py-3 text-slate-400 hover:text-primary-500 transition-colors flex items-center justify-center"
          >
            <Search size={22} />
          </button>
        </div>
      </form>

      {open &&
        mounted &&
        rect &&
        createPortal(
          <motion.div
            ref={panelRef}
            style={{ left: rect.left, top: rect.bottom, width: rect.width, originY: 0 }}
            initial={{ opacity: 0, scaleY: 0.94 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-60 max-h-[70svh] overflow-y-auto overscroll-contain rounded-b-xl border border-t-0 border-white/20 bg-white shadow-popover"
          >
            {hasResults ? (
              <SearchResults
                id={listId}
                groups={groups}
                term={term}
                onNavigate={() => setDismissed(term)}
              />
            ) : (
              <div id={listId}>
                <SearchEmpty status={status} term={term} />
              </div>
            )}
          </motion.div>,
          document.body,
        )}
    </div>
  );
}
