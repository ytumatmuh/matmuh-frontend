const WINDOW_STARTS = [4, 9];

export const WINDOW_LABELS = ["Sabah", "Öğleden sonra", "Akşam"];

export const windowOf = (slot) => WINDOW_STARTS.filter((start) => slot >= start).length;

const englishFirst = (block) => (/ingilizce|english/i.test(block.name ?? "") ? 0 : 1);

export const byPoolOrder = (a, b) =>
  englishFirst(a) - englishFirst(b) ||
  a.slot - b.slot ||
  String(a.name).localeCompare(String(b.name), "tr");

export const byTimeOrder = (a, b) =>
  a.slot - b.slot ||
  a.span - b.span ||
  englishFirst(a) - englishFirst(b) ||
  String(a.name).localeCompare(String(b.name), "tr");

export const kindOf = (entry) =>
  entry.pool ? `pool:${entry.pool.id}` : entry.type === "Seçmeli" ? "elective" : "required";

export function poolBlocks(blocks) {
  const plain = [];
  const buckets = new Map();

  for (const block of blocks) {
    if (!block.pool) {
      plain.push(block);
      continue;
    }
    const window = windowOf(block.slot);
    const key = `${block.day}|${block.pool.id}|${window}`;
    if (!buckets.has(key)) {
      buckets.set(key, { day: block.day, pool: block.pool, window, courses: [] });
    }
    buckets.get(key).courses.push(block);
  }

  for (const bucket of buckets.values()) {
    if (bucket.courses.length === 1) {
      plain.push(bucket.courses[0]);
      continue;
    }
    const slot = Math.min(...bucket.courses.map((course) => course.slot));
    const last = Math.max(...bucket.courses.map((course) => course.slot + course.span - 1));
    plain.push({
      kind: "pool",
      day: bucket.day,
      slot,
      span: Math.max(1, last - slot + 1),
      code: `~${bucket.pool.id}-${bucket.window}`,
      name: bucket.pool.name,
      pool: bucket.pool,
      window: bucket.window,
      courses: bucket.courses.sort(byPoolOrder),
      groups: bucket.courses.flatMap((course) => course.groups),
    });
  }

  return plain;
}
