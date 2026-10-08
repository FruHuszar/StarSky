import { useEffect, useRef, useState } from "react";
import DatePopover from "./DatePopover";
import TimePopover from "./TimePopover";

const PATTERNS = {
  date: {
    placeholder: "ÉÉÉÉ-HH-NN",
    digits: 8,
    maxLength: 10,
    label: "Dátum választása",
    format: (digits) =>
      [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)]
        .filter((part) => part.length > 0)
        .join("-"),
    isComplete: (value) => /^\d{4}-\d{2}-\d{2}$/.test(value),
  },
  time: {
    placeholder: "ÓÓ:PP",
    digits: 4,
    maxLength: 5,
    label: "Időpont választása",
    format: (digits) =>
      [digits.slice(0, 2), digits.slice(2, 4)]
        .filter((part) => part.length > 0)
        .join(":"),
    isComplete: (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value),
  },
};

const isRealDate = (value) => {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

function MaskedPickerField({ type, value, onChange, label, ariaLabel }) {
  const pattern = PATTERNS[type];
  const [draft, setDraft] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const isValidValue = (next) =>
    pattern.isComplete(next) && (type !== "date" || isRealDate(next));

  const commit = (next) => {
    if (!isValidValue(next)) {
      return false;
    }

    setDraft(null);
    onChange(next);

    return true;
  };

  const handleInput = (event) => {
    const digits = event.target.value
      .replace(/\D/g, "")
      .slice(0, pattern.digits);
    const formatted = pattern.format(digits);

    setDraft(formatted);

    if (formatted.length === pattern.maxLength) {
      commit(formatted);
    }
  };

  /** Félbehagyott vagy értelmetlen érték esetén visszaáll az utolsó érvényesre. */
  const handleBlur = () => {
    if (!commit(draft ?? value)) {
      setDraft(null);
    }
  };

  const handleSelect = (next) => {
    commit(next);
    setIsOpen(false);
  };

  const Popover = type === "date" ? DatePopover : TimePopover;

  return (
    <div className="masked-field" ref={containerRef}>
      {label && <span className="masked-field-label">{label}</span>}

      <span className="masked-field-input">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label={ariaLabel ?? label}
          placeholder={pattern.placeholder}
          maxLength={pattern.maxLength}
          value={draft ?? value}
          onChange={handleInput}
          onBlur={handleBlur}
        />

        <button
          className="masked-field-picker"
          type="button"
          aria-label={pattern.label}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          {type === "date" ? "▤" : "◷"}
        </button>

        {isOpen && <Popover value={value} onSelect={handleSelect} />}
      </span>
    </div>
  );
}

export default MaskedPickerField;
