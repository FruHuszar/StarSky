import { useState } from "react";
import KeepsakeBook from "./KeepsakeBook";
import StarMap from "./StarMap";

const VIEWS = [
  { key: "map", label: "Csillagtérkép" },
  { key: "book", label: "Emlékkönyv" },
];

function ProductGallery({
  view,
  settings,
  chart,
  visibleFavourites,
  onRender,
}) {
  const [active, setActive] = useState("map");

  return (
    <div className="product-gallery">
      <div className="gallery-stage">
        {active === "map" ? (
          <StarMap
            view={view}
            settings={settings}
            isZoomable
            onRender={onRender}
          />
        ) : (
          <KeepsakeBook
            view={view}
            settings={settings}
            chart={chart}
            visibleFavourites={visibleFavourites}
          />
        )}
      </div>

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
              {item.key === "map" ? (
                <StarMap
                  view={view}
                  settings={settings}
                  size={96}
                  className="thumbnail-map"
                  onRender={active === "map" ? undefined : onRender}
                />
              ) : (
                <span className="thumbnail-card">
                  <KeepsakeBook
                    view={view}
                    settings={settings}
                    chart={chart}
                    visibleFavourites={visibleFavourites}
                    isPreview
                  />
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProductGallery;
