const FOLD = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };

export const fold = (text) =>
  String(text ?? "")
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşüâîû]/g, (char) => FOLD[char]);

export const queryWords = (query) => fold(query).split(/\s+/).filter(Boolean);

export const matchesWords = (words, ...fields) => {
  const haystack = fold(fields.join(" "));
  return words.every((word) => haystack.includes(word));
};
