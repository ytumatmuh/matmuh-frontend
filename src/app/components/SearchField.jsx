"use client";

import { Search, X } from "lucide-react";

import { useT } from "@/i18n/useT";

export default function SearchField({ value, onChange, placeholder, label, className = "" }) {
  const t = useT();
  return (
    <label className={`relative flex items-center ${className}`}>
      <Search size={13} strokeWidth={2} className="pointer-events-none absolute left-2.5 text-primary-500/50" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-8 w-full rounded-md border border-primary-500/12 bg-white pr-7 pl-8 text-[12px] text-primary-600 placeholder:text-primary-500/50 focus:border-secondary-500/60 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={t("Aramayı temizle")}
          className="absolute right-1.5 rounded-sm p-0.5 text-primary-500/60 hover:bg-primary-500/6 hover:text-primary-500"
        >
          <X size={12} strokeWidth={2} />
        </button>
      )}
    </label>
  );
}
