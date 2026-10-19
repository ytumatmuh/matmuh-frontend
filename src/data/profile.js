const API = process.env.NEXT_PUBLIC_API_URL || "/api";

const GUN = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

export function weekdayOf(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return GUN[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

export function currentWeek(today = new Date()) {
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const iso = (date) => date.toISOString().slice(0, 10);
  return { from: iso(monday), to: iso(sunday) };
}

async function get(path, token) {
  const res = await fetch(`${API}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

export async function fetchMySchedule(token, range = currentWeek()) {
  const body = await get(`/calendar/me?from=${range.from}&to=${range.to}`, token);
  return (body?.data ?? []).map((item) => ({
    id: `${item.offeringId}-${item.date}-${item.startTime}`,
    date: item.date,
    startTime: (item.startTime ?? "").slice(0, 5),
    endTime: (item.endTime ?? "").slice(0, 5),
    title: item.title || item.lectureName,
    lectureCode: item.lectureCode,
    classroom: item.classroom,
    online: item.online,
    staffName: item.staffName,
    examType: item.examType,
    kind: item.kind,
  }));
}

function minutesOf(hhmm) {
  const [h, m] = (hhmm ?? "").split(":").map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
}

function toBlocks(entries) {
  const blocks = [];

  for (const entry of entries) {
    const start = minutesOf(entry.startTime);
    const end = minutesOf(entry.endTime);
    const open = blocks.at(-1);

    if (open && start !== null && open.end !== null && start < open.end) {
      open.entries.push(entry);
      open.overlapStart = Math.max(open.overlapStart, start);
      open.overlapEnd = open.overlapEnd === null ? end : Math.min(open.overlapEnd, end ?? open.overlapEnd);
      if (end !== null) open.end = Math.max(open.end, end);
    } else {
      blocks.push({ entries: [entry], end, overlapStart: start, overlapEnd: end });
    }
  }

  return blocks.map(({ entries: grouped, overlapStart, overlapEnd }) => ({
    entries: grouped,
    conflict: grouped.length > 1,
    overlap:
      grouped.length > 1 && overlapStart !== null && overlapEnd !== null && overlapStart < overlapEnd
        ? `${formatClock(overlapStart)} – ${formatClock(overlapEnd)}`
        : null,
  }));
}

function formatClock(total) {
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function scheduleDays(items) {
  const days = new Map();
  for (const item of items) {
    if (!days.has(item.date)) days.set(item.date, []);
    days.get(item.date).push(item);
  }

  return [...days.keys()]
    .sort()
    .map((date) => ({
      date,
      blocks: toBlocks([...days.get(date)].sort((a, b) => a.startTime.localeCompare(b.startTime))),
    }));
}
