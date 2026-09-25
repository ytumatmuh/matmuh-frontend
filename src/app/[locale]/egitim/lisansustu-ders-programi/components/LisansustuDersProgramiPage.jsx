"use client";
import { useState, useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
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
  const reduceMotion = useReducedMotion();
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
            <div className="flex items-center justify-between gap-x-4 px-1 pt-1">
              <div className="flex items-center overflow-x-auto no-scrollbar max-w-full">
                {LEVELS.map((lv) => (
                  <button
                    key={lv.id}
                    onClick={() => setLevel(lv.id)}
                    className={`relative shrink-0 whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-[0.8125rem] transition-colors duration-200 ${
                      level === lv.id
                        ? "font-semibold text-primary-500"
                        : "font-[450] text-primary-500/40 hover:text-primary-500/70"
                    }`}
                    aria-pressed={level === lv.id}
                  >
                    {t(lv.label)}
                    {level === lv.id && (
                      <motion.span
                        layoutId="level-tab"
                        aria-hidden
                        className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-secondary-500"
                        transition={reduceMotion ? { duration: 0 } : { duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      />
                    )}
                  </button>
                ))}
              </div>
              <div className="hidden shrink-0 items-center gap-2 px-3 py-3 text-primary-500/70 sm:flex">
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
