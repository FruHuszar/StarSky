import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Controls from "./components/Controls";
import ProductGallery from "./components/ProductGallery";
import SavedMaps from "./components/SavedMaps";
import StarGuideModal from "./components/StarGuideModal";
import StarSettings from "./components/StarSettings";
import useStarMaps from "./hooks/useStarMaps";
import useStarSettings from "./hooks/useStarSettings";
import PageScroll from "./scroll/PageScroll";
import { resolveTimeZone, searchLocation } from "./api/geocodeService";
import { settingsFromRecord, toStarMapPayload } from "./sky/settings";

const BUDAPEST = {
  location: "Budapest",
  latitude: 47.4979,
  longitude: 19.0402,
  timeZone: "Europe/Budapest",
};

const getToday = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

  return now.toISOString().slice(0, 10);
};

function App() {
  const [form, setForm] = useState({
    city: BUDAPEST.location,
    date: getToday(),
  });
  const [view, setView] = useState({ ...BUDAPEST, date: getToday() });
  const [chart, setChart] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const sectionRef = useRef(null);
  const [picked, setPicked] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { maps, isDemo, saveMap, editMap, removeMap } = useStarMaps();
  const { settings, updateSetting, applySettings, resetSettings } =
    useStarSettings();

  const panelRef = useRef(null);

  const handleChartRender = useCallback((result) => {
    setChart(result);
  }, []);

  useEffect(() => {
    const scroll = new PageScroll(sectionRef.current, panelRef.current);

    scroll.start();

    return () => scroll.stop();
  }, []);

  const handleFormChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));

    if (field === "city") {
      setPicked(null);
    }
  };

  const handlePickLocation = (suggestion) => {
    setPicked(suggestion);
    setForm((current) => ({ ...current, city: suggestion.label }));
  };

  const handleSearch = async () => {
    setError("");
    setMessage("");

    const chosen = picked
      ? {
          location: picked.name,
          latitude: picked.latitude,
          longitude: picked.longitude,
          timeZone:
            picked.timeZone ??
            (await resolveTimeZone(picked.latitude, picked.longitude)),
        }
      : await searchLocation(form.city);

    if (!chosen) {
      setError("Nem található ilyen hely!");
      return;
    }

    setView({ ...chosen, date: form.date });
  };

  const handleSave = async () => {
    const payload = toStarMapPayload(view, settings);
    const isSuccess = selectedId
      ? await editMap(selectedId, payload)
      : await saveMap(payload);

    if (!isSuccess) {
      setError("A művelet nem sikerült!");
      return;
    }

    setError("");
    setMessage(selectedId ? "A térkép módosítva!" : "A térkép elmentve!");
    setSelectedId(null);
  };

  const handleSelectMap = (map) => {
    setSelectedId(map.id);
    setForm({ city: map.location, date: map.date });
    setView({
      location: map.location,
      latitude: Number(map.latitude),
      longitude: Number(map.longitude),
      timeZone: map.timezone ?? null,
      date: map.date,
    });
    applySettings(settingsFromRecord(map));
    setError("");
    setMessage("");
  };

  const handleDeleteMap = async (map) => {
    if (!window.confirm(`Biztosan törlöd? (${map.location} – ${map.date})`)) {
      return;
    }

    const isSuccess = await removeMap(map.id);

    if (!isSuccess) {
      setError("A törlés nem sikerült!");
      return;
    }

    if (selectedId === map.id) {
      setSelectedId(null);
    }
  };

  const handleCancelEdit = () => {
    setSelectedId(null);
    setMessage("");
  };

  const handleGuideSelect = ({ starName, bookEntry }) => {
    const stars = settings.favouriteStars.includes(starName)
      ? settings.favouriteStars
      : [...settings.favouriteStars, starName];

    updateSetting("favouriteStars", stars);

    if (bookEntry) {
      updateSetting("bookEntries", [...settings.bookEntries, bookEntry]);
    }

    setMessage(`${starName} kiválasztva.`);
  };

  const handleAddBookEntry = (entry) => {
    if (settings.bookEntries.some((item) => item.label === entry.label)) {
      return;
    }

    updateSetting("bookEntries", [...settings.bookEntries, entry]);
  };

  const handleRemoveBookEntry = (index) => {
    updateSetting(
      "bookEntries",
      settings.bookEntries.filter((_, position) => position !== index),
    );
  };

  const handleNextStep = () => {
    setError("");
    setMessage("Az ékszer összeállítása hamarosan elérhető.");
  };

  return (
    <div className="app">
      <Header />

      <section className="custom-jewelry" ref={sectionRef}>
        <div className="jewelry-panel" ref={panelRef}>
          {isDemo && (
            <p className="demo-notice">
              Ez egy demó verzió, jelenleg a szerverek nem futnak.
            </p>
          )}

          <Controls
            values={form}
            bias={{ latitude: view.latitude, longitude: view.longitude }}
            onChange={handleFormChange}
            onPick={handlePickLocation}
            onSubmit={handleSearch}
          />

          <p className="panel-message">
            {error && <span className="error-message">{error}</span>}
          </p>

          <h3 className="map-info">
            {view.location} – {view.date} – {settings.time}
          </h3>

          <div className="map-toolbar">
            <button
              className="settings-button"
              type="button"
              aria-expanded={isSettingsOpen}
              aria-controls="star-settings"
              onClick={() => setIsSettingsOpen((current) => !current)}
            >
              Csillag beállítások
              <span aria-hidden="true">{isSettingsOpen ? "▴" : "▾"}</span>
            </button>
          </div>

          {isSettingsOpen && (
            <StarSettings
              settings={settings}
              stars={chart?.stars ?? []}
              missingStars={settings.favouriteStars.filter(
                (name) => !(chart?.favourites ?? []).includes(name),
              )}
              daylightStars={chart?.daylightFavourites ?? []}
              onChange={updateSetting}
              onReset={resetSettings}
              onOpenGuide={() => setIsGuideOpen(true)}
              onAddBookEntry={handleAddBookEntry}
              onRemoveBookEntry={handleRemoveBookEntry}
            />
          )}

          <SavedMaps
            maps={maps}
            selectedId={selectedId}
            onSelectMap={handleSelectMap}
            onDeleteMap={handleDeleteMap}
          />
        </div>
        <div className="jewelry-preview">
          <ProductGallery
            view={view}
            settings={settings}
            chart={chart}
            visibleFavourites={chart?.favourites ?? []}
            onRender={handleChartRender}
          />

          <div className="map-actions">
            {selectedId ? (
              <>
                <button
                  className="save-button"
                  type="button"
                  onClick={handleSave}
                >
                  Módosítás mentése
                </button>
                <button
                  className="cancel-button"
                  type="button"
                  onClick={handleCancelEdit}
                >
                  Mégse
                </button>
              </>
            ) : (
              <>
                <button
                  className="save-button"
                  type="button"
                  onClick={handleSave}
                >
                  Mentés későbbre
                </button>

                <div className="next-step">
                  <button
                    className="next-button"
                    type="button"
                    onClick={handleNextStep}
                  >
                    Következő lépés
                  </button>
                  <span>Ékkövek és ötvözet</span>
                </div>
              </>
            )}
          </div>

          <p className="preview-status">
            {message && <span className="success-message">{message}</span>}
          </p>
        </div>
      </section>

      {isGuideOpen && (
        <StarGuideModal
          view={view}
          onClose={() => setIsGuideOpen(false)}
          onSelect={handleGuideSelect}
        />
      )}
    </div>
  );
}

export default App;
