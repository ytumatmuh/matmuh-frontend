"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "@/app/components/LocaleLink";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Layers,
  MapPin,
  Plus,
  TriangleAlert,
  User,
  Wifi,
  X,
} from "lucide-react";
import Modal from "@/app/components/Modal";
import { useMySchedule } from "@/data/useMySchedule";
import { DAYS, TIME_SLOTS, visibleDayIndexes } from "@/data/schedule-grid";
import { WINDOW_LABELS, byTimeOrder, poolBlocks } from "@/data/schedule-pool";
import { useT } from "@/i18n/useT";
import {
  GOLD_RGB as GOLD,
  NAVY_RGB as NAVY,
  colorOf,
  courseColors,
  tintOf,
} from "@/data/schedule-colors";

const VISIBLE = 3;
const INLINE_GROUPS = 3;

const startOf = (slot) => TIME_SLOTS[slot]?.split(" - ")[0] ?? "";
const endOf = (slot) => TIME_SLOTS[slot]?.split(" - ")[1] ?? "";
const spanOf = (entry) => Math.max(1, entry.span || 1);
const rangeOf = (entry) =>
  `${startOf(entry.slot)} – ${endOf(entry.slot + spanOf(entry) - 1)}`;

const MINI_BUTTON =
  "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[9.5px] font-semibold transition-colors disabled:opacity-40";

const ENROLL_SIZES = {
  sm: { button: MINI_BUTTON, icon: 9, text: "text-[9.5px]" },
  md: {
    button:
      "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11.5px] font-semibold transition-colors disabled:opacity-40",
    icon: 12,
    text: "text-[11.5px]",
  },
};

function EnrollAction({ entry, size = "sm" }) {
  const t = useT();
  const my = useMySchedule();
  const [clash, setClash] = useState(null);
  const { button: BUTTON, icon: ICON, text: TEXT } = ENROLL_SIZES[size];

  if (!my || my.status !== "ready" || !entry.offeringId) return null;

  const busy = my.busyId === entry.offeringId;
  const failed = my.failedId === entry.offeringId;

  if (my.isEnrolled(entry.offeringId)) {
    return (
      <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span className={`inline-flex items-center gap-1 ${TEXT} font-semibold text-secondary-700`}>
          <Check size={ICON} strokeWidth={2.5} />
          {t("Programımda")}
        </span>
        <button
          type="button"
          onClick={() => void my.remove(entry.offeringId)}
          disabled={busy}
          className={`${BUTTON} text-primary-500/70 hover:bg-primary-500/6 hover:text-primary-500`}
        >
          {busy ? "…" : t("Kaldır")}
        </button>
      </span>
    );
  }

  const onAdd = () => {
    if (!clash) {
      const found = my.clashOf(entry);
      if (found) {
        setClash(found);
        return;
      }
    }
    void my.add(entry).then((ok) => ok && setClash(null));
  };

  return (
    <span className="mt-1.5 block">
      {clash && (
        <span className={`mb-1 flex items-start gap-1 rounded-sm bg-amber-50 px-1.5 py-1 ${TEXT} leading-snug text-amber-800`}>
          <TriangleAlert size={ICON} strokeWidth={2.25} className="mt-px shrink-0" />
          <span>
            {t("{day} {range} · {code} Gr.{group} ile çakışıyor.", {
              day: t(DAYS[clash.day]),
              range: rangeOf(clash),
              code: clash.code,
              group: clash.group,
            })}
          </span>
        </span>
      )}

      <span className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={onAdd}
          disabled={busy}
          className={`${BUTTON} border border-secondary-500/40 text-secondary-700 hover:bg-secondary-500/10`}
        >
          {busy ? (
            "…"
          ) : (
            <>
              <Plus size={ICON} strokeWidth={2.5} />
              {clash ? t("Yine de ekle") : t("Programıma ekle")}
            </>
          )}
        </button>
        {clash && (
          <button
            type="button"
            onClick={() => setClash(null)}
            className={`${BUTTON} text-primary-500/70 hover:text-primary-500`}
          >
            <X size={ICON} strokeWidth={2.5} />
            {t("Vazgeç")}
          </button>
        )}
      </span>

      {failed && (
        <span className={`mt-1 block ${TEXT} text-red-700/75`}>
          {t("İşlem tamamlanamadı.")}
        </span>
      )}
    </span>
  );
}

function metaOf(entry) {
  return [
    entry.instructor && entry.instructor !== "-" ? entry.instructor : null,
    !entry.online && entry.room && entry.room !== "-" ? entry.room : null,
  ].filter(Boolean);
}

function courseBlocks(entries) {
  const blocks = new Map();
  for (const entry of entries) {
    const key = `${entry.day}|${entry.slot}|${spanOf(entry)}|${entry.code}`;
    if (!blocks.has(key)) blocks.set(key, { ...entry, span: spanOf(entry), groups: [] });
    blocks.get(key).groups.push(entry);
  }
  return [...blocks.values()].map((block) => ({
    ...block,
    badge: block.pool?.name ?? null,
    groups: block.groups.sort((a, b) => (a.group || 0) - (b.group || 0)),
    english: block.groups.every((group) => group.english),
    online: block.groups.every((group) => group.online),
  }));
}

const poolLast = (block) => (block.kind === "pool" ? 1 : 0);

function buildClusters(entries) {
  const byDay = new Map();
  for (const block of poolBlocks(courseBlocks(entries))) {
    if (!byDay.has(block.day)) byDay.set(block.day, []);
    byDay.get(block.day).push(block);
  }

  const clusters = new Map();
  for (const [day, list] of byDay) {
    list.sort(
      (a, b) => a.slot - b.slot || b.span - a.span || a.code.localeCompare(b.code, "tr"),
    );
    const out = [];
    for (const block of list) {
      const end = block.slot + block.span - 1;
      const last = out[out.length - 1];
      if (last && block.slot <= last.to) {
        last.blocks.push(block);
        last.to = Math.max(last.to, end);
      } else {
        out.push({ from: block.slot, to: end, blocks: [block] });
      }
    }
    for (const cluster of out) {
      cluster.blocks.sort((a, b) => poolLast(a) - poolLast(b) || a.slot - b.slot);
    }
    clusters.set(day, out);
  }
  return clusters;
}

function buildRows(entries) {
  const used = new Set();
  for (const entry of entries) {
    for (let k = 0; k < spanOf(entry); k++) used.add(entry.slot + k);
  }
  if (used.size === 0) {
    return TIME_SLOTS.map((_, si) => ({ type: "slot", slot: si, empty: true }));
  }

  const first = Math.min(...used);
  const last = Math.max(...used);

  const rows = [];
  if (first > 0) {
    rows.push({ type: "edge", from: 0, to: first - 1 });
  }
  for (let si = first; si <= last; si++) {
    rows.push({ type: "slot", slot: si, empty: !used.has(si) });
  }
  if (last < TIME_SLOTS.length - 1) {
    rows.push({ type: "edge", from: last + 1, to: TIME_SLOTS.length - 1 });
  }
  return rows;
}

function groupLabel(groups) {
  return groups.length === 1 ? `Gr.${groups[0].group}` : `Gr.${groups.map((group) => group.group).join("·")}`;
}

function GroupDetail({ entry, single }) {
  const t = useT();
  return (
    <span className="flex flex-col gap-1 text-[10px] leading-snug text-primary-500/70">
      {!single && (
        <span className="flex items-center gap-1 font-mono text-[9.5px] font-semibold text-primary-600">
          {t("Grup {group}", { group: entry.group })}
          {entry.english && (
            <span className="rounded-sm bg-secondary-500/12 px-1 py-px font-sans text-[9px] font-medium text-secondary-700">
              {t("İngilizce")}
            </span>
          )}
        </span>
      )}
      {entry.instructor && entry.instructor !== "-" && (
        <span className="flex items-start gap-1">
          <User size={10} strokeWidth={1.5} className="mt-px shrink-0" />
          {entry.staffSlug ? (
            <Link
              href={`/personel/${entry.staffSlug}`}
              className="underline decoration-primary-500/20 underline-offset-2 transition-colors hover:text-secondary-700 hover:decoration-secondary-500"
            >
              {entry.instructor}
            </Link>
          ) : (
            entry.instructor
          )}
        </span>
      )}
      {entry.online ? (
        <span className="flex items-center gap-1 text-secondary-700">
          <Wifi size={10} strokeWidth={1.75} className="shrink-0" />
          {t("Çevrimiçi")}
        </span>
      ) : (
        entry.room &&
        entry.room !== "-" && (
          <span className="flex items-center gap-1 font-mono">
            <MapPin size={10} strokeWidth={1.5} className="shrink-0" />
            {entry.room}
          </span>
        )
      )}
      <EnrollAction entry={entry} />
    </span>
  );
}

function Strip({ entry, color, slim, fill, showRange, active, href, opensList, onToggle }) {
  const t = useT();
  const elective = entry.type === "Seçmeli";
  const groups = entry.groups ?? [entry];
  const single = groups.length === 1;
  const meta = single ? metaOf(groups[0]) : [t("{count} grup", { count: groups.length })];
  const detailed = !slim && meta.length > 0;

  const label = [
    `${entry.code} ${entry.name}`,
    single
      ? t("Grup {group}", { group: groups[0].group })
      : t("{count} grup", { count: groups.length }),
    rangeOf(entry),
    entry.online ? t("çevrimiçi") : null,
    ...(single ? meta : []),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-md ${fill ? "flex-1" : ""}`}
      style={{
        backgroundColor: tintOf(elective, false),
        borderLeft: `2.5px solid ${color}`,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={opensList ? undefined : active}
        aria-haspopup={opensList ? "dialog" : undefined}
        aria-label={label}
        className={`flex min-h-6 w-full flex-col justify-start py-1.5 pr-1.5 pl-1.5 text-left transition-colors hover:bg-primary-500/4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-secondary-500 ${fill && !active ? "flex-1" : ""}`}
      >
        <span className="flex items-center gap-1">
          <span
            className="shrink-0 font-mono text-[9.5px] font-semibold"
            style={{ color }}
          >
            {entry.code}
          </span>
          <span className="flex-1" />
          {entry.online && (
            <Wifi
              size={9}
              strokeWidth={2.25}
              aria-hidden
              className="shrink-0 text-secondary-700"
            />
          )}
          {entry.english && (
            <span className="shrink-0 font-mono text-[8.5px] font-semibold tracking-wide text-secondary-700">
              EN
            </span>
          )}
          {!opensList && (
            <span className="shrink-0 font-mono text-[9px] text-primary-500/70">
              {groupLabel(groups)}
            </span>
          )}
          {opensList ? (
            <ChevronRight size={10} strokeWidth={2.25} className="shrink-0 text-primary-500/70" />
          ) : (
            <ChevronDown
              size={10}
              strokeWidth={2.25}
              className={`shrink-0 text-primary-500/70 transition-transform ${active ? "rotate-180" : ""}`}
            />
          )}
        </span>
        <span
          className="mt-0.5 block text-[11px] leading-snug font-medium text-primary-600"
        >
          {entry.name}
        </span>
        {entry.pool && (
          <span className="mt-px flex items-center gap-1 text-[9.5px] font-medium text-secondary-700">
            <Layers size={9} strokeWidth={2} className="shrink-0" />
            {entry.pool.name}
          </span>
        )}

        {showRange && !active && (
          <span className="mt-px block font-mono text-[9px] text-primary-500/70">
            {rangeOf(entry)}
          </span>
        )}
        {detailed && !active && (
          <span className="mt-px block wrap-break-word text-[9.5px] leading-snug text-primary-500/70">
            {meta.join(" · ")}
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              className="px-1.5 pb-1.5">
              <span className="block font-mono text-[9.5px] text-primary-500/70">
                {t(DAYS[entry.day])} · {rangeOf(entry)}
              </span>

              <span className="mt-1 flex flex-wrap items-center gap-1">
                {(entry.badge || entry.type) && (
                  <span
                    className="rounded-sm px-1 py-px text-[9px] font-medium"
                    style={{
                      backgroundColor: `rgba(${elective ? GOLD : NAVY},0.1)`,
                      color: elective
                        ? "var(--color-secondary-600)"
                        : "rgba(29,36,69,0.6)",
                    }}
                  >
                    {t(entry.badge || entry.type)}
                  </span>
                )}
                {single && entry.english && (
                  <span className="rounded-sm bg-secondary-500/12 px-1 py-px text-[9px] font-medium text-secondary-700">
                    {t("İngilizce")}
                  </span>
                )}
              </span>

              <span
                className="mt-1.5 flex flex-col gap-2 border-t pt-1.5"
                style={{ borderColor: `rgba(${NAVY},0.1)` }}
              >
                {groups.map((group) => (
                  <span
                    key={`${group.group}-${group.offeringId ?? ""}`}
                    className={single ? "" : "border-t pt-1.5 first:border-t-0 first:pt-0"}
                    style={single ? undefined : { borderColor: `rgba(${NAVY},0.06)` }}
                  >
                    <GroupDetail entry={group} single={single} />
                  </span>
                ))}
              </span>

              {href && (
                <Link
                  href={href}
                  className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-secondary-700 hover:underline"
                >
                  {t("Ders sayfası")}
                  <ArrowRight size={10} strokeWidth={2} />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PoolStrip({ block, fill, showRange, onOpen }) {
  const t = useT();
  const limit = fill ? Math.min(Math.max(block.span + 1, 2), 6) : 2;
  const shown = block.courses.slice(0, limit);
  const rest = block.courses.length - shown.length;
  const label = [
    block.pool.name,
    t(DAYS[block.day]),
    t(WINDOW_LABELS[block.window]),
    t("{count} ders", { count: block.courses.length }),
  ].join(", ");

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-md ${fill ? "flex-1" : ""}`}
      style={{ backgroundColor: tintOf(true, false), borderLeft: `2.5px solid rgb(${GOLD})` }}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-label={label}
        className={`flex min-h-6 w-full flex-col justify-start gap-1 p-1.5 text-left transition-colors hover:bg-primary-500/4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-secondary-500 ${fill ? "flex-1" : ""}`}
      >
        <span className="flex items-start gap-1">
          <Layers size={10} strokeWidth={2} className="mt-px shrink-0 text-secondary-700" />
          <span className="min-w-0 flex-1 text-[9.5px] leading-tight font-semibold text-secondary-700">
            {block.pool.name}
          </span>
          <span className="shrink-0 font-mono text-[9px] text-primary-500/70">
            {t("{count} ders", { count: block.courses.length })}
          </span>
          <ChevronRight size={10} strokeWidth={2.25} className="shrink-0 text-primary-500/70" />
        </span>
        <span className="flex flex-col gap-0.5">
          {shown.map((course) => (
            <span
              key={`${course.code}-${course.slot}`}
              className="block text-[10.5px] leading-snug text-primary-600"
            >
              <span className="mr-1 font-mono text-[9px] text-primary-500/60">
                {startOf(course.slot)}
              </span>
              {course.name}
              <span className="ml-1 font-mono text-[9px] text-primary-500/60">
                {groupLabel(course.groups)}
              </span>
            </span>
          ))}
        </span>
        {rest > 0 && (
          <span className="text-[9.5px] font-semibold text-secondary-700">
            {t("+{count} ders daha", { count: rest })}
          </span>
        )}
        {showRange && (
          <span className="font-mono text-[9px] text-primary-500/70">{rangeOf(block)}</span>
        )}
      </button>
    </div>
  );
}

function LanguageTag({ english }) {
  const t = useT();
  return (
    <span
      className={`rounded-sm px-1.5 py-px text-[10.5px] font-semibold ${
        english ? "bg-secondary-500/15 text-secondary-700" : "bg-primary-500/6 text-primary-500/80"
      }`}
    >
      {english ? t("İngilizce") : t("Türkçe")}
    </span>
  );
}

function ListGroup({ group }) {
  const t = useT();
  return (
    <li className="flex flex-col gap-1.5 border-t border-primary-500/6 pt-2.5 first:border-t-0 first:pt-0">
      <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-primary-500/80">
        <span className="font-semibold text-primary-600">{t("Grup {group}", { group: group.group })}</span>
        <LanguageTag english={group.english} />
        {group.instructor && group.instructor !== "-" && (
          <span className="inline-flex items-center gap-1">
            <User size={12} strokeWidth={1.5} className="shrink-0" />
            {group.staffSlug ? (
              <Link
                href={`/personel/${group.staffSlug}`}
                className="underline decoration-primary-500/20 underline-offset-2 transition-colors hover:text-secondary-700 hover:decoration-secondary-500"
              >
                {group.instructor}
              </Link>
            ) : (
              group.instructor
            )}
          </span>
        )}
        {group.online ? (
          <span className="inline-flex items-center gap-1 text-secondary-700">
            <Wifi size={12} strokeWidth={1.75} className="shrink-0" />
            {t("Çevrimiçi")}
          </span>
        ) : (
          group.room &&
          group.room !== "-" && (
            <span className="inline-flex items-center gap-1 font-mono text-[11.5px]">
              <MapPin size={12} strokeWidth={1.5} className="shrink-0" />
              {group.room}
            </span>
          )
        )}
      </span>
      <EnrollAction entry={group} size="md" />
    </li>
  );
}

function CourseListDialog({ list, palette, courseHref, onClose }) {
  const t = useT();
  const sections = [];
  for (const course of [...(list?.courses ?? [])].sort(byTimeOrder)) {
    const range = rangeOf(course);
    const last = sections[sections.length - 1];
    if (last && last.range === range) last.courses.push(course);
    else sections.push({ range, courses: [course] });
  }

  return (
    <Modal
      open={Boolean(list)}
      onClose={onClose}
      label={list?.title ?? ""}
      contentClassName="flex items-center justify-center p-4"
    >
      {list && (
        <div className="flex max-h-[85svh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="border-b border-primary-500/8 px-5 pt-4 pb-3.5">
            {list.eyebrow && (
              <span className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-widest text-secondary-700 uppercase">
                <Layers size={12} strokeWidth={2} />
                {list.eyebrow}
              </span>
            )}
            <h2 className="mt-1 text-[16px] leading-snug font-semibold text-primary-600">{list.title}</h2>
            {list.subtitle && <p className="mt-0.5 text-[12.5px] text-primary-500/70">{list.subtitle}</p>}
          </div>
          <div className="overflow-y-auto px-5 py-4">
            <div className="flex flex-col gap-5">
              {sections.map((section) => (
                <section key={section.range} className="flex flex-col gap-2">
                  {list.courses.length > 1 && (
                    <span className="font-mono text-[11px] font-semibold text-primary-500/70">
                      {section.range}
                    </span>
                  )}
                  <ul className="flex flex-col gap-2">
                    {section.courses.map((course) => {
                      const href = courseHref?.(course.code) || null;
                      return (
                        <li
                          key={`${course.code}-${course.slot}`}
                          className="rounded-xl border border-primary-500/8 px-3.5 py-3"
                          style={{ borderLeft: `3px solid ${colorOf(palette, course.code)}` }}
                        >
                          {list.courses.length > 1 && (
                            <span className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                              <span
                                className="font-mono text-[11.5px] font-semibold"
                                style={{ color: colorOf(palette, course.code) }}
                              >
                                {course.code}
                              </span>
                              {href ? (
                                <Link
                                  href={href}
                                  className="text-[13.5px] font-semibold text-primary-600 transition-colors hover:text-secondary-700"
                                >
                                  {course.name}
                                </Link>
                              ) : (
                                <span className="text-[13.5px] font-semibold text-primary-600">{course.name}</span>
                              )}
                            </span>
                          )}
                          <ul className="flex flex-col gap-2.5">
                            {course.groups.map((group) => (
                              <ListGroup key={`${group.group}-${group.offeringId ?? ""}`} group={group} />
                            ))}
                          </ul>
                          {list.courses.length === 1 && href && (
                            <Link
                              href={href}
                              className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-secondary-700 hover:underline"
                            >
                              {t("Ders sayfası")}
                              <ArrowRight size={12} strokeWidth={2} />
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Cluster({
  clusterKey,
  cluster,
  rowStart,
  rowEnd,
  column,
  palette,
  courseHref,
  clash,
  openId,
  onOpen,
  onList,
  expanded,
  onExpand,
}) {
  const t = useT();
  const items = cluster.blocks;
  const single = items.length === 1;
  const conflict = clash && !single;
  const overflow = items.length > VISIBLE + 1;
  const shown = overflow && !expanded ? items.slice(0, VISIBLE) : items;

  return (
    <div
      className="relative z-10 flex flex-col gap-1 p-1"
      style={{
        gridColumn: column + 2,
        gridRow: `${rowStart} / ${rowEnd + 1}`,
        backgroundColor: conflict ? "rgba(180,120,20,0.05)" : undefined,
      }}
    >
      {conflict && (
        <span className="flex items-center gap-1 px-0.5 text-[9px] font-semibold tracking-wide text-amber-700 uppercase">
          <TriangleAlert size={9} strokeWidth={2.25} />
          {t("Çakışma")}
        </span>
      )}

      {shown.map((entry, index) => {
        const id = `${clusterKey}#${index}`;
        if (entry.kind === "pool") {
          return (
            <PoolStrip
              key={entry.code}
              block={entry}
              fill={single}
              showRange={!single}
              onOpen={() =>
                onList({
                  eyebrow: entry.pool.name,
                  title: `${t(DAYS[entry.day])} · ${t(WINDOW_LABELS[entry.window])}`,
                  subtitle: t("{count} ders", { count: entry.courses.length }),
                  courses: entry.courses,
                })
              }
            />
          );
        }
        const opensList = (entry.groups?.length ?? 1) > INLINE_GROUPS;
        return (
          <Strip
            key={`${entry.code}-${entry.slot}-${entry.span}`}
            entry={entry}
            color={colorOf(palette, entry.code)}
            slim={index >= VISIBLE}
            fill={single}
            showRange={!single || entry.span > 1}
            active={!opensList && openId === id}
            href={courseHref?.(entry.code) || null}
            opensList={opensList}
            onToggle={() =>
              opensList
                ? onList({
                    eyebrow: entry.pool?.name ?? null,
                    title: `${entry.code} ${entry.name}`,
                    subtitle: `${t(DAYS[entry.day])} · ${rangeOf(entry)} · ${t("{count} grup", { count: entry.groups.length })}`,
                    courses: [entry],
                  })
                : onOpen(openId === id ? null : id)
            }
          />
        );
      })}

      {overflow && (
        <button
          type="button"
          onClick={onExpand}
          aria-expanded={expanded}
          className="flex min-h-6 items-center justify-center gap-0.5 rounded-md py-1 text-[10px] font-semibold text-secondary-700 transition-colors hover:bg-secondary-500/8"
        >
          <ChevronDown
            size={10}
            strokeWidth={2.25}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? t("Daralt") : t("+{count} ders", { count: items.length - VISIBLE })}
        </button>
      )}
    </div>
  );
}

function TimeLabel({ row, children }) {
  return (
    <div
      className="sticky left-0 z-20 flex flex-col items-center justify-start bg-white pt-1.5 leading-none"
      style={{
        gridColumn: 1,
        gridRow: row,
        borderBottom: `1px solid rgba(${NAVY},0.05)`,
        borderRight: `1px solid rgba(${NAVY},0.06)`,
      }}
    >
      {children}
    </div>
  );
}

export default function WeeklySchedule({
  entries = [],
  courseHref,
  note = null,
  clash = false,
}) {
  const t = useT();
  const [openId, setOpenId] = useState(null);
  const [list, setList] = useState(null);
  const [expanded, setExpanded] = useState(() => new Set());

  const clusters = useMemo(() => buildClusters(entries), [entries]);
  const rows = useMemo(() => buildRows(entries), [entries]);
  const rowOfSlot = useMemo(
    () =>
      new Map(
        rows.flatMap((row, ri) => (row.type === "slot" ? [[row.slot, ri + 2]] : [])),
      ),
    [rows],
  );
  const dayIndexes = useMemo(() => visibleDayIndexes(entries), [entries]);
  const palette = useMemo(() => courseColors(entries), [entries]);

  useEffect(() => {
    if (!openId) return undefined;
    const onKey = (event) => event.key === "Escape" && setOpenId(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openId]);

  const toggleExpand = (key) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="overflow-hidden rounded-xl border border-primary-500/10 bg-white shadow-xs">
      <div className="border-b border-primary-500/6 px-4 py-2 text-center sm:hidden">
        <span className="text-[11px] text-primary-500/70">
          {t("← Programı görmek için yatay kaydırın →")}
        </span>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: 72 + 156 * dayIndexes.length }}>
          <div
            className="grid"
            style={{
              gridTemplateColumns: `72px repeat(${dayIndexes.length}, minmax(156px, 1fr))`,
              gridTemplateRows: `40px ${rows
                .map((row) =>
                  row.type === "edge"
                    ? "26px"
                    : row.empty
                      ? "24px"
                      : "minmax(44px, auto)",
                )
                .join(" ")}`,
            }}
          >
            <div
              className="sticky left-0 z-20 flex items-center justify-center bg-white"
              style={{
                gridColumn: 1,
                gridRow: 1,
                borderBottom: `1px solid rgba(${NAVY},0.08)`,
                borderRight: `1px solid rgba(${NAVY},0.06)`,
              }}
            >
              <span className="text-[10px] font-semibold tracking-widest text-primary-500/70 uppercase">
                {t("Saat")}
              </span>
            </div>

            {dayIndexes.map((di, col) => (
              <div
                key={DAYS[di]}
                className="flex items-center justify-center"
                style={{
                  gridColumn: col + 2,
                  gridRow: 1,
                  borderBottom: `1px solid rgba(${NAVY},0.08)`,
                  borderRight:
                    col < dayIndexes.length - 1
                      ? `1px solid rgba(${NAVY},0.05)`
                      : "none",
                }}
              >
                <span className="text-[12px] font-semibold text-primary-500">
                  {t(DAYS[di])}
                </span>
              </div>
            ))}

            {rows.flatMap((row, ri) => {
              const gridRow = ri + 2;

              if (row.type === "edge") {
                return [
                  <TimeLabel key={`edgelabel-${ri}`} row={gridRow}>
                    <span className="font-mono text-[9px] whitespace-nowrap text-primary-500/70">
                      {startOf(row.from)}
                    </span>
                  </TimeLabel>,
                  <div
                    key={`edgeband-${ri}`}
                    className="flex items-center justify-center"
                    style={{
                      gridColumn: "2 / -1",
                      gridRow,
                      backgroundColor: `rgba(${NAVY},0.02)`,
                      borderBottom: `1px solid rgba(${NAVY},0.04)`,
                    }}
                  >
                    <span className="font-mono text-[9px] tracking-wide text-primary-500/70">
                      {startOf(row.from)} – {endOf(row.to)} · {t("ders yok")}
                    </span>
                  </div>,
                ];
              }

              if (row.empty) {
                return [
                  <TimeLabel key={`emptylabel-${ri}`} row={gridRow}>
                    <span className="font-mono text-[9px] whitespace-nowrap text-primary-500/70">
                      {startOf(row.slot)}
                    </span>
                  </TimeLabel>,
                  <div
                    key={`emptyband-${ri}`}
                    style={{
                      gridColumn: "2 / -1",
                      gridRow,
                      backgroundColor: `rgba(${NAVY},0.015)`,
                      borderBottom: `1px solid rgba(${NAVY},0.04)`,
                    }}
                  />,
                ];
              }

              return [
                <TimeLabel key={`slotlabel-${ri}`} row={gridRow}>
                  <span className="font-mono text-[10.5px] font-semibold whitespace-nowrap text-primary-500/70">
                    {startOf(row.slot)}
                  </span>
                  <span className="mt-0.5 font-mono text-[8.5px] whitespace-nowrap text-primary-500/70">
                    {endOf(row.slot)}
                  </span>
                </TimeLabel>,
                ...dayIndexes.map((di, col) => (
                  <div
                    key={`bg-${di}-${row.slot}`}
                    style={{
                      gridColumn: col + 2,
                      gridRow,
                      backgroundColor: ri % 2 === 1 ? `rgba(${NAVY},0.012)` : "transparent",
                      borderBottom: `1px solid rgba(${NAVY},0.05)`,
                      borderRight:
                        col < dayIndexes.length - 1 ? `1px solid rgba(${NAVY},0.04)` : "none",
                    }}
                  />
                )),
              ];
            })}

            {dayIndexes.flatMap((di, col) =>
              (clusters.get(di) ?? []).map((cluster) => {
                const key = `${di}-${cluster.from}`;
                return (
                  <Cluster
                    key={`cluster-${key}`}
                    clusterKey={key}
                    cluster={cluster}
                    rowStart={rowOfSlot.get(cluster.from)}
                    rowEnd={rowOfSlot.get(cluster.to)}
                    column={col}
                    palette={palette}
                    courseHref={courseHref}
                    clash={clash}
                    openId={openId}
                    onOpen={setOpenId}
                    onList={setList}
                    expanded={expanded.has(key)}
                    onExpand={() => toggleExpand(key)}
                  />
                );
              }),
            )}
          </div>
        </div>
      </div>

      <CourseListDialog
        list={list}
        palette={palette}
        courseHref={courseHref}
        onClose={() => setList(null)}
      />

      {note && (
        <div className="border-t border-primary-500/6 px-4 py-2.5 text-center">
          <span className="text-[11px] text-primary-500/70">{t(note)}</span>
        </div>
      )}

      {entries.length === 0 && (
        <div className="border-t border-primary-500/6 py-12 text-center">
          <span className="text-[13px] text-primary-500/70">
            {t("Bu program için ders bulunmuyor.")}
          </span>
        </div>
      )}
    </div>
  );
}
