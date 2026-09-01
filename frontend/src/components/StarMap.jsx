import { useCallback, useEffect, useRef, useState } from "react";
import SkyModel from "../sky/SkyModel";
import StarChart from "../sky/StarChart";

const ZOOM_STEP = 1.5;
const MIN_ZOOM = 1;
const MAX_ZOOM = 6;

function StarMap({
  view,
  settings,
  size,
  className = "star-map",
  isZoomable = false,
  onRender,
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const renderRef = useRef(onRender);
  const dragRef = useRef(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    renderRef.current = onRender;
  }, [onRender]);

  /** A korong ne csúszhasson ki a látómezőből. */
  const clampPan = useCallback((next, level, width) => {
    const limit = (width / 2) * (level - 1);

    return {
      x: Math.max(-limit, Math.min(limit, next.x)),
      y: Math.max(-limit, Math.min(limit, next.y)),
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    if (!chartRef.current || chartRef.current.canvas !== canvas) {
      chartRef.current = new StarChart(canvas);
    }

    let lastWidth = 0;

    const draw = () => {
      const width = size ?? Math.round(canvas.parentElement.clientWidth);

      if (!width) {
        return;
      }

      lastWidth = width;

      const model = new SkyModel({
        latitude: view.latitude,
        longitude: view.longitude,
        date: view.date,
        time: settings.time,
        timeZone: view.timeZone,
      });

      const result = chartRef.current.render({
        model,
        settings,
        size: width,
        pixelRatio: window.devicePixelRatio || 1,
        zoom,
        pan,
      });

      renderRef.current?.(result);
    };

    draw();

    if (size) {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      if (Math.round(canvas.parentElement.clientWidth) !== lastWidth) {
        draw();
      }
    });

    observer.observe(canvas.parentElement);

    return () => observer.disconnect();
  }, [view, settings, size, zoom, pan]);

  const changeZoom = (factor) => {
    setZoom((current) => {
      const next = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, Math.round(current * factor * 100) / 100),
      );

      if (next === MIN_ZOOM) {
        setPan({ x: 0, y: 0 });
      } else {
        setPan((currentPan) =>
          clampPan(
            {
              x: (currentPan.x * next) / current,
              y: (currentPan.y * next) / current,
            },
            next,
            canvasRef.current?.parentElement.clientWidth ?? 0,
          ),
        );
      }

      return next;
    });
  };

  const handlePointerDown = (event) => {
    if (!isZoomable || zoom === MIN_ZOOM) {
      return;
    }

    dragRef.current = { x: event.clientX, y: event.clientY, pan };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;

    if (!drag) {
      return;
    }

    setPan(
      clampPan(
        {
          x: drag.pan.x + (event.clientX - drag.x),
          y: drag.pan.y + (event.clientY - drag.y),
        },
        zoom,
        canvasRef.current?.parentElement.clientWidth ?? 0,
      ),
    );
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const classes = [className];

  if (isZoomable && zoom > MIN_ZOOM) {
    classes.push("draggable");
  }

  return (
    <div className={classes.join(" ")}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      {isZoomable && (
        <div className="zoom-controls">
          <button
            type="button"
            aria-label="Nagyítás"
            disabled={zoom >= MAX_ZOOM}
            onClick={() => changeZoom(ZOOM_STEP)}
          >
            +
          </button>
          <button
            type="button"
            aria-label="Kicsinyítés"
            disabled={zoom <= MIN_ZOOM}
            onClick={() => changeZoom(1 / ZOOM_STEP)}
          >
            −
          </button>
        </div>
      )}
    </div>
  );
}

export default StarMap;
