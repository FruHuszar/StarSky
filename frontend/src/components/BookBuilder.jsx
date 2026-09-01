import { useState } from "react";
import StarTextModal from "./StarTextModal";
import { daylightNote } from "../sky/starNotes";

function BookBuilder({ stars, daylightStars = [], onAdd }) {
  const [openStar, setOpenStar] = useState(null);

  if (stars.length === 0) {
    return null;
  }

  return (
    <div className="book-builder">
      {stars.map((name) => (
        <div className="book-star" key={name}>
          <h5>{name}</h5>

          <button
            className="book-add"
            type="button"
            onClick={() => setOpenStar(name)}
          >
            A csillaghoz tartozó leírás
            <span aria-hidden="true">+</span>
          </button>

          {daylightStars.includes(name) && <p>{daylightNote(name)}</p>}
        </div>
      ))}

      {openStar && (
        <StarTextModal
          star={openStar}
          onClose={() => setOpenStar(null)}
          onAdd={onAdd}
        />
      )}
    </div>
  );
}

export default BookBuilder;
