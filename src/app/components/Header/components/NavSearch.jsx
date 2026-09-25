"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

import { useT } from "@/i18n/useT";

import SearchResults, { SearchEmpty } from "@/app/components/Search/SearchResults";
import { useSiteSearch } from "@/app/components/Search/useSiteSearch";

export default function NavSearch({ open, onOpen, onClose }) {
  const t = useT();
  const [query, setQuery] = useState("");
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const listId = useId();

  const { term, groups, hasResults, status } = useSiteSearch(query);
  const showPanel = status === "ready" || status === "empty" || status === "error";

  useEffect(() => {
    if (!open) return undefined;

    inputRef.current?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    function onPointerDown(event) {
      if (boxRef.current && !boxRef.current.contains(event.target)) onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open, onClose]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setQuery("");
          onOpen();
        }}
        aria-label="Sitede ara"
        className="hidden lg:block pl-2 text-neutral-400 hover:text-white transition-colors"
      >
        <Search size={14} />
      </button>
    );
  }

  return (
    <div ref={boxRef} className="relative hidden lg:flex flex-1 items-center justify-end">
      <motion.div
        initial={{ opacity: 0, scaleX: 0.94 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: 1 }}
        className="flex w-full max-w-md items-center gap-2 rounded-lg border border-white/15 bg-white/8 px-3 transition-colors duration-200 focus-within:border-secondary-500/60 focus-within:bg-white/12"
      >
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ara..."
          role="combobox"
          aria-label="Sitede ara"
          aria-autocomplete="list"
          aria-expanded={showPanel}
          aria-controls={listId}
          autoComplete="off"
          className="w-full bg-transparent py-2 text-sm text-white outline-none! placeholder:text-neutral-500"
        />
      </motion.div>

      <button
        type="button"
        onClick={onClose}
        aria-label={t("Aramayı kapat")}
        className="pl-2 text-neutral-400 hover:text-white transition-colors"
      >
        <X size={14} />
      </button>

      {showPanel && (
        <div className="absolute right-0 top-full mt-2 w-[min(32rem,60vw)] max-h-[70svh] overflow-y-auto overscroll-contain rounded-xl border border-primary-500/10 bg-white shadow-popover">
          {hasResults ? (
            <SearchResults id={listId} groups={groups} term={term} onNavigate={onClose} />
          ) : (
            <div id={listId}>
              <SearchEmpty status={status} term={term} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
