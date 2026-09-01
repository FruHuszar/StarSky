import { useState } from "react";
import BookBuilder from "./BookBuilder";
import MaskedPickerField from "./MaskedPickerField";
import {
  CUSTOM_TEXT_LIMIT,
  LAYERS,
  MAGNITUDE_RANGE,
  MAX_FAVOURITE_STARS,
} from "../sky/settings";

const MAGNITUDE_HINTS = [
  ["Faluban, hegyekben", "6.0 – 6.5"],
  ["Kisvárosban", "5.0 – 5.5"],
  ["Városban", "4.0 – 4.5"],
  ["Nagyváros belvárosában", "3.0 – 3.5"],
];

function StarSettings({
  settings,
  stars,
  missingStars = [],
  daylightStars = [],
  onChange,
  onReset,
  onOpenGuide,
  onAddBookEntry,
  onRemoveBookEntry,
}) {
  const favouriteOptions = stars
    .slice()
    .sort((first, second) => first.name.localeCompare(second.name, "hu"));
  const chosen = settings.favouriteStars;
  const visibleStars = chosen.filter((name) => !missingStars.includes(name));
  const visibleEntries = settings.bookEntries.filter(
    (entry) => !entry.star || !missingStars.includes(entry.star),
  );
  const [emptySlots, setEmptySlots] = useState(0);
  const slots = [...chosen, ...Array(Math.max(emptySlots, 0)).fill("")];

  if (slots.length === 0) {
    slots.push("");
  }

  const setStar = (index, name) => {
    const next = [...slots];
    next[index] = name;

    if (index >= chosen.length && name) {
      setEmptySlots((current) => Math.max(0, current - 1));
    }

    onChange("favouriteStars", next.filter(Boolean));
  };

  const addSlot = () => {
    setEmptySlots((current) => current + 1);
  };

  const scrollTo = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearSlot = (index) => {
    onChange(
      "favouriteStars",
      chosen.filter((_, position) => position !== index),
    );
  };

  const removeSlot = (index) => {
    if (index >= chosen.length) {
      setEmptySlots((current) => Math.max(0, current - 1));
      return;
    }

    onChange(
      "favouriteStars",
      chosen.filter((_, position) => position !== index),
    );
  };

  return (
    <div className="star-settings-boxes" id="star-settings">
      <section className="star-settings" id="settings-sky">
        <div className="star-settings-group">
          <h4>Rétegek</h4>

          <div className="star-settings-layers">
            {LAYERS.map((layer) => (
              <label className="star-toggle" key={layer.key}>
                <input
                  type="checkbox"
                  checked={settings[layer.key]}
                  onChange={(event) =>
                    onChange(layer.key, event.target.checked)
                  }
                />
                <span>{layer.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="star-settings-group">
          <h4>Az égbolt pillanata</h4>

          <div className="star-field">
            <MaskedPickerField
              type="time"
              label="Időpont"
              value={settings.time}
              onChange={(next) => onChange("time", next)}
            />
          </div>

          <label className="star-field magnitude-block">
            <span>
              Halványsági határ
              <b>{settings.magnitudeLimit.toFixed(1)} magnitúdó</b>
            </span>
            <input
              type="range"
              min={MAGNITUDE_RANGE.minimum}
              max={MAGNITUDE_RANGE.maximum}
              step={MAGNITUDE_RANGE.step}
              value={settings.magnitudeLimit}
              onChange={(event) =>
                onChange("magnitudeLimit", Number(event.target.value))
              }
            />
          </label>

          <p className="star-hint">A leghitelesebb eredményért:</p>

          <dl className="magnitude-hints">
            {MAGNITUDE_HINTS.map(([place, range]) => (
              <div key={place}>
                <dt>{place}</dt>
                <dd>{range}</dd>
              </div>
            ))}
          </dl>
        </div>

        <button
          className="scroll-hint"
          type="button"
          aria-label="Tovább az ékszerhez"
          onClick={() => scrollTo("settings-jewel")}
        >
          ↓
        </button>
      </section>

      <section className="star-settings" id="settings-jewel">
        <div className="star-settings-group star-settings-jewel">
          <h4>Az ékszer</h4>

          <div className="star-field">
            <span>Kedvenc csillagok</span>

            {slots.map((name, index) => (
              <div className="favourite-row" key={`${name}-${index}`}>
                <select
                  aria-label={`${index + 1}. csillag`}
                  value={name}
                  onChange={(event) => setStar(index, event.target.value)}
                >
                  <option value="">Nincs kiválasztva</option>
                  {favouriteOptions
                    .filter(
                      (star) =>
                        star.name === name || !chosen.includes(star.name),
                    )
                    .map((star) => (
                      <option key={star.name} value={star.name}>
                        {star.name} ({star.magnitude.toFixed(1)} mag)
                      </option>
                    ))}
                </select>

                <button
                  className="slot-button"
                  type="button"
                  aria-label={
                    index === 0 ? "Választás törlése" : "Csillag elvétele"
                  }
                  disabled={index === 0 && !name}
                  onClick={() =>
                    index === 0 ? clearSlot(0) : removeSlot(index)
                  }
                >
                  −
                </button>

                {index === slots.length - 1 && (
                  <button
                    className="slot-button"
                    type="button"
                    aria-label="Új csillag hozzáadása"
                    disabled={
                      !name ||
                      slots.length >= MAX_FAVOURITE_STARS ||
                      slots.length >= favouriteOptions.length
                    }
                    onClick={addSlot}
                  >
                    +
                  </button>
                )}
              </div>
            ))}
          </div>

          <p className="star-hint">
            A kiválasztott csillagok helyére kerül egy-egy kő az ékszeren.
          </p>

          {missingStars.length > 0 && (
            <p className="jewel-warning">
              {missingStars.join(", ")} jelenleg nincs a képen. Így nem kerül az
              ékszerre és az emlékkönyvbe sem – nagyítsd vagy mozgasd a képet,
              hogy látszódjon.
            </p>
          )}

          <button className="guide-link" type="button" onClick={onOpenGuide}>
            <span aria-hidden="true">?</span> Mi a szerencsecsillagom?
          </button>
        </div>

        <button
          className="scroll-hint"
          type="button"
          aria-label="Tovább az emlékkönyvhöz"
          onClick={() => scrollTo("settings-book")}
        >
          ↓
        </button>
      </section>

      <section className="star-settings" id="settings-book">
        <div className="star-settings-group star-settings-book">
          <h4>Az emlékkönyv</h4>

          <label className="star-field">
            <span>
              Egyedi felirat
              <b>
                {settings.customText.length}/{CUSTOM_TEXT_LIMIT}
              </b>
            </span>
            <textarea
              rows={3}
              maxLength={CUSTOM_TEXT_LIMIT}
              placeholder="Az első találkozásunk…"
              value={settings.customText}
              onChange={(event) => onChange("customText", event.target.value)}
            />
          </label>

          <BookBuilder
            stars={visibleStars}
            daylightStars={daylightStars}
            onAdd={onAddBookEntry}
          />

          {visibleEntries.length > 0 && (
            <ul className="book-entries">
              {visibleEntries.map((entry, index) => (
                <li key={entry.label + index}>
                  <div>
                    <b>{entry.label}</b>
                    <p>{entry.text}</p>
                  </div>
                  <button
                    className="slot-button"
                    type="button"
                    aria-label={`${entry.label} eltávolítása`}
                    onClick={() =>
                      onRemoveBookEntry(settings.bookEntries.indexOf(entry))
                    }
                  >
                    −
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="star-settings-footer">
          <button className="reset-button" type="button" onClick={onReset}>
            Alaphelyzet
          </button>
        </div>
      </section>
    </div>
  );
}

export default StarSettings;
