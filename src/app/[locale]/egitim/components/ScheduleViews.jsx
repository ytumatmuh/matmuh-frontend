"use client";

import { useMemo, useState } from "react";
import Link from "@/app/components/LocaleLink";
import {
  CalendarRange,
  Check,
  ChevronDown,
  Layers,
  List,
  MapPin,
  Search,
  SlidersHorizontal,
  User,
  Wifi,
  X,
} from "lucide-react";

import { DAYS, TIME_SLOTS } from "@/data/schedule-grid";
import { MyScheduleProvider, useMySchedule } from "@/data/useMySchedule";
import { WINDOW_LABELS, kindOf, poolBlocks } from "@/data/schedule-pool";
import { blockStyle, colorOf, courseColors } from "@/data/schedule-colors";
import WeeklySchedule from "./WeeklySchedule";
import { useT } from "@/i18n/useT";

const VIEWS = [
  { id: "grid", label: "Izgara", icon: CalendarRange },
  { id: "list", label: "Liste", icon: List },
];

const LANGUAGES = [
  { id: "all", label: "Tümü" },
  { id: "tr", label: "Türkçe" },
  { id: "en", label: "İngilizce" },
];

const FOLD = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };

const fold = (text) =>
  String(text ?? "")
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşüâîû]/g, (char) => FOLD[char]);

const byQuery = (query) => {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return () => true;
  return (entry) => {
    const haystack = fold(
      [entry.code, entry.name, entry.instructor, entry.room, entry.pool?.name].join(" "),
    );
    return words.every((word) => haystack.includes(word));
  };
};

function SearchField({ value, onChange, className = "" }) {
  const t = useT();
  return (
    <label className={`relative flex items-center ${className}`}>
      <Search size={13} strokeWidth={2} className="pointer-events-none absolute left-2.5 text-primary-500/50" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("Ders, öğretim elemanı")}
        aria-label={t("Programda ara")}
        className="h-8 w-full rounded-md border border-primary-500/12 bg-white pr-7 pl-8 text-[12px] text-primary-600 placeholder:text-primary-500/50 focus:border-secondary-500/60 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
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

const byLanguage = (language) => (entry) =>
  language === "all" || (language === "en" ? entry.english : !entry.english);

const rangeOf = (entry) => {
  const start = TIME_SLOTS[entry.slot]?.split(" - ")[0] ?? "";
  const end = TIME_SLOTS[entry.slot + entry.span - 1]?.split(" - ")[1] ?? "";
  return `${start} – ${end}`;
};

function dayBlocks(entries) {
  return DAYS.map((label, index) => {
    const blocks = new Map();
    for (const entry of entries) {
      if (entry.day !== index) continue;
      const key = `${entry.slot}|${entry.span}|${entry.code}`;
      if (!blocks.has(key)) blocks.set(key, { ...entry, groups: [] });
      blocks.get(key).groups.push(entry);
    }
    const courses = [...blocks.values()].map((block) => ({
      ...block,
      english: block.groups.every((group) => group.english),
      groups: block.groups.sort((a, b) => (a.group || 0) - (b.group || 0)),
    }));
    const list = poolBlocks(courses).sort(
      (a, b) =>
        a.slot - b.slot ||
        (a.kind === "pool") - (b.kind === "pool") ||
        a.code.localeCompare(b.code, "tr"),
    );
    return { label, blocks: list };
  }).filter((day) => day.blocks.length > 0);
}

function Empty() {
  const t = useT();
  return (
    <div className="rounded-xl border border-primary-500/8 bg-white py-12 text-center">
      <span className="text-[13px] text-primary-500/70">
        {t("Bu dönem için ders bulunamadı.")}
      </span>
    </div>
  );
}

function Note({ note }) {
  const t = useT();
  if (!note) return null;
  return (
    <div className="border-t border-primary-500/6 px-4 py-2.5 text-center">
      <span className="text-[11px] text-primary-500/70">{t(note)}</span>
    </div>
  );
}

function GroupLine({ group, showEnglish }) {
  const t = useT();
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-primary-500/70">
      <span className="font-mono text-[10px] text-primary-500/70">
        Gr.{group.group}
        {showEnglish && group.english && (
          <span className="ml-1 font-semibold tracking-wide text-secondary-700">EN</span>
        )}
      </span>
      {group.instructor && group.instructor !== "-" && (
        <span className="inline-flex min-w-0 items-center gap-1">
          <User size={11} strokeWidth={1.5} className="shrink-0" />
          {group.staffSlug ? (
            <Link
              href={`/personel/${group.staffSlug}`}
              className="relative z-10 wrap-break-word underline decoration-primary-500/20 underline-offset-2 transition-colors hover:text-secondary-700 hover:decoration-secondary-500"
            >
              {group.instructor}
            </Link>
          ) : (
            <span className="wrap-break-word">{group.instructor}</span>
          )}
        </span>
      )}
      {group.online ? (
        <span className="inline-flex items-center gap-1">
          <Wifi size={11} strokeWidth={1.5} /> {t("Çevrimiçi")}
        </span>
      ) : (
        group.room &&
        group.room !== "-" && (
          <span className="inline-flex items-center gap-1 font-mono">
            <MapPin size={11} strokeWidth={1.5} className="shrink-0" />
            {group.room}
          </span>
        )
      )}
    </span>
  );
}

function ListRow({ block, accent, courseHref }) {
  const isElective = block.type === "Seçmeli";
  const href = courseHref?.(block.code) || null;
  const mixed = !block.english && block.groups.some((group) => group.english);

  const body = (
    <div
      className="relative flex items-start gap-3 rounded-lg px-3 py-2.5 transition-[filter] hover:brightness-95 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-secondary-500"
      style={blockStyle(isElective, accent)}
    >
      <span className="w-22 shrink-0 font-mono text-[11px] leading-snug text-primary-500/70">
        {rangeOf(block)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-1.5">
          <span className="font-mono text-[11px] font-semibold" style={{ color: accent }}>
            {block.code}
          </span>
          {href ? (
            <Link
              href={href}
              className="text-[13px] font-medium text-primary-600 outline-none after:absolute after:inset-0 after:rounded-lg"
            >
              {block.name}
            </Link>
          ) : (
            <span className="text-[13px] font-medium text-primary-600">{block.name}</span>
          )}
          {block.english && (
            <span className="font-mono text-[9.5px] font-semibold tracking-wide text-secondary-700">
              EN
            </span>
          )}
        </span>

        <span className="mt-1 flex flex-col gap-0.5">
          {block.groups.map((group) => (
            <GroupLine key={`${group.group}-${group.offeringId ?? ""}`} group={group} showEnglish={mixed} />
          ))}
        </span>
      </span>
    </div>
  );

  return <li>{body}</li>;
}

const previewOf = (block, count) => {
  const names = [...new Set(block.courses.map((course) => course.name))];
  const shown = names.slice(0, count).join(", ");
  return names.length > count ? `${shown} +${names.length - count}` : shown;
};

function PoolListItem({ block, palette, courseHref }) {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <li>
      <div
        className="rounded-lg"
        style={blockStyle(true, "var(--color-secondary-500)")}
      >
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
        >
          <span className="flex w-22 shrink-0 flex-col text-[11px] leading-snug text-primary-500/70">
            {t(WINDOW_LABELS[block.window])}
            <span className="font-mono text-[10px]">{rangeOf(block)}</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-secondary-700">
              <Layers size={12} strokeWidth={2} className="shrink-0" />
              {block.pool.name}
            </span>
            <span className="mt-0.5 block text-[11.5px] leading-snug text-primary-500/70">
              {t("{count} ders", { count: block.courses.length })} · {previewOf(block, 2)}
            </span>
          </span>
          <ChevronDown
            size={15}
            className={`mt-0.5 shrink-0 text-primary-500/70 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <ul className="flex flex-col gap-1 px-1 pb-1">
            {block.courses.map((course) => (
              <ListRow
                key={`${course.code}-${course.slot}-${course.span}`}
                block={course}
                accent={colorOf(palette, course.code)}
                courseHref={courseHref}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function ScheduleList({ entries, courseHref, note, palette: fixedPalette }) {
  const t = useT();
  const ownPalette = useMemo(() => courseColors(entries), [entries]);
  const palette = fixedPalette ?? ownPalette;
  const days = useMemo(() => dayBlocks(entries), [entries]);

  if (days.length === 0) return <Empty />;

  return (
    <div className="overflow-hidden rounded-xl border border-primary-500/8 bg-white">
      <div className="divide-y divide-primary-500/6">
        {days.map((day) => (
          <div key={day.label}>
            <div className="bg-primary-500/2 px-4 py-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-primary-500/70">
                {t(day.label)}
              </span>
            </div>
            <ul className="flex flex-col gap-1 p-1">
              {day.blocks.map((block) =>
                block.kind === "pool" ? (
                  <PoolListItem
                    key={block.code}
                    block={block}
                    palette={palette}
                    courseHref={courseHref}
                  />
                ) : (
                  <ListRow
                    key={`${block.code}-${block.slot}-${block.span}`}
                    block={block}
                    accent={colorOf(palette, block.code)}
                    courseHref={courseHref}
                  />
                ),
              )}
            </ul>
          </div>
        ))}
      </div>
      <Note note={note} />
    </div>
  );
}

const TH =
  "px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-primary-500/40";
const TD = "px-3 py-2 align-top";

function ScheduleTable({ entries, courseHref, note, palette: fixedPalette }) {
  const t = useT();
  const ownPalette = useMemo(() => courseColors(entries), [entries]);
  const palette = fixedPalette ?? ownPalette;
  const days = useMemo(() => dayBlocks(entries), [entries]);
  const [openPools, setOpenPools] = useState(() => new Set());

  const togglePool = (key) =>
    setOpenPools((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const courseRows = (block) => {
    const href = courseHref?.(block.code) || null;
    const accent = colorOf(palette, block.code);
    return block.groups.map((group, index) => {
      const first = index === 0;
      const last = index === block.groups.length - 1;
      return (
        <tr
          key={`${block.code}-${block.slot}-${group.group}-${group.offeringId ?? ""}`}
          className={last ? "border-b border-primary-500/5" : ""}
        >
          <td
            className={`${TD} font-mono text-[11.5px] whitespace-nowrap text-primary-500/70`}
            style={{ boxShadow: `inset 2.5px 0 0 ${accent}` }}
          >
            {first ? rangeOf(block) : ""}
          </td>
          <td className={TD}>
            {first && (
              <span className="flex flex-wrap items-baseline gap-x-2">
                {href ? (
                  <Link
                    href={href}
                    className="font-mono text-[12px] font-medium tracking-wide text-secondary-600 hover:underline"
                  >
                    {block.code}
                  </Link>
                ) : (
                  <span className="font-mono text-[12px] font-medium tracking-wide text-secondary-600">
                    {block.code}
                  </span>
                )}
                <span className="text-[13px] text-primary-600">{block.name}</span>
              </span>
            )}
          </td>
          <td className={`${TD} font-mono text-[11.5px] whitespace-nowrap text-primary-500/70`}>
            {group.group}
            {group.english && (
              <span className="ml-1.5 font-semibold tracking-wide text-secondary-700">EN</span>
            )}
          </td>
          <td className={`${TD} font-mono text-[11.5px] text-primary-500/70`}>
            {group.online ? t("Çevrimiçi") : group.room !== "-" ? group.room : ""}
          </td>
          <td className={`${TD} text-[12.5px] text-primary-600`}>
            {group.instructor === "-" ? null : group.staffSlug ? (
              <Link
                href={`/personel/${group.staffSlug}`}
                className="transition-colors hover:text-secondary-700 hover:underline"
              >
                {group.instructor}
              </Link>
            ) : (
              group.instructor
            )}
          </td>
        </tr>
      );
    });
  };

  const poolRows = (block, key) => {
    const open = openPools.has(key);
    return [
      <tr key={key} className="border-b border-primary-500/5">
        <td
          className={`${TD} text-[11.5px] whitespace-nowrap text-primary-500/70`}
          style={{ boxShadow: "inset 2.5px 0 0 var(--color-secondary-500)" }}
        >
          <span className="flex flex-col">
            {t(WINDOW_LABELS[block.window])}
            <span className="font-mono text-[11px]">{rangeOf(block)}</span>
          </span>
        </td>
        <td className={TD} colSpan={4}>
          <button
            type="button"
            onClick={() => togglePool(key)}
            aria-expanded={open}
            className="flex w-full items-start gap-2 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
          >
            <Layers size={13} strokeWidth={2} className="mt-0.5 shrink-0 text-secondary-700" />
            <span className="min-w-0 flex-1">
              <span className="text-[13px] font-semibold text-secondary-700">{block.pool.name}</span>
              <span className="ml-2 text-[12px] text-primary-500/70">
                {t("{count} ders", { count: block.courses.length })}
              </span>
              <span className="block text-[12px] leading-snug text-primary-500/60">
                {previewOf(block, 3)}
              </span>
            </span>
            <ChevronDown
              size={15}
              className={`mt-0.5 shrink-0 text-primary-500/70 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        </td>
      </tr>,
      ...(open ? block.courses.flatMap((course) => courseRows(course)) : []),
    ];
  };


  if (days.length === 0) return <Empty />;

  return (
    <div className="overflow-hidden rounded-xl border border-primary-500/10 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-176 table-fixed border-collapse">
          <colgroup>
            <col className="w-30" />
            <col />
            <col className="w-20" />
            <col className="w-28" />
            <col className="w-[30%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-primary-500/6">
              <th scope="col" className={TH}>{t("Saat")}</th>
              <th scope="col" className={TH}>{t("Ders")}</th>
              <th scope="col" className={TH}>{t("Grup")}</th>
              <th scope="col" className={TH}>{t("Derslik")}</th>
              <th scope="col" className={TH}>{t("Öğretim Elemanı")}</th>
            </tr>
          </thead>
          {days.map((day) => (
            <tbody key={day.label}>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={5}
                  className="border-y border-primary-500/6 bg-primary-500/2 px-3 py-1.5 text-left"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-1 rounded-full bg-secondary-500" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-primary-700">
                      {t(day.label)}
                    </span>
                  </span>
                </th>
              </tr>
              {day.blocks.flatMap((block) =>
                block.kind === "pool"
                  ? poolRows(block, `${day.label}-${block.code}`)
                  : courseRows(block),
              )}
            </tbody>
          ))}
        </table>
      </div>
      <Note note={note} />
    </div>
  );
}

export default function ScheduleViews(props) {
  return (
    <MyScheduleProvider>
      <ScheduleBody {...props} />
    </MyScheduleProvider>
  );
}

const KIND_LABELS = { required: "Zorunlu", elective: "Bölüm seçmelisi" };
const KIND_ORDER = (id) => (id === "required" ? 0 : id === "elective" ? 1 : 2);

function kindOptions(entries) {
  const kinds = new Map();
  for (const entry of entries) {
    const id = kindOf(entry);
    if (!kinds.has(id)) {
      kinds.set(id, { id, label: entry.pool?.name ?? KIND_LABELS[id], codes: new Set() });
    }
    kinds.get(id).codes.add(entry.code);
  }
  return [...kinds.values()]
    .map(({ id, label, codes }) => ({ id, label, count: codes.size }))
    .sort((a, b) => KIND_ORDER(a.id) - KIND_ORDER(b.id) || a.label.localeCompare(b.label, "tr"));
}

const SEGMENT = (active) =>
  `rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
    active
      ? "bg-secondary-500/12 text-secondary-700"
      : "text-primary-500/70 hover:bg-primary-500/4 hover:text-primary-500"
  }`;

function LanguageSegments({ language, onLanguage, className = "" }) {
  const t = useT();
  return (
    <div role="group" aria-label={t("Eğitim dili")} className={`items-center gap-1.5 ${className}`}>
      {LANGUAGES.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onLanguage(option.id)}
          aria-pressed={language === option.id}
          className={SEGMENT(language === option.id)}
        >
          {t(option.label)}
        </button>
      ))}
    </div>
  );
}

function FilterPanel({
  kinds,
  hidden,
  onToggleKind,
  fit,
  onFit,
  onReset,
  active,
  query,
  onQuery,
  language,
  onLanguage,
}) {
  const t = useT();
  return (
    <div
      id="schedule-filters"
      className="flex flex-col gap-3.5 rounded-xl border border-primary-500/10 bg-white px-4 py-3.5 shadow-xs"
    >
      <SearchField value={query} onChange={onQuery} className="sm:hidden" />
      <div className="flex flex-col gap-2 sm:hidden">
        <span className="text-[10.5px] font-semibold tracking-widest text-primary-500/60 uppercase">
          {t("Eğitim dili")}
        </span>
        <LanguageSegments language={language} onLanguage={onLanguage} className="flex" />
      </div>
      {kinds.length <= 1 && (
        <p className="text-[11.5px] text-primary-500/70">
          {t("Bu sınıfta süzülecek başka ders türü yok.")}
        </p>
      )}

      {kinds.length > 1 && (
        <div role="group" aria-label={t("Ders türü")} className="flex flex-col gap-2">
          <span className="text-[10.5px] font-semibold tracking-widest text-primary-500/60 uppercase">
            {t("Ders türü")}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {kinds.map((kind) => {
              const shown = !hidden.has(kind.id);
              return (
                <button
                  key={kind.id}
                  type="button"
                  onClick={() => onToggleKind(kind.id)}
                  aria-pressed={shown}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    shown
                      ? "border-secondary-500/40 bg-secondary-500/10 text-secondary-700"
                      : "border-primary-500/10 text-primary-500/60 hover:border-primary-500/20 hover:text-primary-500"
                  }`}
                >
                  {shown && <Check size={12} strokeWidth={2.5} />}
                  {kind.id.startsWith("pool:") && !shown && <Layers size={12} strokeWidth={2} />}
                  {t(kind.label)}
                  <span className="font-mono text-[10.5px] opacity-70">{kind.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {fit.available ? (
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={fit.on}
            onChange={(event) => onFit(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-[var(--color-secondary-600)]"
          />
          <span className="flex flex-col">
            <span className="text-[12.5px] font-medium text-primary-600">
              {t("Yalnızca programımla çakışmayanlar")}
            </span>
            <span className="text-[11.5px] text-primary-500/70">
              {t("Programına eklediğin derslerle aynı saatte olanlar gizlenir.")}
            </span>
          </span>
        </label>
      ) : (
        fit.hint && <p className="text-[11.5px] text-primary-500/70">{t(fit.hint)}</p>
      )}

      {active > 0 && (
        <button
          type="button"
          onClick={onReset}
          className="self-start text-[12px] font-medium text-secondary-700 hover:underline"
        >
          {t("Filtreleri temizle")}
        </button>
      )}
    </div>
  );
}

function ScheduleBody({ entries = [], courseHref, note = null, legend = null, elsewhere = [], onElsewhere }) {
  const t = useT();
  const my = useMySchedule();
  const [view, setView] = useState("grid");
  const [language, setLanguage] = useState("all");
  const [hidden, setHidden] = useState(() => new Set());
  const [fitOnly, setFitOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");

  const kinds = useMemo(() => kindOptions(entries), [entries]);
  const palette = useMemo(() => courseColors(entries), [entries]);
  const canFit = my?.status === "ready" && my.rows.length > 0;
  const fitting = fitOnly && canFit;
  const searching = query.trim().length > 0;
  const active =
    [...hidden].filter((id) => kinds.some((kind) => kind.id === id)).length + (fitting ? 1 : 0);
  const phoneActive = active + (language === "all" ? 0 : 1);

  const shown = useMemo(
    () =>
      entries
        .filter(byLanguage(language))
        .filter(byQuery(query))
        .filter((entry) => !hidden.has(kindOf(entry)))
        .filter(
          (entry) =>
            !fitting || my.isEnrolled(entry.offeringId) || !my.clashOf(entry),
        ),
    [entries, language, hidden, fitting, my, query],
  );

  const matches = useMemo(() => new Set(shown.map((entry) => entry.code)).size, [shown]);
  const others = useMemo(() => {
    if (!searching) return [];
    const match = byQuery(query);
    return elsewhere
      .map((scope) => ({
        ...scope,
        count: new Set(scope.entries.filter(match).map((entry) => entry.code)).size,
      }))
      .filter((scope) => scope.count > 0);
  }, [elsewhere, searching, query]);

  const toggleKind = (id) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const fit = {
    available: canFit,
    on: fitOnly,
    hint:
      my?.status === "signed-out"
        ? "Giriş yapıp programına ders eklersen yalnızca çakışmayanları gösterebilirsin."
        : my?.status === "ready"
          ? "Programına ders ekledikçe yalnızca çakışmayanları gösterebilirsin."
          : my?.status === "error"
            ? "Programın alınamadı; çakışma süzgeci şu an kullanılamıyor."
            : "Programın yükleniyor…",
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        {legend ? <div className="min-w-0">{legend}</div> : <span />}
        <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
          <SearchField value={query} onChange={setQuery} className="hidden w-48 sm:flex" />
          <span aria-hidden className="mx-1 hidden h-4 w-px bg-primary-500/10 sm:block" />
          <LanguageSegments language={language} onLanguage={setLanguage} className="hidden sm:flex" />
          <span aria-hidden className="mx-1 hidden h-4 w-px bg-primary-500/10 sm:block" />
          <button
            type="button"
            onClick={() => setFiltersOpen((prev) => !prev)}
            aria-expanded={filtersOpen}
            aria-controls="schedule-filters"
            className={`inline-flex items-center gap-1.5 ${SEGMENT(filtersOpen)}`}
          >
            <SlidersHorizontal size={13} strokeWidth={2} />
            {t("Filtreler")}
            {phoneActive > 0 && (
              <span className="rounded-full bg-secondary-500 px-1.5 text-[10.5px] leading-4 font-semibold text-primary-600 sm:hidden">
                {phoneActive}
              </span>
            )}
            {active > 0 && (
              <span className="hidden rounded-full bg-secondary-500 px-1.5 text-[10.5px] leading-4 font-semibold text-primary-600 sm:inline">
                {active}
              </span>
            )}
          </button>
          <span aria-hidden className="mx-1 h-4 w-px bg-primary-500/10" />
          <div role="group" aria-label={t("Görünüm")} className="flex items-center gap-1.5">
            {VIEWS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                aria-pressed={view === id}
                aria-label={t(label)}
                title={t(label)}
                className={`inline-flex items-center gap-1.5 ${SEGMENT(view === id)}`}
              >
                <Icon size={13} strokeWidth={2} />
                <span className="hidden sm:inline">{t(label)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtersOpen && (
        <FilterPanel
          kinds={kinds}
          hidden={hidden}
          onToggleKind={toggleKind}
          fit={fit}
          onFit={setFitOnly}
          onReset={() => {
            setHidden(new Set());
            setFitOnly(false);
            setLanguage("all");
          }}
          active={phoneActive}
          language={language}
          onLanguage={setLanguage}
          query={query}
          onQuery={setQuery}
        />
      )}

      {searching && (
        <p role="status" className="flex flex-wrap items-center gap-x-2 px-1 text-[12px] text-primary-500/75">
          {matches > 0
            ? t("“{query}” için {count} ders", { query: query.trim(), count: matches })
            : t("“{query}” ile eşleşen ders yok.", { query: query.trim() })}
          {others.length > 0 && (
            <span className="flex flex-wrap items-center gap-1.5">
              {t("Diğer sınıflarda:")}
              {others.map((scope) => (
                <button
                  key={scope.id}
                  type="button"
                  onClick={() => onElsewhere?.(scope.id)}
                  className="rounded-md bg-secondary-500/10 px-2 py-0.5 font-medium text-secondary-700 transition-colors hover:bg-secondary-500/20"
                >
                  {scope.label} · {scope.count}
                </button>
              ))}
            </span>
          )}
          <button
            type="button"
            onClick={() => setQuery("")}
            className="font-medium text-secondary-700 hover:underline"
          >
            {t("Aramayı temizle")}
          </button>
        </p>
      )}

      {view === "grid" ? (
        <WeeklySchedule entries={shown} palette={palette} courseHref={courseHref} note={note} />
      ) : (
        <>
          <div className="hidden md:block">
            <ScheduleTable entries={shown} palette={palette} courseHref={courseHref} note={note} />
          </div>
          <div className="md:hidden">
            <ScheduleList entries={shown} palette={palette} courseHref={courseHref} note={note} />
          </div>
        </>
      )}
    </div>
  );
}
