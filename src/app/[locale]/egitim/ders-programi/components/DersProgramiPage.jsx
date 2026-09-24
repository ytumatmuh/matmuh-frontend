"use client";
import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import SubHeader from "@/app/components/Header/SubHeader";
import PageLayout from "@/app/components/PageLayout";
import ScheduleViews from "@/app/[locale]/egitim/components/ScheduleViews";
import ScheduleLegend from "@/app/[locale]/egitim/components/ScheduleLegend";
import { useT } from "@/i18n/useT";
import { localizeTerm } from "@/i18n";
import { useCmsRoute } from "inscribed";

const CLASSES = [1, 2, 3, 4].map((id) => ({ id }));

const classOf = (entry) => (entry.term ? Math.ceil(entry.term / 2) : null);

export default function DersProgramiPage({ entries: all = [], term }) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const { locale } = useCmsRoute();
  const listFormat = useMemo(
    () => new Intl.ListFormat(locale === "en" ? "en" : "tr", { style: "long", type: "conjunction" }),
    [locale],
  );
  const [activeClass, setActiveClass] = useState(CLASSES[0].id);

  const entries = useMemo(
    () => all.filter((entry) => classOf(entry) === activeClass),
    [all, activeClass],
  );

  const pools = useMemo(() => {
    const seen = new Map();
    for (const entry of all) {
      if (entry.pool?.placement !== "code") continue;
      if (!seen.has(entry.pool.id)) seen.set(entry.pool.id, { name: entry.pool.name, years: new Set() });
      const year = classOf(entry);
      if (year) seen.get(entry.pool.id).years.add(year);
    }
    return [...seen.values()].map((pool) => ({ ...pool, years: [...pool.years].sort() }));
  }, [all]);

  const courseCount = useMemo(() => new Set(entries.map((entry) => entry.code)).size, [entries]);

  return (
    <>
      <SubHeader
        title={t("Ders Programı")}
        subTitle={term ? `${t("Lisans")} · ${localizeTerm(t, term)}` : t("Lisans")}
      />
      <PageLayout>
        <div className="space-y-4">
          <div className="rounded-xl border border-primary-500/10 shadow-xs bg-white overflow-hidden">
            <div className="flex items-center justify-between gap-x-4 px-1 pt-1 flex-wrap">
              <div className="flex items-center overflow-x-auto no-scrollbar max-w-full">
                {CLASSES.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setActiveClass(cls.id)}
                    className={`relative shrink-0 whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-[0.8125rem] transition-colors duration-200 ${
                      activeClass === cls.id
                        ? "font-semibold text-primary-500"
                        : "font-[450] text-primary-500/40 hover:text-primary-500/70"
                    }`}
                    aria-pressed={activeClass === cls.id}
                  >
                    {t("{n}. Sınıf", { n: cls.id })}
                    {activeClass === cls.id && (
                      <motion.span
                        layoutId="year-tab"
                        aria-hidden
                        className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-secondary-500"
                        transition={reduceMotion ? { duration: 0 } : { duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 px-3 py-3 text-primary-500/70">
                <CalendarDays size={14} strokeWidth={1.5} />
                <span style={{ fontSize: "0.75rem" }}>
                  {t("{count} ders", { count: courseCount })}
                </span>
              </div>
            </div>
          </div>

          <ScheduleViews
            entries={entries}
            courseHref={(code) => `/egitim/mufredat/${code}`}
            legend={
              <ScheduleLegend
                items={[
                  { elective: false, label: t("Zorunlu ders") },
                  { elective: true, label: t("Seçmeli ders") },
                ]}
                showOnline
                showPool={entries.some((entry) => entry.pool)}
              />
            }
            note={
              pools.length > 0
                ? t("Üniversite seçmelileri ders kodundaki sınıf seviyesine göre listelenir: {list}.", {
                    list: pools
                      .map((pool) =>
                        t(pool.years.length > 1 ? "{name} {years} sınıflarda" : "{name} {years} sınıfta", {
                          name: pool.name,
                          years: listFormat.format(
                            pool.years.map((year) => (locale === "en" ? String(year) : `${year}.`)),
                          ),
                        }),
                      )
                      .join("; "),
                  })
                : null
            }
          />
        </div>
      </PageLayout>
    </>
  );
}
