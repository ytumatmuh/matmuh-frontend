"use client";
import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import SubHeader from "@/app/components/Header/SubHeader";
import PageLayout from "@/app/components/PageLayout";
import ScheduleViews from "@/app/[locale]/egitim/components/ScheduleViews";
import { tintOf } from "@/data/schedule-colors";
import ScheduleLegend from "@/app/[locale]/egitim/components/ScheduleLegend";
import { useT } from "@/i18n/useT";
import { localizeTerm } from "@/i18n";

const CLASSES = [1, 2, 3, 4].map((id) => ({ id }));

const classOf = (entry) => (entry.term ? Math.ceil(entry.term / 2) : null);

export default function DersProgramiPage({ entries: all = [], term }) {
  const t = useT();
  const [activeClass, setActiveClass] = useState(CLASSES[0].id);

  const entries = useMemo(
    () => all.filter((entry) => classOf(entry) === activeClass),
    [all, activeClass],
  );

  const pools = useMemo(() => {
    const seen = new Map();
    for (const entry of all) {
      if (entry.pool && !seen.has(entry.pool.id)) seen.set(entry.pool.id, entry.pool);
    }
    return [...seen.values()].sort((a, b) => (a.term ?? 0) - (b.term ?? 0));
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
            <div className="flex items-center justify-between gap-4 px-4 py-3 flex-wrap">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar -mx-1 px-1 max-w-full">
                {CLASSES.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setActiveClass(cls.id)}
                    className="px-4 py-2 rounded-lg transition-colors shrink-0 whitespace-nowrap"
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: activeClass === cls.id ? 600 : 450,
                      color:
                        activeClass === cls.id ? "#fff" : "rgba(29,36,69,0.5)",
                      backgroundColor:
                        activeClass === cls.id
                          ? "var(--color-primary-500)"
                          : "transparent",
                    }}
                  >
                    {t("{n}. Sınıf", { n: cls.id })}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-primary-500/70">
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
                  { color: tintOf(false), label: t("Zorunlu") },
                  { color: tintOf(true), label: t("Seçmeli") },
                ]}
                showOnline
                showPool={entries.some((entry) => entry.pool)}
              />
            }
            note={
              pools.length > 0
                ? t("Üniversite seçmelileri müfredattaki yerlerine göre listelenir: {list}.", {
                    list: pools
                      .map((pool) =>
                        t("{name} {n}. sınıfta", { name: pool.name, n: Math.ceil((pool.term ?? 1) / 2) }),
                      )
                      .join(", "),
                  })
                : null
            }
          />
        </div>
      </PageLayout>
    </>
  );
}
