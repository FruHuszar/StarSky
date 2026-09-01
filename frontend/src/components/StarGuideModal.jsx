import { useEffect, useRef, useState } from "react";
import MaskedPickerField from "./MaskedPickerField";
import { MYTHOLOGY_TRAITS, PATHS, PROTECTIVE_EFFECTS } from "../data/starGuide";
import { buildGuideResult } from "../sky/starGuide";

const TOTAL_STEPS = 3;

const QUESTION_TITLES = {
  date: "Melyik nap égboltját keresed?",
  mythology: "Mit szeretnél, hogy a csillagod jelentsen?",
  behenian: "Milyen védelmet keresel?",
};

function StarGuideModal({ view, onClose, onSelect }) {
  const [step, setStep] = useState(1);
  const [path, setPath] = useState(null);
  const [answers, setAnswers] = useState({
    date: view.date,
    time: "22:00",
    trait: MYTHOLOGY_TRAITS[0].id,
    effect: PROTECTIVE_EFFECTS[0].id,
  });
  const [addToBook, setAddToBook] = useState(true);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const result =
    step === TOTAL_STEPS && path
      ? buildGuideResult(path, {
          ...answers,
          timeZone: view.timeZone,
          longitude: view.longitude,
        })
      : null;

  const canAdvance = step === 1 ? Boolean(path) : true;

  const handleConfirm = () => {
    onSelect({
      starName: result.starName,
      gem: result.gem,
      isGemFixed: result.isGemFixed,
      bookEntry: addToBook
        ? {
            star: result.starName,
            label: result.bookLabel,
            text: result.bookText,
          }
        : null,
    });
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="modal star-guide"
        role="dialog"
        aria-modal="true"
        aria-label="Mi a szerencsecsillagom?"
        ref={dialogRef}
      >
        <div className="modal-head">
          <div className="modal-progress" aria-hidden="true">
            {Array.from({ length: TOTAL_STEPS }, (_, index) => (
              <span
                className={
                  index < step ? "progress-step done" : "progress-step"
                }
                key={index}
              />
            ))}
          </div>

          <div className="modal-title">
            <h3>Mi a szerencsecsillagom?</h3>
            <p>
              {step}. lépés / {TOTAL_STEPS}
            </p>
          </div>

          <button
            className="modal-close"
            type="button"
            aria-label="Bezárás"
            ref={closeRef}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div className="guide-paths">
              {PATHS.map((item) => (
                <button
                  className={
                    path === item.id ? "guide-path selected" : "guide-path"
                  }
                  key={item.id}
                  type="button"
                  aria-pressed={path === item.id}
                  onClick={() => setPath(item.id)}
                >
                  <h4>{item.title}</h4>
                  <p className="guide-path-summary">{item.summary}</p>
                  <p>{item.description}</p>
                  <div className="guide-tags">
                    <span className="guide-tag">
                      Kinek ajánljuk: {item.recommended}
                    </span>
                    {item.note && (
                      <span className="guide-tag fixed-gem">Kő kötött</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && path && (
            <div className="guide-question">
              <h4>{QUESTION_TITLES[path]}</h4>

              {path === "date" && (
                <div className="guide-date">
                  <MaskedPickerField
                    type="date"
                    label="Dátum"
                    value={answers.date}
                    onChange={(next) =>
                      setAnswers((current) => ({ ...current, date: next }))
                    }
                  />
                  <MaskedPickerField
                    type="time"
                    label="Időpont (nem kötelező)"
                    value={answers.time}
                    onChange={(next) =>
                      setAnswers((current) => ({ ...current, time: next }))
                    }
                  />
                </div>
              )}

              {path === "mythology" && (
                <div className="guide-options">
                  {MYTHOLOGY_TRAITS.map((trait) => (
                    <label className="guide-option" key={trait.id}>
                      <input
                        type="radio"
                        name="trait"
                        checked={answers.trait === trait.id}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            trait: trait.id,
                          }))
                        }
                      />
                      <span>{trait.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {path === "behenian" && (
                <div className="guide-options">
                  {PROTECTIVE_EFFECTS.map((effect) => (
                    <label className="guide-option" key={effect.id}>
                      <input
                        type="radio"
                        name="effect"
                        checked={answers.effect === effect.id}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            effect: effect.id,
                          }))
                        }
                      />
                      <span>{effect.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && result && (
            <div className="guide-result">
              <p className="guide-result-label">A csillagod</p>
              <h4 className="guide-result-star">{result.starName}</h4>

              {result.constellation && (
                <p className="guide-result-constellation">
                  {result.constellation}
                </p>
              )}

              <p className="guide-result-summary">{result.summary}</p>

              <p className="guide-result-gem">
                Javasolt kő: <b>{result.gem}</b>
                {result.isGemFixed && (
                  <span> – a hagyomány szerint ehhez a csillaghoz kötött.</span>
                )}
              </p>

              <label className="guide-book-toggle">
                <input
                  type="checkbox"
                  checked={addToBook}
                  onChange={(event) => setAddToBook(event.target.checked)}
                />
                <span>{result.bookLabel} bekerüljön az emlékkönyvbe</span>
              </label>

              <p className="guide-book-preview">{result.bookText}</p>
            </div>
          )}
        </div>

        <div className="modal-foot">
          {step > 1 && (
            <button
              className="cancel-button"
              type="button"
              onClick={() => setStep((current) => current - 1)}
            >
              Vissza
            </button>
          )}

          {step < TOTAL_STEPS ? (
            <button
              className="next-button"
              type="button"
              disabled={!canAdvance}
              onClick={() => setStep((current) => current + 1)}
            >
              Tovább
            </button>
          ) : (
            <button
              className="next-button"
              type="button"
              onClick={handleConfirm}
            >
              Ezt a csillagot választom
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default StarGuideModal;
