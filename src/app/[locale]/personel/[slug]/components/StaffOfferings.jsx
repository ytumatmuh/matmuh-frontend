"use client";

import Link from "@/app/components/LocaleLink";
import { ArrowRight } from "lucide-react";

import { useT } from "@/i18n/useT";
import { localizeTerm } from "@/i18n";

function currentLectures(entries) {
  const lectures = new Map();
  for (const entry of entries) {
    const groups = entry.groups ?? [entry];
    if (!lectures.has(entry.code)) {
      lectures.set(entry.code, { code: entry.code, name: entry.name, groups: new Map() });
    }
    const lecture = lectures.get(entry.code);
    for (const group of groups) {
      lecture.groups.set(group.group, Boolean(group.english ?? entry.english));
    }
  }
  return [...lectures.values()]
    .map((lecture) => ({
      ...lecture,
      groups: [...lecture.groups.entries()]
        .map(([group, english]) => ({ group, english }))
        .sort((a, b) => a.group - b.group),
    }))
    .sort((a, b) => a.code.localeCompare(b.code, "tr"));
}

function LanguageTag({ english }) {
  const t = useT();
  return (
    <span
      className={`rounded-sm px-1.5 py-px text-[10px] font-semibold ${
        english ? "bg-secondary-500/15 text-secondary-700" : "bg-primary-500/6 text-primary-500/80"
      }`}
    >
      {english ? t("İngilizce") : t("Türkçe")}
    </span>
  );
}

export default function StaffOfferings({ entries = [], term = null }) {
  const t = useT();
  const lectures = currentLectures(entries);
  if (lectures.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary-500/70">
        {term ? localizeTerm(t, term.name) : t("Bu dönem")}
        <span className="rounded-full bg-secondary-500/15 px-2 py-0.5 text-[9px] tracking-wider text-secondary-700">
          {t("Bu dönem")}
        </span>
      </span>
      {lectures.map((lecture) => (
        <Link
          key={lecture.code}
          href={`/egitim/mufredat/${lecture.code}`}
          className="group flex items-center gap-3 rounded-lg border border-primary-500/8 px-3 py-2.5 transition-colors hover:bg-primary-500/3"
        >
          <span className="min-w-0 flex-1">
            <span className="block wrap-break-word text-[13px] font-semibold text-primary-500 transition-colors group-hover:text-secondary-700">
              {lecture.name}
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-primary-500/70">
              <span className="font-mono text-secondary-700">{lecture.code}</span>
              {lecture.groups.map(({ group, english }) => (
                <span key={group} className="inline-flex items-center gap-1">
                  <span aria-hidden>·</span>
                  {t("Grup")} {group}
                  <LanguageTag english={english} />
                </span>
              ))}
            </span>
          </span>
          <ArrowRight size={14} className="shrink-0 text-primary-500/50 transition-colors group-hover:text-secondary-700" />
        </Link>
      ))}
    </div>
  );
}
