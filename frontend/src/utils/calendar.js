/** Naptár-segédek magyar hét- és hónapnevekkel. */

export const MONTH_NAMES = [
  "Január",
  "Február",
  "Március",
  "Április",
  "Május",
  "Június",
  "Július",
  "Augusztus",
  "Szeptember",
  "Október",
  "November",
  "December",
];

export const WEEKDAY_INITIALS = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];

export const toIsoDate = (year, month, day) =>
  [
    String(year).padStart(4, "0"),
    String(month + 1).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");

export const parseIsoDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");

  if (!match) {
    const today = new Date();

    return {
      year: today.getFullYear(),
      month: today.getMonth(),
      day: today.getDate(),
    };
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
  };
};

export const monthGrid = (year, month) => {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const start = new Date(Date.UTC(year, month, 1 - offset));

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + index);

    return {
      year: day.getUTCFullYear(),
      month: day.getUTCMonth(),
      day: day.getUTCDate(),
      isCurrentMonth: day.getUTCMonth() === month,
      iso: toIsoDate(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()),
    };
  });
};
