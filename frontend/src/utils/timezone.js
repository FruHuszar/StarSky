/**
 * Időzóna-kezelés.
 *
 * A felhasználó helyi falióra-időt ad meg ("az esküvő 16:00-kor kezdődött"),
 * a csillagászati számítás viszont UTC-t vár. A geokódolótól kapott IANA
 * zónanevet a böngésző saját időzóna-adatbázisával oldjuk fel, így a nyári
 * időszámítás is helyes. Ha nincs zónanév, a földrajzi hosszúságból adódó
 * középidőre esünk vissza.
 */

const OFFSET_FORMATTERS = new Map();

const formatterFor = (timeZone) => {
  if (!OFFSET_FORMATTERS.has(timeZone)) {
    OFFSET_FORMATTERS.set(
      timeZone,
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    );
  }

  return OFFSET_FORMATTERS.get(timeZone);
};

export const isSupportedTimeZone = (timeZone) => {
  if (!timeZone) {
    return false;
  }

  try {
    formatterFor(timeZone).format(new Date());
    return true;
  } catch {
    return false;
  }
};

/** Az adott zóna eltolódása percben, a megadott pillanatban. */
export const zoneOffsetMinutes = (timeZone, instant) => {
  const parts = formatterFor(timeZone).formatToParts(instant);
  const values = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      values[part.type] = Number(part.value);
    }
  });

  const asUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour % 24,
    values.minute,
    values.second,
  );

  return Math.round((asUtc - instant.getTime()) / 60000);
};

export const toUtcInstant = ({ date, time, timeZone, longitude = 0 }) => {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = (time || "22:00").split(":").map(Number);
  const naive = Date.UTC(year, month - 1, day, hour, minute, 0);

  if (!isSupportedTimeZone(timeZone)) {
    return new Date(naive - (longitude / 15) * 3600000);
  }

  const firstGuess = new Date(
    naive - zoneOffsetMinutes(timeZone, new Date(naive)) * 60000,
  );

  return new Date(naive - zoneOffsetMinutes(timeZone, firstGuess) * 60000);
};

/** Emberi olvasásra: "UTC+02:00". */
export const formatOffset = (timeZone, instant, longitude = 0) => {
  const minutes = isSupportedTimeZone(timeZone)
    ? zoneOffsetMinutes(timeZone, instant)
    : Math.round((longitude / 15) * 60);
  const sign = minutes < 0 ? "-" : "+";
  const absolute = Math.abs(minutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
  const rest = String(absolute % 60).padStart(2, "0");

  return `UTC${sign}${hours}:${rest}`;
};
