import { isHighlightGrade, isLowGrade } from "@/app/components/GradeDistribution";

const W = 1080;
const H = 1350;
const PAD = 52;
const GAP = 18;
const RADIUS = 18;

const GOLD = "#AD976F";
const GOLD_SOFT = "#D4C5A9";
const navy = (a) => `rgba(29,36,69,${a})`;
const white = (a) => `rgba(255,255,255,${a})`;

const THEMES = {
  dark: {
    page: "#1D2445",
    card: "#232B52",
    text: "#FFFFFF",
    fg: white,
    line: white(0.08),
    track: white(0.07),
    pass: white(0.88),
    fail: white(0.26),
    accent: GOLD_SOFT,
    kpi: { fill: "#232B52", border: true, label: GOLD_SOFT, value: "#FFFFFF", sub: white(0.6) },
  },
  light: {
    page: "#E7EAF0",
    card: "#F7F8FA",
    text: "#1D2445",
    fg: navy,
    line: navy(0.1),
    track: navy(0.06),
    pass: "#1D2445",
    fail: navy(0.2),
    accent: "#8E7B5A",
    kpi: { fill: "#1D2445", border: false, label: GOLD_SOFT, value: "#FFFFFF", sub: white(0.62) },
  },
};

let theme = THEMES.dark;

function fontFamilies() {
  const root = getComputedStyle(document.documentElement);
  const sans = root.getPropertyValue("--font-inter").trim() || "Inter";
  const mono = root.getPropertyValue("--font-jb-mono").trim() || "ui-monospace";
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

function pill(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fill();
}

function card(ctx, x, y, w, h) {
  ctx.fillStyle = theme.card;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, RADIUS);
  ctx.fill();
  ctx.strokeStyle = theme.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5, RADIUS);
  ctx.stroke();
}

function heading(ctx, font, x, y, w, label, upper) {
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.roundRect(x, y - 11, 5, 22, 2.5);
  ctx.fill();
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillStyle = theme.text;
  const text = fit(ctx, upper(label), w - 24, 19, 700, font, false, 14);
  ctx.save();
  ctx.letterSpacing = "2px";
  ctx.fillText(text, x + 18, y + 1);
  ctx.restore();
}

function drawLegend(ctx, font, x, y, legend) {
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.font = font(17, 500);
  let left = x;
  for (const item of legend) {
    pill(ctx, left, y - 5, 22, 10, item.color);
    left += 22 + 8;
    ctx.fillStyle = theme.fg(0.6);
    ctx.fillText(item.label, left, y);
    left += ctx.measureText(item.label).width + 22;
  }
}

function drawKpis(ctx, font, kpis, y, upper) {
  const h = 168;
  const w = (W - PAD * 2 - GAP * (kpis.length - 1)) / kpis.length;
  kpis.forEach((kpi, i) => {
    const x = PAD + i * (w + GAP);
    if (theme.kpi.border) card(ctx, x, y, w, h);
    else {
      ctx.fillStyle = theme.kpi.fill;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, RADIUS);
      ctx.fill();
    }
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillStyle = theme.kpi.label;
    ctx.save();
    ctx.letterSpacing = "1.5px";
    ctx.fillText(fit(ctx, upper(kpi.label), w - 44, 16, 700, font, false, 12), x + 22, y + 38);
    ctx.restore();
    ctx.fillStyle = theme.kpi.value;
    ctx.fillText(fit(ctx, kpi.value, w - 44, 60, 700, font, true, 28), x + 22, y + 112);
    ctx.fillStyle = theme.kpi.sub;
    ctx.fillText(fit(ctx, kpi.sub, w - 44, 20, 500, font, false, 13), x + 22, y + 146);
  });
  return y + h;
}

function drawDistribution(ctx, font, { title, rows, legend }, x, y, w, h, fmt, pct, upper) {
  card(ctx, x, y, w, h);
  const inX = x + 24;
  const inW = w - 48;
  heading(ctx, font, inX, y + 38, inW, title, upper);
  if (legend) drawLegend(ctx, font, inX, y + 72, legend);
  if (rows.length === 0) return;

  const total = rows.reduce((s, r) => s + (Number(r.count) || 0), 0);
  const max = Math.max(1, ...rows.map((r) => Number(r.count) || 0));
  const headerH = legend ? 96 : 70;
  const top = y + headerH;
  const avail = h - headerH - 18;
  const rowH = Math.min(80, avail / rows.length);
  const innerTop = top + (avail - rowH * rows.length) / 2;
  const size = Math.max(19, Math.min(30, Math.floor(rowH * 0.5)));
  const small = Math.max(15, size - 8);

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
  const barX = inX + gradeW + rangeW;
  const barMax = Math.max(40, inW - gradeW - rangeW - countW - pctW);

  rows.forEach((row, i) => {
    const cy = innerTop + i * rowH + rowH / 2;
    const count = Number(row.count) || 0;
    const low = isLowGrade(row.grade);
    ctx.textBaseline = "middle";

    if (i > 0) {
      ctx.fillStyle = theme.fg(0.05);
      ctx.fillRect(inX, cy - rowH / 2, inW, 1);
    }

    ctx.textAlign = "left";
    ctx.fillStyle = low ? theme.fg(0.5) : theme.text;
    ctx.font = font(size, 700, true);
    ctx.fillText(row.grade, inX, cy);

    ctx.fillStyle = theme.fg(0.5);
    ctx.font = font(small, 500, true);
    ctx.fillText(ranges[i], inX + gradeW, cy);

    const barH = Math.max(8, Math.min(18, rowH * 0.26));
    pill(ctx, barX, cy - barH / 2, barMax, barH, theme.track);
    if (count > 0) {
      const color = low ? theme.fail : isHighlightGrade(row.grade) ? GOLD : theme.pass;
      pill(ctx, barX, cy - barH / 2, Math.max(barH, (count / max) * barMax), barH, color);
    }

    ctx.textAlign = "right";
    ctx.fillStyle = theme.text;
    ctx.font = font(size, 700, true);
    ctx.fillText(String(count), inX + inW - pctW, cy);
    ctx.fillStyle = theme.fg(0.55);
    ctx.font = font(small, 500, true);
    ctx.fillText(total ? pct(fmt((count / total) * 100, 1)) : "", inX + inW, cy);
  });
}

function drawExams(ctx, font, { title, exams, labels }, x, y, w, h, fmt, pct, upper) {
  card(ctx, x, y, w, h);
  const inX = x + 24;
  const inW = w - 48;
  heading(ctx, font, inX, y + 38, inW, title, upper);

  const top = y + 70;
  const avail = h - 70 - 12;
  const n = exams.length;
  const tileH = avail / n;
  const compact = tileH < 118;

  exams.forEach((exam, i) => {
    const ty = top + i * tileH;
    if (i > 0) {
      ctx.fillStyle = theme.fg(0.07);
      ctx.fillRect(inX, ty, inW, 1.5);
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
      const nameSize = Math.max(17, Math.min(23, tileH * 0.32));
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.fillStyle = theme.text;
      ctx.fillText(fit(ctx, name, inW * 0.58, nameSize, 600, font, false, 14), inX, cy - nameSize * 0.55);
      ctx.fillStyle = theme.fg(0.55);
      ctx.fillText(
        fit(ctx, [weight, attended].filter(Boolean).join("  ·  "), inW * 0.6, nameSize - 4, 500, font, false, 12),
        inX,
        cy + nameSize * 0.62,
      );
      ctx.textAlign = "right";
      ctx.fillStyle = theme.text;
      ctx.fillText(fit(ctx, avg, inW * 0.36, Math.min(48, tileH * 0.56), 700, font, true, 20), inX + inW, cy + 2);
      return;
    }

    const tall = tileH >= 230;
    const barsH = tall ? 80 : 0;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillStyle = theme.text;
    ctx.fillText(fit(ctx, name, inW - 100, 25, 600, font, false, 16), inX, ty + 44);
    if (weight) {
      ctx.textAlign = "right";
      ctx.fillStyle = theme.accent;
      ctx.font = font(22, 700, true);
      ctx.fillText(weight, inX + inW, ty + 44);
    }

    const big = Math.max(38, Math.min(104, (tileH - barsH) * 0.44, tileH - barsH - 76));
    const headRoom = 62;
    const block = big + (tall ? 26 + barsH : 0);
    const base = tall
      ? ty + headRoom + Math.max(0, (tileH - headRoom - block - 16) / 2) + big
      : ty + tileH - 24;

    ctx.textAlign = "left";
    ctx.fillStyle = theme.text;
    ctx.fillText(fit(ctx, avg, inW * 0.5, big, 700, font, true, 26), inX, base);
    const avgWidth = ctx.measureText(avg).width;
    ctx.fillStyle = theme.fg(0.55);
    ctx.font = font(19, 500);
    ctx.fillText(labels.average, inX + avgWidth + 10, base - 2);
    if (attended) {
      ctx.textAlign = "right";
      ctx.fillText(fit(ctx, attended, inW * 0.45, 20, 500, font, false, 13), inX + inW, base - 2);
    }

    if (!tall) return;
    const bars = [
      { label: labels.averageBar, value: exam.average, max: 100, color: theme.pass, text: avg },
      exam.attended != null && exam.total
        ? {
            label: labels.attendance,
            value: exam.attended,
            max: exam.total,
            color: GOLD,
            text: pct(fmt((exam.attended / exam.total) * 100, 0)),
          }
        : null,
    ].filter(Boolean);
    bars.forEach((bar, r) => {
      const by = base + 38 + r * 34;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.fillStyle = theme.fg(0.6);
      ctx.font = font(17, 500);
      ctx.fillText(bar.label, inX, by);
      const trackX = inX + 140;
      const trackW = inW - 140 - 76;
      pill(ctx, trackX, by - 5, trackW, 10, theme.track);
      const ratio = bar.value == null ? 0 : Math.max(0, Math.min(1, bar.value / bar.max));
      if (ratio > 0) pill(ctx, trackX, by - 5, Math.max(10, trackW * ratio), 10, bar.color);
      ctx.textAlign = "right";
      ctx.fillStyle = theme.text;
      ctx.font = font(19, 600, true);
      ctx.fillText(bar.text, inX + inW, by);
    });
  });
}

export async function renderStatsCard(data) {
  await document.fonts?.ready;
  theme = THEMES[data.theme] ?? THEMES.dark;
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
  const upper = (text) => text.toLocaleUpperCase(data.locale === "en" ? "en-US" : "tr-TR");
  const fmt = (value, digits = 2) => (value == null || value === "" ? "—" : nf(digits).format(Number(value)));

  ctx.fillStyle = theme.page;
  ctx.fillRect(0, 0, W, H);

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = theme.accent;
  ctx.save();
  ctx.letterSpacing = "2.5px";
  ctx.font = font(18, 700);
  ctx.fillText(data.labels.eyebrow, PAD, PAD + 22);
  ctx.restore();

  ctx.fillStyle = theme.text;
  ctx.font = font(70, 700, true);
  ctx.fillText(data.code, PAD, PAD + 104);
  const codeWidth = ctx.measureText(data.code).width;

  ctx.font = font(34, 600);
  const nameLines = wrap(ctx, data.name, W - PAD * 2 - codeWidth - 28, 2);
  const nameTop = nameLines.length === 1 ? PAD + 96 : PAD + 74;
  ctx.fillStyle = theme.text;
  nameLines.forEach((line, i) => ctx.fillText(line, PAD + codeWidth + 28, nameTop + i * 40));

  ctx.fillStyle = theme.fg(0.65);
  ctx.fillText(fit(ctx, data.meta, W - PAD * 2, 27, 500, font, false, 18), PAD, PAD + 156);

  const kpiBottom = drawKpis(ctx, font, data.kpis, PAD + 190, upper);

  const bodyTop = kpiBottom + GAP;
  const bodyBottom = H - PAD - 44;
  const bodyH = bodyBottom - bodyTop;
  const dists = data.distributions.filter((d) => d.rows.length > 0);
  const exams = data.exams;

  const hasDist = dists.length > 0;
  const hasExams = exams.length > 0;
  const leftW = hasExams && hasDist ? Math.round((W - PAD * 2 - GAP) * 0.57) : W - PAD * 2;
  const rightX = hasDist ? PAD + leftW + GAP : PAD;
  const rightW = hasDist ? W - PAD - rightX : W - PAD * 2;

  if (hasDist) {
    const weights = dists.map((d, i) => d.rows.length + (i === 0 ? 2.4 : 1.6));
    const sum = weights.reduce((a, b) => a + b, 0);
    let y = bodyTop;
    dists.forEach((dist, i) => {
      const h =
        i === dists.length - 1 ? bodyBottom - y : (bodyH - GAP * (dists.length - 1)) * (weights[i] / sum);
      drawDistribution(ctx, font, { ...dist, legend: i === 0 ? data.legend : null }, PAD, y, leftW, h, fmt, pct, upper);
      y += h + GAP;
    });
  }

  if (hasExams) {
    drawExams(ctx, font, { title: data.labels.exams, exams, labels: data.labels }, rightX, bodyTop, rightW, bodyH, fmt, pct, upper);
  }

  if (!hasDist && !hasExams) {
    card(ctx, PAD, bodyTop, W - PAD * 2, bodyH);
    ctx.fillStyle = theme.fg(0.55);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = font(26, 500);
    ctx.fillText(data.labels.noDetail, W / 2, bodyTop + bodyH / 2);
  }

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = theme.text;
  ctx.font = font(21, 600);
  ctx.fillText(data.url, PAD, H - PAD);
  ctx.textAlign = "right";
  ctx.fillStyle = theme.fg(0.5);
  ctx.font = font(19, 500);
  ctx.fillText(data.labels.footer, W - PAD, H - PAD);

  return canvas;
}

export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob"))), "image/png"),
  );
}

export const statsCardLegend = (name) => {
  const colors = THEMES[name] ?? THEMES.dark;
  return { pass: colors.pass, conditional: GOLD, fail: colors.fail };
};

export const STATS_CARD_THEMES = Object.keys(THEMES);

export const STATS_CARD_SIZE = { width: W, height: H };
