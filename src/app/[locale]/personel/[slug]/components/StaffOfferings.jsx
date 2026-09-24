"use client";

import { useEffect, useState } from "react";
import Link from "@/app/components/LocaleLink";
import { ArrowRight, ChevronDown, Lock } from "lucide-react";

import Collapse from "@/app/components/Collapse";
import Panel from "@/app/components/Panel";
import GradeDistribution from "@/app/components/GradeDistribution";
import { SkeletonBlock } from "@/app/components/Skeleton";
import { useAuth } from "@/lib/auth";
import { fetchStaffOfferings } from "@/data/statistics";
import { useT } from "@/i18n/useT";
import { localizeTerm } from "@/i18n";

const STAT = "flex flex-col gap-0.5 rounded-lg bg-primary-500/2 px-3 py-2";

function Summary({ summary }) {
  const t = useT();
  const rows = [
    [t("Ortalama"), summary.average?.toFixed?.(2) ?? summary.average],
    [t("Std. sapma"), summary.stdDev?.toFixed?.(2) ?? summary.stdDev],
    [t("Katılan"), summary.participantCount],
  ].filter(([, value]) => value !== null && value !== undefined);

  if (rows.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {rows.map(([label, value]) => (
        <span key={label} className={STAT}>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary-500/70">
            {label}
          </span>
          <span className="font-mono text-[13px] font-semibold text-primary-600">
            {value}
          </span>
        </span>
      ))}
    </div>
  );
}

function LectureRow({ lecture, defaultOpen }) {
  const t = useT();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-primary-500/8">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-primary-500/3"
      >
        <span className="min-w-0 flex-1">
          <span className="block wrap-break-word text-[13px] font-semibold text-primary-500">
            {lecture.name}
          </span>
          <span className="mt-0.5 block font-mono text-[11px] text-secondary-700">
            {lecture.code}
            <span className="ml-2 font-sans text-primary-500/70">
              {t("{count} grup", { count: lecture.sections.length })}
            </span>
          </span>
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-primary-500/70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <Collapse open={open}>
        <div className="flex flex-col gap-5 px-3 pb-4">
          {lecture.code && (
            <Link
              href={`/egitim/mufredat/${lecture.code}`}
              className="text-[11px] font-medium text-secondary-700 hover:underline"
            >
              {t("Ders sayfası")}
            </Link>
          )}
          {lecture.sections.map((section) => (
            <div key={section.section} className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-primary-500/70">
                {t("Grup")} {section.section}
              </span>
              <Summary summary={section.summary} />
              <GradeDistribution data={section.gradeDistribution} />
            </div>
          ))}
        </div>
      </Collapse>
    </div>
  );
}

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

function CurrentTerm({ entries, term }) {
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

function PastStatistics({ staffId, currentKey }) {
  const t = useT();
  const { isAuthenticated, getAccessToken, signIn } = useAuth();
  const [terms, setTerms] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || terms) return undefined;
    let alive = true;
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token || !alive) return;
        const result = await fetchStaffOfferings(staffId, token);
        if (alive) setTerms(result);
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isAuthenticated, terms, staffId, getAccessToken]);

  const heading = (
    <span className="text-[11px] font-semibold uppercase tracking-widest text-primary-500/70">
      {t("Geçmiş not istatistikleri")}
    </span>
  );

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-2">
        {heading}
        <Panel>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Lock className="size-5 text-primary-500/70" />
            <p className="text-[13px] text-primary-500/70">
              {t("Geçmiş dönemlerin not istatistiklerini görmek için giriş yapın.")}
            </p>
            <button
              type="button"
              onClick={() => signIn()}
              className="rounded-lg border border-secondary-500 px-3.5 py-1.5 text-xs font-medium text-secondary-700 transition-colors hover:bg-secondary-500 hover:text-primary-500"
            >
              {t("Giriş yap")}
            </button>
          </div>
        </Panel>
      </div>
    );
  }

  if (failed) {
    return (
      <Panel>
        <p className="py-4 text-center text-[13px] text-primary-500/70">
          {t("İstatistikler yüklenemedi.")}
        </p>
      </Panel>
    );
  }

  if (!terms) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <SkeletonBlock key={i} className="h-14" />
        ))}
      </div>
    );
  }

  const past = terms.filter((term) => term.key !== currentKey);

  if (past.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        {heading}
        <Panel>
          <p className="py-4 text-center text-[13px] text-primary-500/70">
            {t("Geçmiş dönemlere ait not istatistiği bulunmuyor.")}
          </p>
        </Panel>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {heading}
      {past.map((term, termIndex) => (
        <div key={term.name} className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-primary-500/70">
            {localizeTerm(t, term.name)}
          </span>
          {term.lectures.map((lecture, index) => (
            <LectureRow
              key={`${lecture.code}-${index}`}
              lecture={lecture}
              defaultOpen={termIndex === 0 && index === 0}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function StaffOfferings({ staffId, entries = [], term = null }) {
  return (
    <div className="flex flex-col gap-8">
      <CurrentTerm entries={entries} term={term} />
      <PastStatistics staffId={staffId} currentKey={term?.key ?? null} />
    </div>
  );
}
