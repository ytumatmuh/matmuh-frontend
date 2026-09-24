"use client";
import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
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
            <div className="flex items-center justify-between gap-x-4 px-2 flex-wrap">
              <div className="flex items-center overflow-x-auto no-scrollbar max-w-full">
                {CLASSES.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setActiveClass(cls.id)}
                    className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
                      activeClass === cls.id
                        ? "border-secondary-500 text-secondary-700"
                        : "border-transparent text-primary-500/70 hover:text-primary-500"
                    }`}
                    aria-pressed={activeClass === cls.id}
                  >
                    {t("{n}. Sınıf", { n: cls.id })}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 px-2 py-3 text-primary-500/70">
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
