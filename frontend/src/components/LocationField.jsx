import { useEffect, useRef, useState } from "react";
import { suggestLocations } from "../api/geocodeService";

function LocationField({ value, bias, onChange, onPick }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef(null);
  const skipRef = useRef(false);
  const typedRef = useRef(false);

  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false;
      return undefined;
    }

    const controller = new AbortController();

    if (!typedRef.current || value.trim().length < 3) {
      const timer = setTimeout(() => setSuggestions([]), 0);

      return () => clearTimeout(timer);
    }

    const timer = setTimeout(async () => {
      try {
        const { results, isOffline: offline } = await suggestLocations(
          value,
          controller.signal,
          bias,
        );
        setSuggestions(results);
        setIsOffline(offline);
        setHighlighted(-1);
        setIsOpen(results.length > 0 || offline);
      } catch {
        setSuggestions([]);
      }
    }, 160);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [value, bias]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const choose = (suggestion) => {
    skipRef.current = true;
    setIsOpen(false);
    setSuggestions([]);
    onPick({
      ...suggestion,
      label: [suggestion.name, suggestion.detail].filter(Boolean).join(", "),
    });
  };

  const handleKeyDown = (event) => {
    if (!isOpen || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((current) =>
        Math.min(current + 1, suggestions.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter" && highlighted >= 0) {
      event.preventDefault();
      choose(suggestions[highlighted]);
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="location-field" ref={containerRef}>
      <input
        type="text"
        autoComplete="off"
        aria-label="Hely"
        aria-expanded={isOpen}
        placeholder="Város, utca, házszám"
        value={value}
        onChange={(event) => {
          typedRef.current = true;
          onChange(event.target.value);
        }}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
      />

      {isOpen && isOffline && (
        <p className="location-empty">
          A helykereső most nem elérhető. Próbáld újra, vagy írd be a város
          nevét.
        </p>
      )}

      {isOpen && suggestions.length > 0 && (
        <ul className="location-suggestions" role="listbox">
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.id}>
              <button
                className={
                  index === highlighted
                    ? "location-suggestion active"
                    : "location-suggestion"
                }
                type="button"
                onClick={() => choose(suggestion)}
              >
                <b>{suggestion.name}</b>
                <span>{suggestion.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LocationField;
