"use client";
import { useState, useMemo } from "react";
import { CalendarDays } from "lucide-react";
import SubHeader from "@/app/components/Header/SubHeader";
import PageLayout from "@/app/components/PageLayout";
import ScheduleViews from "@/app/[locale]/egitim/components/ScheduleViews";
import ScheduleLegend from "@/app/[locale]/egitim/components/ScheduleLegend";
import { useT } from "@/i18n/useT";
import { localizeTerm } from "@/i18n";

const LEVELS = [
  { id: "all", label: "Tümü" },
  { id: "MASTERS", label: "Yüksek Lisans" },
  { id: "DOCTORATE", label: "Doktora" },
];

const isDoctorate = (entry) => entry.degreeLevels.includes("DOCTORATE");

export default function LisansustuDersProgramiPage({ entries: all = [], term }) {
  const t = useT();
  const [level, setLevel] = useState("all");

  const entries = useMemo(
    () =>
      all
        .filter((entry) => level === "all" || entry.degreeLevels.includes(level))
        .map((entry) => ({
          ...entry,
          type: isDoctorate(entry) ? "Seçmeli" : "Zorunlu",
          badge: isDoctorate(entry) ? "Doktora" : "Yüksek Lisans",
        })),
    [all, level],
  );

  return (
    <>
      <SubHeader
        title={t("Ders Programı")}
        subTitle={term ? `${t("Lisansüstü")} · ${localizeTerm(t, term)}` : t("Lisansüstü")}
      />
      <PageLayout>
        <div className="space-y-4">
          <div className="rounded-xl border border-primary-500/10 shadow-xs bg-white overflow-hidden">
            <div className="flex items-center justify-between gap-x-4 px-2 flex-wrap">
              <div className="flex items-center overflow-x-auto no-scrollbar max-w-full">
                {LEVELS.map((lv) => (
                  <button
                    key={lv.id}
                    onClick={() => setLevel(lv.id)}
                    className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
                      level === lv.id
                        ? "border-secondary-500 text-secondary-700"
                        : "border-transparent text-primary-500/70 hover:text-primary-500"
                    }`}
                    aria-pressed={level === lv.id}
                  >
                    {t(lv.label)}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 px-2 py-3 text-primary-500/70">
                <CalendarDays size={14} strokeWidth={1.5} />
                <span style={{ fontSize: "0.75rem" }}>
                  {t("{count} ders bloğu", { count: entries.length })}
                </span>
              </div>
            </div>
          </div>

          <ScheduleViews
            entries={entries}
            legend={
              <ScheduleLegend
                items={[
                  { elective: false, label: t("Yüksek Lisans") },
                  { elective: true, label: t("Doktora") },
                ]}
              />
            }
          />
        </div>
      </PageLayout>
    </>
  );
}
