import { isLowGrade } from "@/app/components/GradeDistribution";

const W = 1080;
const H = 1350;
const PAD = 48;
const GAP = 16;

const INK = "#1D2445";
const INK_2 = "#262E55";
const GOLD = "#AD976F";
const GOLD_SOFT = "#D4C5A9";
const WHITE = "#FFFFFF";
const white = (a) => `rgba(255,255,255,${a})`;

function fontFamilies() {
  const root = getComputedStyle(document.documentElement);
  const sans = root.getPropertyValue("--font-inter").trim() || "Inter, system-ui, sans-serif";
  const mono = root.getPropertyValue("--font-jb-mono").trim() || "ui-monospace, monospace";
  return { sans: `${sans}, system-ui, sans-serif`, mono: `${mono}, ui-monospace, monospace` };
}

function makeFont(families) {
  return (size, weight = 400, mono = false) =>
    `${weight} ${size}px ${mono ? families.mono : families.sans}`;
}

function fit(ctx, text, maxWidth, size, weight, font, mono = false, min = 16) {
  let s = size;
  ctx.font = font(s, weight, mono);
  while (s > min && ctx.measureText(text).width > maxWidth) {
    s -= 1;
    ctx.font = font(s, weight, mono);
  }
  if (ctx.measureText(text).width <= maxWidth) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxWidth) cut = cut.slice(0, -1);
  return `${cut}…`;
}

function wrap(ctx, text, maxWidth, maxLines) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
  kept[maxLines - 1] = `${last}…`;
  return kept;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function strip(ctx, font, x, y, w, h, label, legend = null) {
  ctx.fillStyle = GOLD;
  roundRect(ctx, x, y, w, h, [10, 10, 0, 0]);
  ctx.fill();
  ctx.textBaseline = "middle";
  const cy = y + h / 2 + 1;
  let right = x + w - 18;
  if (legend) {
    ctx.font = font(18, 600);
    for (const item of [...legend].reverse()) {
      ctx.fillStyle = INK;
      ctx.textAlign = "right";
      ctx.fillText(item.label, right, cy);
      right -= ctx.measureText(item.label).width + 8;
      ctx.fillStyle = INK_2;
      roundRect(ctx, right - 40, cy - 7, 40, 14, 7);
      ctx.fill();
      ctx.fillStyle = item.color;
      roundRect(ctx, right - 40, cy - 7, 26, 14, 7);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      roundRect(ctx, right - 40, cy - 7, 40, 14, 7);
      ctx.stroke();
      right -= 40 + 20;
    }
  }
  ctx.fillStyle = INK;
  ctx.textAlign = "left";
  ctx.fillText(fit(ctx, label, right - x - 18, 22, 700, font, false, 15), x + 18, cy);
}

function box(ctx, x, y, w, h, top = false) {
  ctx.fillStyle = INK_2;
  roundRect(ctx, x, y, w, h, top ? [0, 0, 10, 10] : 10);
  ctx.fill();
}

function drawKpis(ctx, font, kpis, y) {
  const labelH = 48;
  const valueH = 138;
  const w = (W - PAD * 2 - GAP * (kpis.length - 1)) / kpis.length;
  kpis.forEach((kpi, i) => {
    const x = PAD + i * (w + GAP);
    strip(ctx, font, x, y, w, labelH, kpi.label);
    box(ctx, x, y + labelH, w, valueH, true);
    ctx.fillStyle = WHITE;
    ctx.textAlign = "right";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(fit(ctx, kpi.value, w - 36, 66, 700, font, true, 30), x + w - 18, y + labelH + 82);
    ctx.fillStyle = white(0.62);
    ctx.fillText(fit(ctx, kpi.sub, w - 36, 22, 500, font, false, 14), x + w - 18, y + labelH + 118);
  });
  return y + labelH + valueH;
}

function drawDistribution(ctx, font, { title, rows, legend }, x, y, w, h, fmt, pct) {
  const headH = 48;
  strip(ctx, font, x, y, w, headH, title, legend);
  box(ctx, x, y + headH, w, h - headH, true);
  if (rows.length === 0) return;

  const total = rows.reduce((s, r) => s + (Number(r.count) || 0), 0);
  const max = Math.max(1, ...rows.map((r) => Number(r.count) || 0));
  const avail = h - headH - 20;
  const rowH = Math.min(84, avail / rows.length);
  const innerTop = y + headH + 10 + (avail - rowH * rows.length) / 2;
  const size = Math.max(20, Math.min(32, Math.floor(rowH * 0.5)));
  const small = Math.max(16, size - 8);

  const ranges = rows.map((row) =>
    row.start != null && row.end != null ? `${fmt(row.start)}–${fmt(row.end)}` : "",
  );
  ctx.font = font(size, 700, true);
  const gradeW = Math.max(...rows.map((row) => ctx.measureText(row.grade).width)) + 16;
  ctx.font = font(small, 500, true);
  const rangeW = Math.max(0, ...ranges.map((r) => ctx.measureText(r).width)) + 18;
  ctx.font = font(size, 700, true);
  const countW = ctx.measureText(String(max)).width + 16;
  ctx.font = font(small, 500, true);
  const pctW = ctx.measureText(pct("100,0")).width + 8;
  const barX = x + 18 + gradeW + rangeW;
  const barMax = Math.max(40, w - 36 - gradeW - rangeW - countW - pctW);

  rows.forEach((row, i) => {
    const cy = innerTop + i * rowH + rowH / 2;
    const count = Number(row.count) || 0;
    const low = isLowGrade(row.grade);
    ctx.textBaseline = "middle";

    ctx.fillStyle = low ? white(0.55) : WHITE;
    ctx.textAlign = "left";
    ctx.font = font(size, 700, true);
    ctx.fillText(row.grade, x + 18, cy);

    ctx.fillStyle = white(0.5);
    ctx.font = font(small, 500, true);
    ctx.fillText(ranges[i], x + 18 + gradeW, cy);

    const barH = Math.max(8, Math.min(24, rowH * 0.34));
    ctx.fillStyle = white(0.08);
    roundRect(ctx, barX, cy - barH / 2, barMax, barH, barH / 2);
    ctx.fill();
    if (count > 0) {
      ctx.fillStyle = low ? white(0.32) : GOLD;
      roundRect(ctx, barX, cy - barH / 2, Math.max(barH, (count / max) * barMax), barH, barH / 2);
      ctx.fill();
    }

    ctx.textAlign = "right";
    ctx.fillStyle = WHITE;
    ctx.font = font(size, 700, true);
    ctx.fillText(String(count), x + w - 18 - pctW, cy);
    ctx.fillStyle = white(0.6);
    ctx.font = font(small, 500, true);
    ctx.fillText(total ? pct(fmt((count / total) * 100, 1)) : "", x + w - 18, cy);
  });
}

function drawExams(ctx, font, { title, exams, labels }, x, y, w, h, fmt, pct) {
  const headH = 48;
  strip(ctx, font, x, y, w, headH, title);
  const top = y + headH;
  const avail = h - headH;
  const tileGap = 10;
  const n = exams.length;
  const tileH = (avail - tileGap * (n - 1)) / n;
  const compact = tileH < 118;

  exams.forEach((exam, i) => {
    const ty = top + i * (tileH + tileGap);
    box(ctx, x, ty, w, tileH, i === 0);
    if (i === 0) {
      ctx.fillStyle = INK_2;
      ctx.fillRect(x, ty, w, 10);
    }
    const name = exam.name;
    const weight = exam.weight != null ? pct(fmt(exam.weight)) : "";
    const avg = exam.average != null ? fmt(exam.average, 1) : "—";
    const attended =
      exam.attended != null
        ? exam.total
          ? `${labels.attended} ${exam.attended}/${exam.total}`
          : `${exam.attended} ${labels.students}`
        : "";

    if (compact) {
      const cy = ty + tileH / 2;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.fillStyle = WHITE;
      const nameSize = Math.max(18, Math.min(24, tileH * 0.34));
      ctx.fillText(fit(ctx, name, w * 0.5, nameSize, 600, font, false, 14), x + 18, cy - (attended ? nameSize * 0.5 : 0));
      if (attended || weight) {
        ctx.fillStyle = white(0.55);
        ctx.fillText(
          fit(ctx, [weight, attended].filter(Boolean).join(" · "), w * 0.55, nameSize - 5, 500, font, false, 12),
          x + 18,
          cy + nameSize * 0.62,
        );
      }
      ctx.textAlign = "right";
      ctx.fillStyle = GOLD_SOFT;
      ctx.fillText(fit(ctx, avg, w * 0.36, Math.min(52, tileH * 0.62), 700, font, true, 20), x + w - 18, cy + 2);
      return;
    }

    const tall = tileH >= 230;
    const barsH = tall ? 86 : 0;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillStyle = WHITE;
    ctx.fillText(fit(ctx, name, w - 36 - 90, 26, 600, font, false, 16), x + 18, ty + 42);
    if (weight) {
      ctx.textAlign = "right";
      ctx.fillStyle = GOLD_SOFT;
      ctx.font = font(24, 700, true);
      ctx.fillText(weight, x + w - 18, ty + 42);
    }
    const big = Math.max(40, Math.min(112, (tileH - barsH) * 0.46, tileH - barsH - 70));
    const headRoom = 60;
    const block = big + (tall ? 24 + barsH : 0);
    const base = tall
      ? ty + headRoom + Math.max(0, (tileH - headRoom - block - 16) / 2) + big
      : ty + tileH - 22;
    ctx.textAlign = "left";
    ctx.fillStyle = WHITE;
    ctx.fillText(fit(ctx, avg, w * 0.5, big, 700, font, true, 28), x + 18, base);
    const avgWidth = ctx.measureText(avg).width;
    ctx.fillStyle = white(0.55);
    ctx.font = font(20, 500);
    ctx.fillText(labels.average, x + 18 + avgWidth + 10, base - 2);
    if (attended) {
      ctx.textAlign = "right";
      ctx.fillText(fit(ctx, attended, w * 0.45, 22, 500, font, false, 14), x + w - 18, base - 2);
    }

    if (tall) {
      const rows = [
        { label: labels.averageBar, value: exam.average, max: 100, color: GOLD, text: avg },
        exam.attended != null && exam.total
          ? {
              label: labels.attendance,
              value: exam.attended,
              max: exam.total,
              color: white(0.45),
              text: pct(fmt((exam.attended / exam.total) * 100, 0)),
            }
          : null,
      ].filter(Boolean);
      rows.forEach((row, r) => {
        const by = base + 36 + r * 36;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillStyle = white(0.6);
        ctx.font = font(18, 500);
        ctx.fillText(row.label, x + 18, by);
        const labelW = 150;
        const trackX = x + 18 + labelW;
        const trackW = w - 36 - labelW - 80;
        ctx.fillStyle = white(0.08);
        roundRect(ctx, trackX, by - 6, trackW, 12, 6);
        ctx.fill();
        const ratio = row.value == null ? 0 : Math.max(0, Math.min(1, row.value / row.max));
        if (ratio > 0) {
          ctx.fillStyle = row.color;
          roundRect(ctx, trackX, by - 6, Math.max(12, trackW * ratio), 12, 6);
          ctx.fill();
        }
        ctx.textAlign = "right";
        ctx.fillStyle = WHITE;
        ctx.font = font(20, 600, true);
        ctx.fillText(row.text, x + w - 18, by);
      });
    }
  });
}

export async function renderStatsCard(data) {
  await document.fonts?.ready;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const font = makeFont(fontFamilies());
  const nf = (digits) =>
    new Intl.NumberFormat(data.locale === "en" ? "en-US" : "tr-TR", {
      maximumFractionDigits: digits,
      minimumFractionDigits: 0,
    });
  const pct = (text) => (data.locale === "en" ? `${text}%` : `%${text}`);
  const fmt = (value, digits = 2) => (value == null || value === "" ? "—" : nf(digits).format(Number(value)));

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W, 0, 0, W, 0, 700);
  glow.addColorStop(0, "rgba(173,151,111,0.16)");
  glow.addColorStop(1, "rgba(173,151,111,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = GOLD;
  ctx.font = font(22, 700);
  ctx.fillText(data.labels.eyebrow, PAD, PAD + 20);

  ctx.fillStyle = WHITE;
  ctx.font = font(72, 800, true);
  ctx.fillText(data.code, PAD, PAD + 100);
  const codeWidth = ctx.measureText(data.code).width;

  ctx.font = font(34, 600);
  const nameLines = wrap(ctx, data.name, W - PAD * 2 - codeWidth - 28, 2);
  const nameTop = nameLines.length === 1 ? PAD + 90 : PAD + 68;
  nameLines.forEach((line, i) => ctx.fillText(line, PAD + codeWidth + 28, nameTop + i * 40));

  ctx.fillStyle = white(0.72);
  ctx.fillText(fit(ctx, data.meta, W - PAD * 2, 28, 500, font, false, 18), PAD, PAD + 156);

  ctx.fillStyle = white(0.12);
  ctx.fillRect(PAD, PAD + 184, W - PAD * 2, 2);

  const kpiBottom = drawKpis(ctx, font, data.kpis, PAD + 212);

  const bodyTop = kpiBottom + 28;
  const bodyBottom = H - PAD - 50;
  const bodyH = bodyBottom - bodyTop;
  const dists = data.distributions.filter((d) => d.rows.length > 0);
  const exams = data.exams;

  const hasDist = dists.length > 0;
  const hasExams = exams.length > 0;
  const leftW = hasExams && hasDist ? Math.round((W - PAD * 2 - GAP) * 0.56) : W - PAD * 2;
  const rightX = hasDist ? PAD + leftW + GAP : PAD;
  const rightW = hasDist ? W - PAD - rightX : W - PAD * 2;

  if (hasDist) {
    const weights = dists.map((d) => d.rows.length + 1.4);
    const sum = weights.reduce((a, b) => a + b, 0);
    let y = bodyTop;
    dists.forEach((dist, i) => {
      const h = i === dists.length - 1 ? bodyBottom - y : (bodyH - GAP * (dists.length - 1)) * (weights[i] / sum);
      drawDistribution(ctx, font, { ...dist, legend: i === 0 ? data.legend : null }, PAD, y, leftW, h, fmt, pct);
      y += h + GAP;
    });
  }

  if (hasExams) {
    drawExams(ctx, font, { title: data.labels.exams, exams, labels: data.labels }, rightX, bodyTop, rightW, bodyH, fmt, pct);
  }

  if (!hasDist && !hasExams) {
    box(ctx, PAD, bodyTop, W - PAD * 2, bodyH);
    ctx.fillStyle = white(0.55);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = font(28, 500);
    ctx.fillText(data.labels.noDetail, W / 2, bodyTop + bodyH / 2);
  }

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = white(0.8);
  ctx.font = font(22, 600);
  ctx.fillText(data.url, PAD, H - PAD);
  ctx.textAlign = "right";
  ctx.fillStyle = white(0.5);
  ctx.font = font(20, 500);
  ctx.fillText(data.labels.footer, W - PAD, H - PAD);

  return canvas;
}

export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob"))), "image/png"),
  );
}

export const STATS_CARD_LEGEND = { pass: GOLD, fail: white(0.32) };

export const STATS_CARD_SIZE = { width: W, height: H };
