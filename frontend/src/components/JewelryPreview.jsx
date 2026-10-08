import { useId, useState } from "react";
import StarMap from "./StarMap";
import {
  charmLayout,
  engravingDetails,
  metalById,
  metalStyle,
  sizeLabel,
  typeById,
} from "../sky/jewelry";

const CANVAS = 400;

const FACES = {
  pendant: [{ x: 200, y: 250, d: 220 }],
  bracelet: [{ x: 200, y: 262, d: 160 }],
  ring: [{ x: 200, y: 152, d: 196 }],
  earrings: [
    { x: 122, y: 238, d: 136 },
    { x: 278, y: 238, d: 136 },
  ],
};

const VIEWS = [
  { key: "front", label: "Elölnézet" },
  { key: "back", label: "Hátoldal" },
];

const percent = (value) => `${(value / CANVAS) * 100}%`;

function Mount({ type, metal }) {
  if (type === "pendant") {
    return (
      <>
        <path
          className="jewelry-chain"
          d="M64 0 C 104 92, 168 122, 200 128 C 232 122, 296 92, 336 0"
          stroke={metal}
        />
        <ellipse
          cx="200"
          cy="134"
          rx="9"
          ry="13"
          stroke={metal}
          strokeWidth="4"
        />
      </>
    );
  }

  if (type === "bracelet") {
    return (
      <>
        <ellipse
          className="jewelry-chain"
          cx="200"
          cy="196"
          rx="178"
          ry="84"
          stroke={metal}
        />
        <circle cx="200" cy="112" r="6" stroke={metal} strokeWidth="3" />
      </>
    );
  }

  if (type === "ring") {
    return (
      <>
        <ellipse
          cx="200"
          cy="262"
          rx="108"
          ry="112"
          stroke={metal}
          strokeWidth="22"
        />
        <ellipse className="jewelry-shine" cx="200" cy="262" rx="97" ry="101" />
      </>
    );
  }

  return FACES.earrings.map(({ x, y, d }) => (
    <g key={x}>
      <path
        d={`M${x} ${y - d / 2 - 12} V 128 C ${x} 84, ${x - 38} 82, ${x - 32} 118`}
        stroke={metal}
        strokeWidth="3"
      />
      <circle cx={x} cy={y - d / 2 - 6} r="7" stroke={metal} strokeWidth="3" />
    </g>
  ));
}

function CharmLinks({ charms, metal }) {
  return charms
    .filter(({ anchor, at }) => anchor !== at)
    .map(({ key, anchor, at, d }) => (
      <g key={key} stroke={metal} strokeWidth="2">
        <circle cx={anchor.x} cy={anchor.y} r="3.5" />
        <line x1={anchor.x} y1={anchor.y + 3.5} x2={at.x} y2={at.y - d / 2} />
      </g>
    ));
}

function JewelryFront({
  type,
  metalId,
  view,
  settings,
  chart,
  stones,
  onRender,
}) {
  const gradient = useId();
  const metal = `url(#${gradient})`;
  const charms = charmLayout(
    type,
    stones.filter((entry) => entry.placement === "charm"),
  );
  const placements = chart?.size
    ? stones
        .filter((entry) => entry.placement === "map")
        .flatMap(({ star, stone }) => {
          const found = chart.stars.find((item) => item.name === star);

          return found
            ? [
                {
                  star,
                  stone,
                  x: found.x / chart.size,
                  y: found.y / chart.size,
                },
              ]
            : [];
        })
    : [];

  return (
    <>
      <svg
        className="jewelry-mount"
        viewBox={`0 0 ${CANVAS} ${CANVAS}`}
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--metal-light)" />
            <stop offset="0.45" stopColor="var(--metal)" />
            <stop offset="1" stopColor="var(--metal-dark)" />
          </linearGradient>
        </defs>
        <Mount type={type} metal={metal} />
        <CharmLinks charms={charms} metal={metal} />
      </svg>

      {FACES[type].map((face, index) => (
        <div
          className="jewelry-face"
          key={`${type}-${index}`}
          style={{
            left: percent(face.x - face.d / 2),
            top: percent(face.y - face.d / 2),
            width: percent(face.d),
          }}
        >
          <div className="jewelry-dial">
            <StarMap
              key={metalId}
              view={view}
              settings={settings}
              className="jewelry-map"
              onRender={index === 0 ? onRender : undefined}
            />

            {placements.map(({ star, stone, x, y }) => (
              <span
                className="jewelry-stone"
                key={star}
                title={`${star} – ${stone.name}`}
                style={{
                  left: `${x * 100}%`,
                  top: `${y * 100}%`,
                  "--stone": stone.color,
                }}
              />
            ))}
          </div>
        </div>
      ))}

      {charms.map(({ key, star, stone, at, d }) => (
        <span
          className="jewelry-stone jewelry-charm"
          key={key}
          title={`${star} – ${stone.name}`}
          style={{
            left: percent(at.x),
            top: percent(at.y),
            width: percent(d),
            "--stone": stone.color,
          }}
        />
      ))}
    </>
  );
}

function JewelryBack({ view, engraving, stones }) {
  const backStones = stones.filter((entry) => entry.placement === "back");
  const details = engravingDetails(view);
  const isBlank =
    backStones.length === 0 && !engraving.hasText && !engraving.hasDetails;

  return (
    <div className="jewelry-back">
      {backStones.length > 0 && (
        <div className="jewelry-back-stones">
          {backStones.map(({ star, stone }) => (
            <span
              className="jewelry-stone"
              key={star}
              title={`${star} – ${stone.name}`}
              style={{ "--stone": stone.color }}
            />
          ))}
        </div>
      )}

      {engraving.hasText && (
        <p className="jewelry-engraving">
          {engraving.text || <span>Az egyedi felirat helye</span>}
        </p>
      )}

      {engraving.hasDetails && (
        <>
          <p className="jewelry-back-place">{details.place}</p>
          <p className="jewelry-back-meta">{details.date}</p>
          <p className="jewelry-back-meta">{details.coordinates}</p>
        </>
      )}

      {isBlank && <p className="jewelry-back-empty">Sima hátoldal</p>}
    </div>
  );
}

function JewelryPreview({ view, settings, chart, jewelry, stones, onRender }) {
  const [active, setActive] = useState("front");
  const type = typeById(jewelry.type);
  const metal = metalById(jewelry.metal);
  const { engraving } = jewelry;
  const summary = [
    type.label,
    metal.label,
    sizeLabel(type, jewelry.size),
    stones.length > 0 ? `${stones.length} kő` : "kő nélkül",
    (engraving.hasText && engraving.text) || engraving.hasDetails
      ? "gravírozással"
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="product-gallery jewelry-gallery" style={metalStyle(metal)}>
      <div className="gallery-stage">
        <figure
          className="jewelry-figure"
          key={`${type.id}-${active}`}
          aria-label={summary}
        >
          {active === "front" ? (
            <JewelryFront
              type={type.id}
              metalId={metal.id}
              view={view}
              settings={settings}
              chart={chart}
              stones={stones}
              onRender={onRender}
            />
          ) : (
            <JewelryBack view={view} engraving={engraving} stones={stones} />
          )}
        </figure>
      </div>

      <p className="jewelry-summary">{summary}</p>

      <div className="gallery-thumbnails" role="tablist">
        {VIEWS.map((item) => (
          <button
            className={
              item.key === active
                ? "gallery-thumbnail active"
                : "gallery-thumbnail"
            }
            key={item.key}
            type="button"
            role="tab"
            aria-selected={item.key === active}
            aria-label={item.label}
            onClick={() => setActive(item.key)}
          >
            <span className="gallery-thumbnail-frame">
              <span className={`thumbnail-disc ${item.key}`} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default JewelryPreview;
