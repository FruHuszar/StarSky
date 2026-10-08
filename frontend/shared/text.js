const INVISIBLE = /[\p{Cc}\p{Cf}]/gu;
const INVISIBLE_EXCEPT_NEWLINE = /(?!\n)[\p{Cc}\p{Cf}]/gu;
const MARKUP = /[<>]/g;
const ENGRAVING_BLOCKED = /[^\p{L}\p{M}\p{N} .,!?'’&+\-:()]/gu;

export const LOCATION_PATTERN = /^[\p{L}\p{M}\p{N}\p{Zs}.,!?'’"„”()\-–/&]+$/u;
export const STAR_NAME_PATTERN = /^[\p{L}\p{M}\p{N} ]+$/u;

export const cleanText = (value, { multiline = false } = {}) =>
  String(value ?? "")
    .normalize("NFC")
    .replace(multiline ? INVISIBLE_EXCEPT_NEWLINE : INVISIBLE, "")
    .replace(MARKUP, "");

export const cleanEngraving = (value) =>
  cleanText(value).replace(ENGRAVING_BLOCKED, "");
