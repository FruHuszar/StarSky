const HOURS = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, "0"),
);

const MINUTES = Array.from({ length: 12 }, (_, index) =>
  String(index * 5).padStart(2, "0"),
);

/** Óra és perc két oszlopban, 24 órás formában. */
function TimePopover({ value, onSelect }) {
  const [hour = "22", minute = "00"] = (value ?? "").split(":");

  return (
    <div className="picker-popover time-popover">
      <div className="picker-column" role="listbox" aria-label="Óra">
        {HOURS.map((item) => (
          <button
            className={item === hour ? "picker-slot selected" : "picker-slot"}
            key={item}
            type="button"
            onClick={() => onSelect(`${item}:${minute}`)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="picker-column" role="listbox" aria-label="Perc">
        {MINUTES.map((item) => (
          <button
            className={item === minute ? "picker-slot selected" : "picker-slot"}
            key={item}
            type="button"
            onClick={() => onSelect(`${hour}:${item}`)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TimePopover;
