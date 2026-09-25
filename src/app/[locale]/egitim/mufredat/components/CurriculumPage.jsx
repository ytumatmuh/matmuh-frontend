"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { startRouteProgress } from "@/app/components/Header/useRouteProgress";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ArrowUpDown,
  ChevronRight,
  ChevronLeft,
  Info,
  ListFilter,
  ExternalLink,
} from "lucide-react";
import Link from "@/app/components/LocaleLink";
import SearchField from "@/app/components/SearchField";
import { matchesWords, queryWords } from "@/lib/fold";
import PageLayout from "@/app/components/PageLayout";
import SubHeader from "@/app/components/Header/SubHeader";
import { useCmsRoute } from "inscribed";
import { useT } from "@/i18n/useT";
import { useLocaleNav } from "@/i18n/useLocaleNav";

function sortRows(rows, col, dir) {
  if (!col) return rows;
  return [...rows].sort((a, b) => {
    const av = a[col];
    const bv = b[col];
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "string" && typeof bv === "string")
      return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    return dir === "asc" ? av - bv : bv - av;
  });
}

function SortBtn({ label, col, sortCol, sortDir, onSort }) {
  return (
    <button
      onClick={() => onSort(col)}
      className="flex items-center gap-1.5 transition-colors hover:text-secondary-700"
      style={{
        fontSize: "0.6875rem",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color:
          sortCol === col
            ? "var(--color-secondary-500)"
            : "rgba(29,36,69,0.38)",
      }}
    >
      {label}
      <ArrowUpDown size={10} strokeWidth={1.5} />
    </button>
  );
}

function StatusBadge({ status }) {
  const t = useT();
  const isRequired = status === "Zorunlu";
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-md"
      style={{
        fontSize: "0.6875rem",
        fontWeight: 500,
        letterSpacing: "0.02em",
        color: isRequired
          ? "var(--color-primary-500)"
          : "var(--color-secondary-500)",
        backgroundColor: isRequired
          ? "rgba(29,36,69,0.06)"
          : "rgba(173,151,111,0.1)",
      }}
    >
      {t(status)}
    </span>
  );
}

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};
const slideTransition = { duration: 0.28, ease: [0.4, 0, 0.2, 1] };

const COLS = [
  { key: "code", label: "Ders Kodu", w: 140 },
  { key: "name", label: "Ders Adı", w: null },
  { key: "hours", label: "T+U+L", w: 80 },
  { key: "ects", label: "ECTS", w: 70 },
  { key: "status", label: "Durum", w: 110 },
  { key: "_action", label: "", w: 48 },
];

function Colgroup() {
  return (
    <colgroup>
      {COLS.map((col) => (
        <col key={col.key} style={col.w ? { width: col.w } : undefined} />
      ))}
    </colgroup>
  );
}

export default function CurriculumPage({
  semesters,
  title = "Müfredat & Dersler",
  subTitle = "Lisans programı ders planı ve kredi bilgileri",
}) {
  const t = useT();
  const { locale } = useCmsRoute();
  const [activeTab, setActiveTab] = useState(0);
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [direction, setDirection] = useState(1);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { href: localize } = useLocaleNav();

  const semester = semesters[activeTab];
  const rows = semester?.rows ?? [];
  const totalEcts = semester?.totalEcts ?? 0;

  const results = useMemo(() => {
    const words = queryWords(query);
    if (words.length === 0) return null;
    const found = new Map();
    for (const sem of semesters) {
      const term = locale === "en" ? `${t("Yarıyıl")} ${sem.number}` : `${sem.number}. Yarıyıl`;
      for (const row of sem.rows) {
        const courses = row.isGroup ? row.options.map((option) => [option, row.groupTitle]) : [[row, null]];
        for (const [course, group] of courses) {
          if (!matchesWords(words, course.code, course.name)) continue;
          if (!found.has(course.code)) found.set(course.code, { course, terms: new Set(), groups: new Set() });
          const hit = found.get(course.code);
          hit.terms.add(term);
          if (group) hit.groups.add(group);
        }
      }
    }
    return [...found.values()]
      .map(({ course, terms, groups }) => ({
        ...course,
        context: [
          [...terms].join(", "),
          groups.size === 1
            ? [...groups][0]
            : groups.size > 1
              ? t("{count} seçmeli grupta", { count: groups.size })
              : null,
        ]
          .filter(Boolean)
          .join(" · "),
      }))
      .sort((a, b) => a.code.localeCompare(b.code, "tr"));
  }, [query, semesters, locale, t]);

  const searching = results !== null;
  const sorted = sortRows(searching ? results : rows, sortCol, sortDir);

  function handleQuery(value) {
    setQuery(value);
    setExpandedGroup(null);
  }

  function handleSort(col) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  }

  function handleTabChange(idx) {
    if (searching) setQuery("");
    if (idx === activeTab && !expandedGroup) return;
    setDirection(idx > activeTab ? 1 : -1);
    setActiveTab(idx);
    setSortCol(null);
    setExpandedGroup(null);
  }

  function openGroup(row) {
    setDirection(1);
    setExpandedGroup(row);
  }

  function closeGroup() {
    setDirection(-1);
    setExpandedGroup(null);
  }

  const panelKey = searching
    ? "search"
    : expandedGroup
      ? `group-${expandedGroup.code}`
      : `sem-${activeTab}`;

  return (
    <>
      <SubHeader title={t(title)} subTitle={t(subTitle)} />
      <PageLayout>
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden border border-primary-500/10 shadow-xs bg-white">
            <div
              className="flex items-center gap-0 overflow-x-auto no-scrollbar px-1 pt-1"
              style={{ borderBottom: "1px solid rgba(29,36,69,0.06)" }}
            >
              {semesters.map((sem, idx) => (
                <button
                  key={sem.number}
                  onClick={() => handleTabChange(idx)}
                  className="px-4 py-3 transition-all duration-200 whitespace-nowrap"
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: activeTab === idx && !searching ? 600 : 450,
                    color:
                      activeTab === idx && !searching
                        ? "var(--color-primary-500)"
                        : "rgba(29,36,69,0.4)",
                    borderBottom:
                      activeTab === idx && !searching
                        ? "2px solid var(--color-secondary-500)"
                        : "2px solid transparent",
                  }}
                >
                  {locale === "en" ? `${t("Yarıyıl")} ${sem.number}` : `${sem.number}. Yarıyıl`}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-2 sm:px-6">
              <div className="flex min-w-0 items-start gap-2">
                {expandedGroup && !searching ? (
                  <button
                    onClick={closeGroup}
                    aria-label={t("Yarıyıl listesine dön")}
                    className="mt-0.5 shrink-0 text-secondary-500 transition-colors hover:text-secondary-700"
                  >
                    <ChevronLeft size={14} strokeWidth={1.5} />
                  </button>
                ) : (
                  <BookOpen size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-secondary-500" />
                )}
                <span className="flex min-w-0 flex-col">
                  <span className="text-[13px] font-medium text-primary-500">
                    {searching
                      ? results.length > 0
                        ? t("“{query}” için {count} ders", { query: query.trim(), count: results.length })
                        : t("“{query}” ile eşleşen ders yok.", { query: query.trim() })
                      : expandedGroup
                        ? expandedGroup.groupTitle
                        : semester
                          ? t("{year}. Yıl - {season} Yarıyılı", {
                              year: semester.label.year,
                              season: t(semester.label.season),
                            })
                          : ""}
                  </span>
                  {!searching && (
                    <span className="font-mono text-[11px] text-primary-500/60">
                      {expandedGroup
                        ? t("{count} ders", { count: expandedGroup.options.length })
                        : `${totalEcts} ECTS · ${t("{count} ders", { count: rows.length })}`}
                    </span>
                  )}
                </span>
              </div>
              <CurriculumSearch value={query} onChange={handleQuery} className="w-40 shrink-0 sm:w-56" />
            </div>

            {!searching && expandedGroup?.note && (
              <div
                className="mx-6 mb-3 px-3 py-2 rounded-lg flex items-start gap-2"
                style={{ backgroundColor: "rgba(173,151,111,0.07)" }}
              >
                <Info
                  size={13}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0"
                  style={{ color: "var(--color-secondary-500)" }}
                />
                <span
                  style={{
                    fontSize: "0.75rem",
                    lineHeight: 1.5,
                    color: "rgba(29,36,69,0.55)",
                  }}
                >
                  {expandedGroup.note} {t("Ders içeriği için satırlar YTÜ Bologna kataloğuna açılır.")}
                </span>
              </div>
            )}

            <div className="sm:hidden px-4 pb-2 text-center">
              <span
                style={{ fontSize: "0.6875rem", color: "rgba(29,36,69,0.4)" }}
              >
                {t("← Tabloyu görmek için yatay kaydırın →")}
              </span>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <div className="min-w-160">
                <table className="w-full table-fixed">
                  <caption className="sr-only">
                    {t("Müfredat ders listesinin sütun başlıkları")}
                  </caption>
                  <Colgroup />
                  <thead>
                    <tr
                      style={{ borderBottom: "1px solid rgba(29,36,69,0.06)" }}
                    >
                      {COLS.map((col) => (
                        <th
                          key={col.key}
                          scope="col"
                          className="text-left px-4 sm:px-6 py-3"
                        >
                          {col.key !== "_action" && (
                            <SortBtn
                              label={t(col.label)}
                              col={col.key}
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleSort}
                            />
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                </table>

                <div className="relative overflow-hidden h-[60vh] sm:h-105">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={panelKey}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={slideTransition}
                      className="absolute inset-0 overflow-y-auto"
                    >
                      <table className="w-full table-fixed">
                        <caption className="sr-only">
                          {t("Müfredat dersleri: kod, ad, saat, AKTS ve durum")}
                        </caption>
                        <Colgroup />
                        <tbody>
                          {(searching
                            ? sorted.length > 0
                              ? sorted
                              : [{ _empty: true }]
                            : expandedGroup
                            ? electiveRows(expandedGroup)
                            : sorted
                          ).map((row, idx, arr) => {
                            if (row._empty && searching) {
                              return (
                                <tr key="empty">
                                  <td colSpan={6} className="px-4 sm:px-6 py-12 text-center">
                                    <span className="text-[13px] text-primary-500/60">
                                      {t("Kod ya da ders adıyla arayın; tüm yarıyıllar ve seçmeli gruplar taranır.")}
                                    </span>
                                  </td>
                                </tr>
                              );
                            }
                            if (row._empty) {
                              return (
                                <tr key="empty">
                                  <td
                                    colSpan={6}
                                    className="px-4 sm:px-6 py-12 text-center"
                                  >
                                    <span
                                      style={{
                                        fontSize: "0.8125rem",
                                        color: "rgba(29,36,69,0.3)",
                                      }}
                                    >
                                      {t("Ders bilgisi mevcut değil")}
                                    </span>
                                  </td>
                                </tr>
                              );
                            }

                            const isLast = idx === arr.length - 1;
                            const rowStyle = {
                              borderBottom: !isLast
                                ? "1px solid rgba(29,36,69,0.03)"
                                : "none",
                              backgroundColor:
                                idx % 2 === 1
                                  ? "rgba(29,36,69,0.012)"
                                  : "transparent",
                            };

                            if (row.isGroup) {
                              return (
                                <tr
                                  key={`${row.code}-${idx}`}
                                  className="transition-colors cursor-pointer hover:bg-[rgba(173,151,111,0.04)] group"
                                  style={rowStyle}
                                  onClick={() => openGroup(row)}
                                >
                                  <td className="px-4 sm:px-6 py-3.5">
                                    <span
                                      style={{
                                        fontFamily:
                                          "'JetBrains Mono', monospace",
                                        fontSize: "0.8125rem",
                                        color: "rgba(173,151,111,0.35)",
                                      }}
                                    >
                                      -
                                    </span>
                                  </td>
                                  <td className="px-4 sm:px-6 py-3.5">
                                    <span className="flex items-center gap-2 min-w-0">
                                      <ListFilter
                                        size={13}
                                        strokeWidth={1.5}
                                        style={{
                                          color: "var(--color-secondary-500)",
                                          opacity: 0.6,
                                          flexShrink: 0,
                                        }}
                                      />
                                      <span
                                        className="wrap-break-word"
                                        style={{
                                          fontSize: "0.8125rem",
                                          fontWeight: 450,
                                          color: "rgba(29,36,69,0.65)",
                                        }}
                                      >
                                        {row.groupTitle}
                                      </span>
                                      {row.options.length > 0 && (
                                        <span
                                          className="shrink-0"
                                          style={{
                                            fontSize: "0.625rem",
                                            color: "rgba(29,36,69,0.3)",
                                          }}
                                        >
                                          ({row.options.length} seçenek)
                                        </span>
                                      )}
                                    </span>
                                  </td>
                                  <td className="px-4 sm:px-6 py-3.5">
                                    <span
                                      style={{
                                        fontFamily:
                                          row.hours === "-"
                                            ? undefined
                                            : "'JetBrains Mono', monospace",
                                        fontSize: "0.75rem",
                                        color:
                                          row.hours === "-"
                                            ? "rgba(29,36,69,0.2)"
                                            : "rgba(29,36,69,0.45)",
                                      }}
                                    >
                                      {row.hours}
                                    </span>
                                  </td>
                                  <td className="px-4 sm:px-6 py-3.5">
                                    <span
                                      style={{
                                        fontFamily:
                                          row.ects === "-"
                                            ? undefined
                                            : "'JetBrains Mono', monospace",
                                        fontSize:
                                          row.ects === "-"
                                            ? "0.75rem"
                                            : "0.8125rem",
                                        fontWeight:
                                          row.ects === "-" ? 400 : 600,
                                        color:
                                          row.ects === "-"
                                            ? "rgba(29,36,69,0.2)"
                                            : "var(--color-primary-500)",
                                      }}
                                    >
                                      {row.ects}
                                    </span>
                                  </td>
                                  <td className="px-4 sm:px-6 py-3.5">
                                    <StatusBadge status="Seçmeli" />
                                  </td>
                                  <td className="px-4 sm:px-6 py-3.5">
                                    <ChevronRight
                                      size={14}
                                      strokeWidth={1.5}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      style={{
                                        color: "var(--color-secondary-500)",
                                      }}
                                    />
                                  </td>
                                </tr>
                              );
                            }

                            const isExternal = Boolean(row.external);
                            const target = row.href;

                            return (
                              <tr
                                key={`${row.code}-${idx}`}
                                className="transition-colors cursor-pointer hover:bg-[rgba(173,151,111,0.03)] group"
                                style={rowStyle}
                                onClick={() => {
                                  if (isExternal) {
                                    window.open(
                                      target,
                                      "_blank",
                                      "noopener,noreferrer",
                                    );
                                    return;
                                  }
                                  startRouteProgress();
                                  router.push(localize(target));
                                }}
                              >
                                <td className="px-4 sm:px-6 py-3.5">
                                  <span
                                    style={{
                                      fontFamily: "'JetBrains Mono', monospace",
                                      fontSize: "0.8125rem",
                                      fontWeight: 500,
                                      color: "var(--color-secondary-500)",
                                      letterSpacing: "0.02em",
                                    }}
                                  >
                                    {row.code}
                                  </span>
                                </td>
                                <td className="px-4 sm:px-6 py-3.5">
                                  <Link
                                    href={target}
                                    {...(isExternal
                                      ? {
                                          target: "_blank",
                                          rel: "noopener noreferrer",
                                        }
                                      : {})}
                                    className="hover:text-secondary-700 transition-colors block wrap-break-word"
                                    style={{
                                      fontSize: "0.8125rem",
                                      fontWeight: 450,
                                      color: "var(--color-primary-500)",
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {row.name}
                                  </Link>
                                  {row.context && (
                                    <span className="mt-0.5 block text-[11px] text-primary-500/60">
                                      {row.context}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 sm:px-6 py-3.5">
                                  <span
                                    style={{
                                      fontFamily: "'JetBrains Mono', monospace",
                                      fontSize: "0.75rem",
                                      color: "rgba(29,36,69,0.45)",
                                    }}
                                  >
                                    {row.hours}
                                  </span>
                                </td>
                                <td className="px-4 sm:px-6 py-3.5">
                                  <span
                                    style={{
                                      fontFamily: "'JetBrains Mono', monospace",
                                      fontSize: "0.8125rem",
                                      fontWeight: 600,
                                      color: "var(--color-primary-500)",
                                    }}
                                  >
                                    {row.ects}
                                  </span>
                                </td>
                                <td className="px-4 sm:px-6 py-3.5">
                                  <StatusBadge status={row.status} />
                                </td>
                                <td className="px-4 sm:px-6 py-3.5">
                                  {isExternal ? (
                                    <ExternalLink
                                      size={14}
                                      strokeWidth={1.5}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      style={{
                                        color: "var(--color-secondary-500)",
                                      }}
                                    />
                                  ) : (
                                    <Info
                                      size={14}
                                      strokeWidth={1.5}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      style={{ color: "rgba(29,36,69,0.3)" }}
                                    />
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

          </div>
        </div>
      </PageLayout>
    </>
  );
}

function CurriculumSearch({ value, onChange, className }) {
  const t = useT();
  return (
    <div className={className}>
      <SearchField
        value={value}
        onChange={onChange}
        placeholder={t("Kod ya da ad")}
        label={t("Müfredatta ara")}
      />
    </div>
  );
}

function electiveRows(group) {
  return group.options.length > 0 ? group.options : [{ _empty: true }];
}
