import { cache } from "react";
import { getCmsCollection, getCmsCollectionItem } from "inscribed/server";

import { cmsConfig } from "@/app/lib/cms-config.js";

const PAGE = 100;
const TERMS = [1, 2, 3, 4, 5, 6, 7, 8];
const GRADUATE_TERMS = [1, 2, 3];
const GRADUATE_TERM_LABEL = {
  1: { year: 1, season: "Güz" },
  2: { year: 1, season: "Bahar" },
  3: { year: 2, season: "Güz ve Bahar" },
};
const GRADUATE_LEVELS = ["MASTERS", "DOCTORATE"];

const emptyPage = { items: [], total: 0 };

function semesterLabel(term, graduate) {
  if (graduate) return GRADUATE_TERM_LABEL[term] ?? { year: term, season: "Güz" };
  return { year: Math.ceil(term / 2), season: term % 2 === 1 ? "Güz" : "Bahar" };
}

function semesterName(term, graduate) {
  const { year, season } = semesterLabel(term, graduate);
  return `${year}. Yıl - ${season} Yarıyılı`;
}

const isGraduate = (entry) =>
  (entry.degreeLevels ?? []).some((level) => GRADUATE_LEVELS.includes(level));

const matchesProgram = (entry, graduate) => (graduate ? isGraduate(entry) : !isGraduate(entry));

function hoursOf(lecture) {
  const { theoryHours: t, practiceHours: p, labHours: l } = lecture;
  if (t == null && p == null && l == null) return null;
  return `${t ?? 0}+${p ?? 0}+${l ?? 0}`;
}

function uniform(values) {
  const seen = new Set(values.filter((v) => v != null));
  return seen.size === 1 ? [...seen][0] : null;
}

const fetchAll = cache(async (key) => {
  const out = [];
  for (let offset = 0; ; offset += PAGE) {
    const page = await getCmsCollection(cmsConfig, key, { limit: PAGE, offset }).catch(
      () => emptyPage,
    );
    out.push(...(page.items ?? []));
    if (out.length >= (page.total ?? 0) || (page.items ?? []).length === 0) break;
  }
  return out;
});

export const getLectures = cache(async () =>
  (await fetchAll("lectures")).map((item) => ({ ...item.data, slug: item.slug })),
);

export const getElectiveGroups = cache(async () =>
  (await fetchAll("elective-groups")).map((item) => ({ ...item.data, slug: item.slug })),
);

const linksOffsite = (lecture) => !lecture.about && Boolean(lecture.bolognaLink);

const bolognaHref = (link, locale) =>
  link && locale === "en" && !/[?&]lang=/.test(link) ? `${link}&lang=en` : link;

export const localized = (tr, en, locale) =>
  locale === "en" && typeof en === "string" && en.trim() ? en : tr;

function courseRow(lecture, locale) {
  const internal = `/egitim/mufredat/${lecture.code}`;
  const offsite = linksOffsite(lecture);
  return {
    isGroup: false,
    code: lecture.code,
    name: localized(lecture.name ?? lecture.code, lecture.nameEn, locale).trim(),
    hours: hoursOf(lecture) ?? "-",
    ects: lecture.ects ?? "-",
    status: lecture.type === "REQUIRED" ? "Zorunlu" : "Seçmeli",
    href: offsite ? bolognaHref(lecture.bolognaLink, locale) : internal,
    external: offsite,
  };
}

function groupRow(group, byId, locale) {
  const options = (group.options ?? []).map((o) => byId.get(o.id)).filter(Boolean);
  const rows = options.map((lecture) => courseRow(lecture, locale));
  return {
    isGroup: true,
    code: group.code,
    groupTitle: localized(group.name, group.nameEn, locale),
    note: localized(group.about, group.aboutEn, locale) || null,
    hours: group.weeklyHours ?? uniform(options.map(hoursOf)) ?? "-",
    ects: group.ects ?? uniform(options.map((o) => o.ects)) ?? "-",
    selectionCount: group.selectionCount ?? 1,
    options: rows,
  };
}

const byCode = (a, b) => a.code.localeCompare(b.code, "tr");

export const getCurriculum = cache(async (locale = "tr", graduate = false) => {
  const [allLectures, allGroups] = await Promise.all([getLectures(), getElectiveGroups()]);
  const lectures = allLectures.filter((l) => matchesProgram(l, graduate));
  const groups = allGroups.filter((g) => matchesProgram(g, graduate));

  const byId = new Map(allLectures.map((l) => [l.id, l]));
  const inGroup = new Set();
  for (const group of groups) {
    for (const option of group.options ?? []) inGroup.add(option.id);
  }

  return (graduate ? GRADUATE_TERMS : TERMS).map((term) => {
    const courses = lectures
      .filter((l) => l.term === term && !inGroup.has(l.id))
      .map((lecture) => courseRow(lecture, locale))
      .sort(byCode);
    const slots = groups
      .filter((g) => g.term === term)
      .map((g) => groupRow(g, byId, locale))
      .sort(byCode);
    const rows = [...courses, ...slots];
    const totalEcts = rows.reduce((sum, r) => sum + (Number(r.ects) || 0), 0);
    return {
      number: term,
      name: semesterName(term, graduate),
      label: semesterLabel(term, graduate),
      totalEcts,
      rows,
    };
  });
});

export const getCurriculumSummary = cache(async (graduate = false) => {
  const semesters = await getCurriculum("tr", graduate);
  const active = semesters.filter((s) => s.rows.length > 0);
  return {
    termCount: active.length,
    totalEcts: active.reduce((sum, s) => sum + s.totalEcts, 0),
    courseCount: active.reduce((sum, s) => sum + s.rows.length, 0),
    yearCount: graduate ? 2 : Math.ceil(active.length / 2),
  };
});

const CATEGORY_LABEL = {
  BASIC_SCIENCE: "Temel Bilim",
  FOREIGN_LANGUAGE: "Yabancı Dil",
  COMMON_REQUIRED: "Ortak Zorunlu",
  CORE_PROFESSION: "Temel Meslek",
  SPECIALIZATION: "Uzmanlık / Alan",
  GENERAL_CULTURE: "Genel Kültür",
};

const LANGUAGE_ORDER = ["TURKISH", "ENGLISH"];
const LANGUAGE_LABEL = {
  TURKISH: { tr: "Türkçe", en: "Turkish" },
  ENGLISH: { tr: "İngilizce", en: "English" },
};

function languageLabel(languages, locale) {
  const labels = LANGUAGE_ORDER.filter((code) => (languages ?? []).includes(code)).map(
    (code) => LANGUAGE_LABEL[code][locale === "en" ? "en" : "tr"],
  );
  return labels.length > 0 ? labels.join(", ") : null;
}

function lectureView(lecture, locale) {
  const midterm = lecture.midtermWeight;
  return {
    id: lecture.id,
    code: lecture.code,
    slug: lecture.slug,
    title: localized(lecture.name ?? lecture.code, lecture.nameEn, locale).trim(),
    content: localized(lecture.about, lecture.aboutEn, locale) ?? null,
    gradingPolicy: localized(lecture.gradingPolicy, lecture.gradingPolicyEn, locale) ?? null,
    resources: localized(lecture.resources, lecture.resourcesEn, locale) ?? null,
    languages: lecture.languages ?? [],
    language: languageLabel(lecture.languages, locale),
    ects: lecture.ects ?? null,
    hours: hoursOf(lecture) ?? "-",
    semester: lecture.term ?? null,
    type: lecture.type === "REQUIRED" ? "Zorunlu" : "Seçmeli",
    category: CATEGORY_LABEL[lecture.category] ?? null,
    syllabus: (lecture.syllabus ?? []).map((row, index) => ({
      week: row.week ?? index + 1,
      topic: localized(row.topic, row.topicEn, locale) ?? "",
    })),
    assessment:
      midterm == null
        ? null
        : { midterm: { weight: midterm }, final: { weight: lecture.finalWeight ?? 0 } },
    noteCount: lecture.noteCount ?? 0,
    bolognaLink: bolognaHref(lecture.bolognaLink, locale) ?? null,
    notesLink: lecture.notesLink ?? null,
  };
}

const getLectureBySlug = cache(async (slug) => {
  const item = await getCmsCollectionItem(cmsConfig, "lectures", slug).catch(() => null);
  return item ? { ...item.data, slug: item.slug } : null;
});

export const getCourseCodes = cache(async () =>
  (await getLectures())
    .filter((lecture) => !linksOffsite(lecture))
    .map((lecture) => lecture.code)
    .sort((x, y) => x.localeCompare(y, "tr")),
);

export const getCourseByCode = cache(async (code, locale = "tr") => {
  if (!code) return null;
  const lecture = await getLectureBySlug(String(code).toLowerCase());
  return lecture ? lectureView(lecture, locale) : null;
});
