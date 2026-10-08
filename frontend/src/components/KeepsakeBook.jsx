/**
 * Az ékszer mellé járó könyv. Egy lap fekvő A7 (105 × 74 mm), a tartalom
 * folyamatosan tördelődik: ami nem fér ki, a következő lapra csúszik.
 */

import { useState } from "react";
import { daylightNote } from "../sky/starNotes";

const LINES_PER_PAGE = 12;

const formatCoordinate = (value, positive, negative) =>
  `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;

const linesFor = (text, charactersPerLine) =>
  Math.max(1, Math.ceil(text.length / charactersPerLine));

const splitToLines = (text, capacity, charactersPerLine) => {
  const limit = capacity * charactersPerLine;
  let head = "";

  for (const word of text.split(" ")) {
    if ((head + " " + word).trim().length > limit) {
      break;
    }

    head = `${head} ${word}`;
  }

  head = head.trim().replace(/\s*·$/, "");

  return [
    head,
    text
      .slice(head.length)
      .replace(/^\s*·\s*/, "")
      .trim(),
  ];
};

const buildBlocks = (view, settings, chart, visibleFavourites) => {
  const blocks = [
    {
      kind: "header",
      lines: 4,
      date: view.date,
      time: settings.time,
      location: view.location,
      latitude: view.latitude,
      longitude: view.longitude,
    },
  ];

  if (settings.customText) {
    blocks.push({
      kind: "inscription",
      lines: Math.ceil(linesFor(settings.customText, 46) * 1.3),
      text: settings.customText,
    });
  }

  if (chart?.moon) {
    blocks.push({
      kind: "moon",
      lines: 2,
      text: `Hold: ${chart.moon.illumination}% – ${
        chart.moon.waxing ? "növekvő" : "fogyó"
      }`,
    });
  }

  const others = [
    ...(chart?.stars ?? [])
      .filter((star) => !visibleFavourites.includes(star.name))
      .map((star) => star.name),
    ...(chart?.planets ?? []).map((planet) => planet.name),
  ];

  if (visibleFavourites.length > 0 || others.length > 0) {
    const text = [...visibleFavourites, ...others].join(" · ");

    blocks.push({
      kind: "stars",
      title: "Az égbolt ezen a képen",
      favouriteCount: visibleFavourites.length,
      text,
      lines: linesFor(text, 62) + 2,
    });
  }

  const daylight = chart?.daylightFavourites ?? [];
  const entries = (settings.bookEntries ?? []).filter(
    (entry) => !entry.star || visibleFavourites.includes(entry.star),
  );
  const noted = new Set();

  const pushNote = (name) => {
    const text = daylightNote(name);

    noted.add(name);
    blocks.push({ kind: "note", text, lines: linesFor(text, 52) + 1 });
  };

  entries.forEach((entry, index) => {
    blocks.push({
      kind: "entry",
      title: entry.label,
      text: entry.text,
      lines: linesFor(entry.text, 58) + 2,
    });

    const isLastOfStar = !entries
      .slice(index + 1)
      .some((item) => item.star === entry.star);

    if (entry.star && daylight.includes(entry.star) && isLastOfStar) {
      pushNote(entry.star);
    }
  });

  daylight.filter((name) => !noted.has(name)).forEach(pushNote);

  return blocks;
};

const paginate = (blocks) => {
  const pages = [];
  let page = [];
  let used = 0;

  const flush = () => {
    if (page.length > 0) {
      pages.push(page);
      page = [];
      used = 0;
    }
  };

  blocks.forEach((block) => {
    let current = block;

    while (current) {
      const free = LINES_PER_PAGE - used;

      if (current.lines <= free) {
        page.push(current);
        used += current.lines;
        current = null;
        continue;
      }

      const canSplit =
        (current.kind === "entry" || current.kind === "stars") && free >= 4;

      if (!canSplit) {
        flush();
        continue;
      }

      const perLine = current.kind === "stars" ? 62 : 58;
      const [head, tail] = splitToLines(
        current.text,
        free - (current.title ? 2 : 0),
        perLine,
      );

      if (!head) {
        flush();
        continue;
      }

      page.push({ ...current, text: head });
      used = LINES_PER_PAGE;
      current = tail
        ? {
            ...current,
            title: null,
            favouriteCount: 0,
            text: tail,
            lines: linesFor(tail, perLine),
          }
        : null;
    }
  });

  flush();
  pages.push([{ kind: "closing" }]);

  return pages;
};

const renderBlock = (block, position) => {
  if (block.kind === "header") {
    return (
      <header key="header">
        <h4>
          {block.date} – {block.time}
        </h4>
        <p className="location">{block.location}</p>
        <p className="coordinates">
          [{formatCoordinate(block.latitude, "É", "D")},{" "}
          {formatCoordinate(block.longitude, "K", "Ny")}]
        </p>
      </header>
    );
  }

  if (block.kind === "inscription") {
    return (
      <p className="inscription" key="inscription">
        {block.text}
      </p>
    );
  }

  if (block.kind === "note") {
    return (
      <p className="note" key={`note-${position}`}>
        {block.text}
      </p>
    );
  }

  if (block.kind === "moon") {
    return (
      <p className="moon" key="moon">
        {block.text}
      </p>
    );
  }

  if (block.kind === "closing") {
    return (
      <div className="closing" key="closing">
        <span className="mark" aria-hidden="true">
          ✦
        </span>
        <span>starsky</span>
      </div>
    );
  }

  const names = block.kind === "stars" ? block.text.split(" · ") : [];
  const favourites = names.slice(0, block.favouriteCount ?? 0);
  const rest = names.slice(block.favouriteCount ?? 0);

  return (
    <section key={`${block.kind}-${position}`}>
      {block.title && <h5>{block.title}</h5>}

      {block.kind === "stars" ? (
        <p className="stars">
          {favourites.length > 0 && <b>{favourites.join(" · ")}</b>}
          {favourites.length > 0 && rest.length > 0 ? " · " : ""}
          {rest.join(" · ")}
        </p>
      ) : (
        <p>{block.text}</p>
      )}
    </section>
  );
};

function KeepsakeBook({
  view,
  settings,
  chart,
  visibleFavourites = [],
  isPreview = false,
}) {
  const pages = paginate(buildBlocks(view, settings, chart, visibleFavourites));
  const [page, setPage] = useState(0);
  const index = Math.min(page, pages.length - 1);

  return (
    <div className={isPreview ? "keepsake-book preview" : "keepsake-book"}>
      <article className="book-page">{pages[index].map(renderBlock)}</article>

      {!isPreview && (
        <div className="book-pager">
          <button
            type="button"
            aria-label="Előző oldal"
            disabled={index === 0}
            onClick={() => setPage(Math.max(0, index - 1))}
          >
            ‹
          </button>

          <span>
            {index + 1} / {pages.length}
          </span>

          <button
            type="button"
            aria-label="Következő oldal"
            disabled={index >= pages.length - 1}
            onClick={() => setPage(Math.min(pages.length - 1, index + 1))}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export default KeepsakeBook;
