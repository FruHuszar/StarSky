import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import DatePopover from "./DatePopover";
import MaskedPickerField from "./MaskedPickerField";
import { BEHENIAN_STARS } from "../data/starGuide";
import {
  behenianEntry,
  behenianForStar,
  dateEntry,
  mythologyEntry,
  mythologyForStar,
  sunConjunctionDates,
} from "../sky/starGuide";

const FIRST_YEAR = 1950;

const KINDS = [
  {
    id: "date",
    title: "Dátum alapján",
    description:
      "Az a nap, amikor a Nap ehhez a csillaghoz ért. Évente egyszer fordul elő.",
  },
  {
    id: "mythology",
    title: "Görög-római mitológia",
    description:
      "A csillaghoz kötődő mondák és alakok. Több is választható, ha több tartozik hozzá.",
  },
  {
    id: "behenian",
    title: "Behéni hagyomány",
    description:
      "A tizenöt behéni állócsillag egyike-e, és ha igen, milyen kő tartozik hozzá.",
  },
];

function StarTextModal({ star, onClose, onAdd }) {
  const [step, setStep] = useState(1);
  const [kind, setKind] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("22:00");
  const [storyIds, setStoryIds] = useState([]);

  const dates = useMemo(
    () =>
      kind === "date"
        ? sunConjunctionDates(star, new Date().getFullYear() - FIRST_YEAR + 1)
        : [],
    [kind, star],
  );
  const enabledDates = useMemo(() => new Set(dates), [dates]);
  const stories = mythologyForStar(star);
  const behenian = behenianForStar(star);

  const canAdd =
    (kind === "date" && date) ||
    (kind === "mythology" && storyIds.length > 0) ||
    (kind === "behenian" && behenian);

  const handleAdd = () => {
    const entry =
      kind === "date"
        ? dateEntry(star, date)
        : kind === "mythology"
          ? mythologyEntry(star, storyIds)
          : behenianEntry(star);

    if (entry) {
      onAdd(entry);
    }

    onClose();
  };

  const toggleStory = (id) => {
    setStoryIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="modal star-guide"
        role="dialog"
        aria-modal="true"
        aria-label="A csillaghoz tartozó leírás"
      >
        <div className="modal-head">
          <div className="modal-progress" aria-hidden="true">
            {[1, 2].map((index) => (
              <span
                className={
                  index <= step ? "progress-step done" : "progress-step"
                }
                key={index}
              />
            ))}
          </div>

          <div className="modal-title">
            <h3>A csillaghoz tartozó leírás</h3>
            <p>
              {star} · {step}. lépés / 2
            </p>
          </div>

          <button
            className="modal-close"
            type="button"
            aria-label="Bezárás"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div className="guide-paths">
              <h4 className="guide-question-title">
                Milyen leírást szeretnél hozzáadni?
              </h4>

              {KINDS.map((item) => (
                <button
                  className={
                    kind === item.id ? "guide-path selected" : "guide-path"
                  }
                  key={item.id}
                  type="button"
                  aria-pressed={kind === item.id}
                  onClick={() => setKind(item.id)}
                >
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && kind === "date" && (
            <div className="date-choice">
              <div className="date-choice-list">
                <h4>Melyik csillaghoz tartozó dátumot választod?</h4>

                <div className="date-columns">
                  {dates.map((item) => (
                    <button
                      className={
                        item === date ? "book-date selected" : "book-date"
                      }
                      key={item}
                      type="button"
                      onClick={() => setDate(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="date-choice-calendar">
                <h4>Vagy válaszd naptárból</h4>

                <DatePopover
                  inline
                  value={date || dates[0]}
                  enabledDates={enabledDates}
                  onSelect={setDate}
                />

                <div className="star-field">
                  <MaskedPickerField
                    type="time"
                    label="Időpont (nem kötelező)"
                    value={time}
                    onChange={setTime}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && kind === "mythology" && (
            <div className="guide-question">
              <h4>Melyik történet kerüljön a könyvbe?</h4>

              {stories.length === 0 ? (
                <p className="guide-empty">
                  Ehhez a csillaghoz nem tartozik görög-római történet.
                </p>
              ) : (
                <div className="story-tags">
                  {stories.map((story) => (
                    <button
                      className={
                        storyIds.includes(story.id)
                          ? "story-tag selected"
                          : "story-tag"
                      }
                      key={story.id}
                      type="button"
                      aria-pressed={storyIds.includes(story.id)}
                      onClick={() => toggleStory(story.id)}
                    >
                      <b>{story.figure}</b>
                      <span>{story.story}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && kind === "behenian" && (
            <div className="guide-question">
              {behenian ? (
                <div className="behenian-result">
                  <h4>
                    {behenian.star} – {behenian.constellation}
                  </h4>
                  <p>{behenian.meaning}</p>
                  <p className="guide-result-gem">
                    A hagyomány szerinti kő: <b>{behenian.gem}</b> · növény:{" "}
                    {behenian.herb}
                  </p>
                </div>
              ) : (
                <div className="behenian-empty">
                  <p>Ez a csillag nem része a 15 behéni csillagnak.</p>

                  <ul className="behenian-list">
                    {BEHENIAN_STARS.map((entry) => (
                      <li key={entry.star}>
                        {entry.star}
                        <span>{entry.gem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-foot">
          {step > 1 && (
            <button
              className="cancel-button"
              type="button"
              onClick={() => setStep(1)}
            >
              Vissza
            </button>
          )}

          {step === 1 ? (
            <button
              className="next-button"
              type="button"
              disabled={!kind}
              onClick={() => setStep(2)}
            >
              Tovább
            </button>
          ) : (
            <button
              className="next-button"
              type="button"
              disabled={!canAdd}
              onClick={handleAdd}
            >
              Hozzáadás a könyvhöz
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default StarTextModal;
