import { useState } from "react";
import GemIcon from "./GemIcon";
import JewelryIcon from "./JewelryIcon";
import {
  ENGRAVING_LIMIT,
  JEWELRY_TYPES,
  METALS,
  SELECTABLE_STONES,
} from "../data/jewelry";
import {
  engravingDetails,
  metalById,
  placementsFor,
  typeById,
} from "../sky/jewelry";

function MetalSwatch({ metal, checked, onSelect }) {
  return (
    <label
      className="swatch"
      title={metal.label}
      style={{
        "--swatch-light": metal.tones.light,
        "--swatch-dark": metal.tones.dark,
      }}
    >
      <input
        className="visually-hidden"
        type="radio"
        name="jewelry-metal"
        checked={checked}
        aria-label={metal.label}
        onChange={() => onSelect(metal.id)}
      />
      <span className="swatch-fill" aria-hidden="true" />
    </label>
  );
}

function StoneRow({ index, entry, placements, onChange }) {
  const { star, stone, placement, isLocked } = entry;
  const [isPicking, setIsPicking] = useState(false);
  const pickerId = `stone-picker-${index}`;
  const activePlacement = placements.find((item) => item.id === placement);

  return (
    <li className="stone-row">
      <div className="stone-row-head">
        <GemIcon color={stone.color} />
        <div>
          <b>{star}</b>
          <span>{stone.name}</span>
        </div>

        {isLocked ? (
          <span className="stone-badge">Kötött kő</span>
        ) : (
          <button
            className="stone-change"
            type="button"
            aria-expanded={isPicking}
            aria-controls={pickerId}
            onClick={() => setIsPicking((current) => !current)}
          >
            {isPicking ? "Bezárás" : "Kő cseréje"}
          </button>
        )}
      </div>

      {isLocked && (
        <p className="stone-note">
          A behéni hagyomány szerint ehhez a csillaghoz kizárólag {stone.name}{" "}
          illik.
        </p>
      )}

      {isPicking && !isLocked && (
        <fieldset className="stone-options" id={pickerId}>
          <legend className="visually-hidden">{star} köve</legend>
          {SELECTABLE_STONES.map((option) => (
            <label className="stone-option" key={option.name}>
              <input
                className="visually-hidden"
                type="radio"
                name={`stone-${index}`}
                checked={option.name === stone.name}
                onChange={() => {
                  onChange(star, { gem: option.name });
                  setIsPicking(false);
                }}
              />
              <GemIcon color={option.color} />
              <span>{option.name}</span>
            </label>
          ))}
        </fieldset>
      )}

      <fieldset className="placement">
        <legend>Elhelyezés</legend>

        <div className="segmented">
          {placements.map((item) => (
            <label key={item.id}>
              <input
                className="visually-hidden"
                type="radio"
                name={`placement-${index}`}
                checked={item.id === placement}
                onChange={() => onChange(star, { placement: item.id })}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>

        <p className="star-hint">{activePlacement.hint}</p>
      </fieldset>
    </li>
  );
}

function JewelrySettings({
  view,
  jewelry,
  stones,
  hiddenStars,
  onType,
  onMetal,
  onSize,
  onStone,
  onEngraving,
  onEditStars,
}) {
  const type = typeById(jewelry.type);
  const metal = metalById(jewelry.metal);
  const placements = placementsFor(type);
  const { engraving } = jewelry;
  const details = engravingDetails(view);

  return (
    <div className="star-settings-boxes jewelry-settings">
      <section className="star-settings">
        <fieldset className="star-settings-group">
          <legend>
            <h4>Ékszer típusa</h4>
          </legend>

          <div className="option-grid">
            {JEWELRY_TYPES.map((item) => (
              <label className="option-tile" key={item.id}>
                <input
                  className="visually-hidden"
                  type="radio"
                  name="jewelry-type"
                  checked={item.id === jewelry.type}
                  onChange={() => onType(item.id)}
                />
                <JewelryIcon type={item.id} />
                <b>{item.label}</b>
                <span>{item.detail}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="star-settings-group">
          <legend>
            <h4>Fém</h4>
          </legend>

          <p className="option-current">
            Kiválasztva: <b>{metal.label}</b>
          </p>

          <div className="swatch-row">
            {METALS.map((item) => (
              <MetalSwatch
                key={item.id}
                metal={item}
                checked={item.id === jewelry.metal}
                onSelect={onMetal}
              />
            ))}
          </div>
        </fieldset>

        {type.sizes.length > 0 && (
          <fieldset className="star-settings-group">
            <legend>
              <h4>{type.sizeLabel}</h4>
            </legend>

            <div className="chip-row">
              {type.sizes.map((size) => (
                <label className="chip" key={size.id}>
                  <input
                    className="visually-hidden"
                    type="radio"
                    name="jewelry-size"
                    checked={size.id === jewelry.size}
                    onChange={() => onSize(size.id)}
                  />
                  <b>{size.label}</b>
                  <span>{size.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </section>

      <section className="star-settings">
        <div className="star-settings-group">
          <h4>Kövek</h4>

          {stones.length > 0 ? (
            <ul className="stone-list">
              {stones.map((entry, index) => (
                <StoneRow
                  key={entry.star}
                  index={index}
                  entry={entry}
                  placements={placements}
                  onChange={onStone}
                />
              ))}
            </ul>
          ) : (
            <p className="star-hint">
              Még nincs kiválasztott csillag az égbolton, ezért kő sem kerül az
              ékszerre.
            </p>
          )}

          {hiddenStars.length > 0 && (
            <p className="jewel-warning">
              {hiddenStars.join(", ")} ebben a pillanatban a horizont alatt van,
              ezért nem kerül rá kő.
            </p>
          )}

          <button className="guide-link" type="button" onClick={onEditStars}>
            Csillagok módosítása
          </button>
        </div>
      </section>

      <section className="star-settings">
        <div className="star-settings-group engraving">
          <h4>Gravírozás a hátoldalon</h4>

          <label className="star-toggle">
            <input
              type="checkbox"
              checked={engraving.hasText}
              onChange={(event) =>
                onEngraving({ hasText: event.target.checked })
              }
            />
            <span>Egyedi felirat</span>
          </label>

          {engraving.hasText && (
            <label className="star-field">
              <span>
                Felirat
                <b>
                  {engraving.text.length}/{ENGRAVING_LIMIT}
                </b>
              </span>
              <input
                type="text"
                maxLength={ENGRAVING_LIMIT}
                placeholder="Örökké a tiéd"
                value={engraving.text}
                onChange={(event) => onEngraving({ text: event.target.value })}
              />
            </label>
          )}

          {engraving.hasText && (
            <p className="star-hint engraving-rule">
              Betűk, számok és alap írásjelek gravírozhatók.
            </p>
          )}

          <label className="star-toggle">
            <input
              type="checkbox"
              checked={engraving.hasDetails}
              onChange={(event) =>
                onEngraving({ hasDetails: event.target.checked })
              }
            />
            <span>Helyszín, dátum és koordináták</span>
          </label>

          {engraving.hasDetails && (
            <p className="star-hint engraving-details">
              {details.place} · {details.date} · {details.coordinates}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default JewelrySettings;
