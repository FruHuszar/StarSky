import { useState } from "react";

function SavedMaps({ maps, selectedId, onSelectMap, onDeleteMap }) {
  const [isOpen, setIsOpen] = useState(
    () => !window.matchMedia("(orientation: portrait)").matches,
  );

  const handleDelete = (event, map) => {
    event.stopPropagation();
    onDeleteMap(map);
  };

  const handleKeyDown = (event, map) => {
    if (event.key === "Enter") {
      onSelectMap(map);
    }
  };

  return (
    <details
      className="saved-maps"
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary>Elmentett Csillagtérképek</summary>

      {maps.length === 0 ? (
        <p>Még nincsenek elmentett csillagtérképek.</p>
      ) : (
        <div className="saved-maps-list">
          {maps.map((map) => (
            <article
              className={
                map.id === selectedId
                  ? "saved-map-card selected"
                  : "saved-map-card"
              }
              key={map.id}
              tabIndex={0}
              onClick={() => onSelectMap(map)}
              onKeyDown={(event) => handleKeyDown(event, map)}
            >
              <h4>{map.location}</h4>
              <p>
                {map.date} – {map.time ?? "22:00"}
              </p>
              <button
                className="delete-button"
                type="button"
                onClick={(event) => handleDelete(event, map)}
              >
                Törlés
              </button>
            </article>
          ))}
        </div>
      )}
    </details>
  );
}

export default SavedMaps;
