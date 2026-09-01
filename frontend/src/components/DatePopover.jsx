import { useState } from "react";
import {
  MONTH_NAMES,
  WEEKDAY_INITIALS,
  monthGrid,
  parseIsoDate,
  toIsoDate,
} from "../utils/calendar";

function DatePopover({ value, onSelect, enabledDates = null, inline = false }) {
  const selected = parseIsoDate(value);
  const [cursor, setCursor] = useState({
    year: selected.year,
    month: selected.month,
  });

  const today = new Date();
  const todayIso = toIsoDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const selectedIso = toIsoDate(selected.year, selected.month, selected.day);

  const shiftMonth = (step) => {
    setCursor((current) => {
      const next = new Date(Date.UTC(current.year, current.month + step, 1));

      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });
  };

  return (
    <div
      className={
        inline
          ? "picker-popover date-popover inline"
          : "picker-popover date-popover"
      }
    >
      <div className="picker-head">
        <button
          type="button"
          aria-label="Előző év"
          onClick={() => shiftMonth(-12)}
        >
          «
        </button>
        <button
          type="button"
          aria-label="Előző hónap"
          onClick={() => shiftMonth(-1)}
        >
          ‹
        </button>

        <span>
          {cursor.year} {MONTH_NAMES[cursor.month]}
        </span>

        <button
          type="button"
          aria-label="Következő hónap"
          onClick={() => shiftMonth(1)}
        >
          ›
        </button>
        <button
          type="button"
          aria-label="Következő év"
          onClick={() => shiftMonth(12)}
        >
          »
        </button>
      </div>

      <div className="picker-weekdays">
        {WEEKDAY_INITIALS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="picker-days">
        {monthGrid(cursor.year, cursor.month).map((day) => {
          const classes = ["picker-day"];

          if (!day.isCurrentMonth) {
            classes.push("muted");
          }

          if (day.iso === selectedIso) {
            classes.push("selected");
          }

          if (day.iso === todayIso) {
            classes.push("today");
          }

          const isEnabled = !enabledDates || enabledDates.has(day.iso);

          return (
            <button
              className={classes.join(" ")}
              key={day.iso}
              type="button"
              disabled={!isEnabled}
              onClick={() => onSelect(day.iso)}
            >
              {day.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DatePopover;
