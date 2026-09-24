import { cache } from "react";

import { getElectiveGroups, getLectures, localized } from "./curriculum.js";
import { getStaff } from "@/app/lib/staff.js";
import {
  DAY_KEYS,
  DAYS,
  FIRST_HOUR,
  TIME_SLOTS,
  coalesceEntries,
  weeklySlots,
  weeklyTerm,
} from "./schedule-grid.js";

const SEMESTER_LABEL = { FALL: "Güz", SPRING: "Bahar", SUMMER: "Yaz" };

const DEPARTMENT_PREFIX = "MTM";

const prefixOf = (code) => String(code ?? "").toUpperCase().replace(/\d.*$/, "");

function poolFinder(groups) {
  const pools = groups.filter((group) => {
    const options = group.options ?? [];
    const outside = options.filter((option) => prefixOf(option.code) !== DEPARTMENT_PREFIX);
    return outside.length * 2 > options.length;
  });

  const byCode = new Map();
  const byPrefix = new Map();
  for (const pool of pools) {
    for (const option of pool.options ?? []) {
      const code = String(option.code ?? "").toUpperCase();
      if (!byCode.has(code)) byCode.set(code, pool);
      const counts = byPrefix.get(prefixOf(code)) ?? new Map();
      counts.set(pool, (counts.get(pool) ?? 0) + 1);
      byPrefix.set(prefixOf(code), counts);
    }
  }

  return (code, lecture) => {
    const key = String(code ?? "").toUpperCase();
    if (prefixOf(key) === DEPARTMENT_PREFIX || lecture?.term || lecture?.type === "REQUIRED") return null;
    if (byCode.has(key)) return byCode.get(key);
    if (lecture?.type !== "ELECTIVE") return null;
    const counts = byPrefix.get(prefixOf(key));
    if (!counts) return null;
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  };
}

const minutes = (time) => {
  const [h, m] = String(time ?? "").split(":");
  return Number(h) * 60 + Number(m ?? 0);
};

export function termLabel(term) {
  if (!term) return null;
  const semester = SEMESTER_LABEL[term.semester] ?? term.semester;
  return `${term.academicYear} ${semester} Yarıyılı`;
}

function degreeOf(lecture, code) {
  if (lecture?.degreeLevels?.length > 0) return lecture.degreeLevels;
  const number = Number(/(\d{4})/.exec(code ?? "")?.[1]);
  if (!number || number < 1000) return [];
  if (number < 5000) return ["UNDERGRADUATE"];
  if (number < 6000) return ["MASTERS"];
  return ["DOCTORATE"];
}

function toEntry(slot, lecture, pool, locale) {
  const day = DAY_KEYS.indexOf(slot.dayOfWeek);
  if (day === -1) return null;

  const start = minutes(slot.startTime);
  const end = minutes(slot.endTime);
  const index = Math.round((start - FIRST_HOUR * 60) / 60);
  if (index < 0 || index >= TIME_SLOTS.length) return null;

  return {
    id: slot.id,
    offeringId: slot.offeringId ?? null,
    day,
    slot: index,
    span: Math.max(1, Math.ceil((end - start) / 60)),
    code: slot.lectureCode ?? "",
    name: localized(lecture?.name ?? slot.lectureName, lecture?.nameEn, locale) ?? slot.lectureCode ?? "",
    group: slot.groupNumber ?? 1,
    instructor: slot.staffName || "-",
    staffId: slot.staffId ?? null,
    room: slot.classroom || "-",
    online: Boolean(slot.online),
    english: slot.language === "ENGLISH",
    type: lecture?.type === "ELECTIVE" || pool ? "Seçmeli" : "Zorunlu",
    pool: pool
      ? { id: pool.code, name: localized(pool.name, pool.nameEn, locale), term: pool.term ?? null }
      : null,
    term: slot.term ?? lecture?.term ?? pool?.term ?? null,
    degreeLevels: degreeOf(lecture, slot.lectureCode),
  };
}

const empty = { term: null, entries: [] };

export const getWeeklySchedule = cache(
  async ({ academicYear, semester, staffId, locale } = {}) => {
    const params = new URLSearchParams();
    if (academicYear) params.set("academicYear", academicYear);
    if (semester) params.set("semester", semester);
    if (staffId) params.set("staffId", staffId);
    const query = params.size > 0 ? `?${params}` : "";

    const res = await fetch(`${process.env.CMS_URL}/calendar/weekly${query}`, {
      next: { revalidate: 3600, tags: ["schedule"] },
    }).catch(() => null);

    if (!res?.ok) return empty;

    const body = await res.json().catch(() => null);
    const slots = weeklySlots(body);
    if (!Array.isArray(slots) || slots.length === 0) return empty;

    const [lectures, staff, groups] = await Promise.all([
      getLectures(),
      getStaff(),
      getElectiveGroups(),
    ]);
    const byCode = new Map(lectures.map((l) => [l.code?.toUpperCase(), l]));
    const poolOf = poolFinder(groups);
    const slugById = new Map(staff.map((person) => [person.id, person.slug]));

    const entries = coalesceEntries(
      slots
        .map((slot) => {
          const lecture = byCode.get(slot.lectureCode?.toUpperCase());
          return toEntry(slot, lecture, poolOf(slot.lectureCode, lecture), locale);
        })
        .map((entry) =>
          entry ? { ...entry, staffSlug: slugById.get(entry.staffId) ?? null } : entry,
        )
        .filter(Boolean),
    );

    const term =
      weeklyTerm(body) ?? (academicYear && semester ? { academicYear, semester } : null);
    return { term, entries };
  },
);

export const getCourseSections = cache(async (code) => {
  if (!code) return [];
  const { entries } = await getWeeklySchedule();
  const wanted = String(code).toUpperCase();

  const sections = new Map();
  for (const entry of entries) {
    if (entry.code.toUpperCase() !== wanted) continue;
    if (!sections.has(entry.group)) {
      sections.set(entry.group, {
        groupNo: entry.group,
        offeringId: entry.offeringId,
        instructor: entry.instructor,
        staffId: entry.staffId,
        staffSlug: entry.staffSlug,
        english: entry.english,
        schedule: [],
      });
    }
    sections.get(entry.group).schedule.push({
      day: DAYS[entry.day],
      dayIndex: entry.day,
      startMin: (FIRST_HOUR + entry.slot) * 60,
      endMin: (FIRST_HOUR + entry.slot + entry.span) * 60,
      time: `${TIME_SLOTS[entry.slot].split(" - ")[0]} - ${TIME_SLOTS[entry.slot + entry.span - 1].split(" - ")[1]}`,
      room: entry.room,
      online: entry.online,
    });
  }

  return [...sections.values()].sort((a, b) => a.groupNo - b.groupNo);
});
