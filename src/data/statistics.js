const API = process.env.NEXT_PUBLIC_API_URL || "/api";

const SEMESTER_ORDER = { FALL: 0, SPRING: 1, SUMMER: 2 };
const SEMESTER_LABEL = { FALL: "Güz", SPRING: "Bahar", SUMMER: "Yaz" };

const EXAM_LABEL = {
  MIDTERM_1: "Ara Sınav 1",
  MIDTERM_1_MAKEUP: "Ara Sınav 1 Mazeret",
  MIDTERM_2: "Ara Sınav 2",
  MIDTERM_2_MAKEUP: "Ara Sınav 2 Mazeret",
  QUIZ: "Kısa Sınav",
  QUIZ_2: "Kısa Sınav 2",
  ASSIGNMENT: "Ödev",
  ASSIGNMENT_2: "Ödev 2",
  PROJECT: "Proje",
  FINAL: "Final",
  RESIT: "Bütünleme",
};

const EXAM_ORDER = Object.keys(EXAM_LABEL);

export const termLabel = (offering) =>
  `${offering.academicYear} ${SEMESTER_LABEL[offering.semester] ?? offering.semester}`;

export const termOrder = (offering) =>
  parseInt(offering.academicYear, 10) * 10 + (SEMESTER_ORDER[offering.semester] ?? 9);

const instructorLabel = (offering) => {
  const staff = offering.staff;
  if (staff) {
    const full = [staff.academicTitle, staff.firstName, staff.lastName].filter(Boolean).join(" ");
    if (full) return full;
  }
  return offering.instructorRawName || offering.instructorName || "Atanmamış Eğitmen";
};

const instructorKey = (offering) =>
  offering.staff?.id ? `staff:${offering.staff.id}` : `name:${instructorLabel(offering)}`;

const byScoreRange = (a, b) => {
  if (a.minScore == null) return 1;
  if (b.minScore == null) return -1;
  return b.minScore - a.minScore;
};

const resultOf = (offering, period) => {
  if (period === "NORMAL" && offering.finalResult) return offering.finalResult;
  if (period === "BUT" && offering.butResult) return offering.butResult;
  return (offering.gradeResults ?? []).find((r) => r.examPeriod === period) ?? null;
};

const toDistribution = (result) =>
  [...(result?.gradeDistributions ?? [])].sort(byScoreRange).map((row) => ({
    grade: row.letterGrade,
    start: row.minScore,
    end: row.maxScore,
    count: row.studentCount,
  }));

const toExams = (offering) =>
  [...(offering.examStatistics ?? [])]
    .sort((a, b) => EXAM_ORDER.indexOf(a.examType) - EXAM_ORDER.indexOf(b.examType))
    .map((exam) => ({
      type: exam.examType ?? null,
      name: EXAM_LABEL[exam.examType] ?? exam.examType ?? "Sınav",
      weight: exam.weightPercent,
      average: exam.averageScore,
      attended: exam.attendedStudentCount,
      total: exam.totalStudentCount ?? null,
      absent: exam.absentStudentCount ?? null,
      failedByAbsence: exam.failedByAbsenceCount ?? null,
    }));

const toSection = (offering) => {
  const final = resultOf(offering, "NORMAL");
  return {
    section: String(offering.groupNumber ?? 1),
    summary: {
      average: final?.classAverage ?? null,
      stdDev: final?.standardDeviation ?? null,
      participantCount: final?.participantCount ?? null,
      evaluationMethod: final?.evaluationMethod ?? null,
      resultDate: final?.resultDate ?? null,
    },
    gradeDistribution: toDistribution(final),
    makeupDistribution: toDistribution(resultOf(offering, "BUT")),
    exams: toExams(offering),
  };
};

const hasStatistics = (section) =>
  section.gradeDistribution.length > 0 ||
  section.makeupDistribution.length > 0 ||
  section.exams.length > 0 ||
  section.summary.average != null;

export function toViewModel(offerings = []) {
  const terms = new Map();

  for (const offering of offerings) {
    const section = toSection(offering);
    if (!hasStatistics(section)) continue;
    const label = termLabel(offering);
    if (!terms.has(label)) {
      terms.set(label, { name: label, order: termOrder(offering), instructors: new Map() });
    }
    const term = terms.get(label);

    const key = instructorKey(offering);
    if (!term.instructors.has(key)) {
      term.instructors.set(key, {
        name: instructorLabel(offering),
        staffId: offering.staff?.id ?? null,
        sections: [],
      });
    }
    term.instructors.get(key).sections.push(section);
  }

  return [...terms.values()]
    .map((term) => ({
      name: term.name,
      order: term.order,
      instructors: [...term.instructors.values()]
        .map((instructor) => ({
          ...instructor,
          sections: instructor.sections.sort(
            (a, b) => Number(a.section) - Number(b.section),
          ),
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "tr")),
    }))
    .sort((a, b) => b.order - a.order);
}

export async function fetchCourseStatistics(lectureId, token) {
  const res = await fetch(`${API}/lectures/${lectureId}/offerings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`offerings ${res.status}`);
  const body = await res.json();
  const rows = body?.data ?? body ?? [];
  return toViewModel(Array.isArray(rows) ? rows : []);
}

const lectureKey = (offering) =>
  offering.lecture?.id ?? offering.lecture?.code ?? "bilinmeyen";

export function toStaffViewModel(offerings = []) {
  const terms = new Map();

  for (const offering of offerings) {
    const section = toSection(offering);
    if (!hasStatistics(section)) continue;
    const label = termLabel(offering);
    if (!terms.has(label)) {
      terms.set(label, {
        name: label,
        key: `${offering.academicYear}|${offering.semester}`,
        order: termOrder(offering),
        lectures: new Map(),
      });
    }
    const term = terms.get(label);

    const key = lectureKey(offering);
    if (!term.lectures.has(key)) {
      term.lectures.set(key, {
        code: offering.lecture?.code ?? null,
        name: offering.lecture?.name ?? "Bilinmeyen ders",
        sections: [],
      });
    }
    term.lectures.get(key).sections.push(section);
  }

  return [...terms.values()]
    .map((term) => ({
      name: term.name,
      key: term.key,
      order: term.order,
      lectures: [...term.lectures.values()]
        .map((lecture) => ({
          ...lecture,
          sections: lecture.sections.sort(
            (a, b) => Number(a.section) - Number(b.section),
          ),
        }))
        .sort((a, b) => (a.code ?? "").localeCompare(b.code ?? "", "tr")),
    }))
    .sort((a, b) => b.order - a.order);
}

export async function fetchStaffOfferings(staffId, token) {
  const res = await fetch(`${API}/staff/${staffId}/offerings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`staff offerings ${res.status}`);
  const body = await res.json();
  const rows = body?.data ?? body ?? [];
  return toStaffViewModel(Array.isArray(rows) ? rows : []);
}
