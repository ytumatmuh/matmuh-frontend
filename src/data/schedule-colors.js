export const COURSE_COLORS = [
  "#1D2445",
  "#3F5E86",
  "#2E6B60",
  "#6E4668",
  "#8A4B36",
  "#40507E",
  "#4E6B4A",
  "#7A4550",
];

export const NAVY_RGB = "29,36,69";
export const GOLD_RGB = "173,151,111";

export function courseColors(entries) {
  const codes = [...new Set(entries.map((entry) => entry.code))].sort((a, b) =>
    a.localeCompare(b, "tr"),
  );
  return new Map(
    codes.map((code, index) => [
      code,
      COURSE_COLORS[index % COURSE_COLORS.length],
    ]),
  );
}

export const colorOf = (palette, code) => palette.get(code) ?? COURSE_COLORS[0];

const overWhite = (rgb, alpha) =>
  `rgb(${rgb
    .split(",")
    .map((channel) => Math.round(255 + (Number(channel) - 255) * alpha))
    .join(",")})`;

export const tintOf = (elective, faded = false) =>
  overWhite(elective ? GOLD_RGB : NAVY_RGB, faded ? 0.035 : elective ? 0.2 : 0.04);
