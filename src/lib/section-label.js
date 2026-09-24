const LANGUAGE_NAME = { ENGLISH: "İngilizce", TURKISH: "Türkçe" };

export function sectionLabel(t, section) {
  const language = LANGUAGE_NAME[section.language];
  return [t("Grup {group}", { group: section.section }), language ? t(language) : null]
    .filter(Boolean)
    .join(" · ");
}
