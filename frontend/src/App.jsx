import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import ConfiguratorSteps from "./components/ConfiguratorSteps";
import Controls from "./components/Controls";
import JewelryPreview from "./components/JewelryPreview";
import JewelrySettings from "./components/JewelrySettings";
import ProductGallery from "./components/ProductGallery";
import SavedMaps from "./components/SavedMaps";
import StarGuideModal from "./components/StarGuideModal";
import StarSettings from "./components/StarSettings";
import useJewelry from "./hooks/useJewelry";
import useStarMaps from "./hooks/useStarMaps";
import useStarSettings from "./hooks/useStarSettings";
import PageScroll from "./scroll/PageScroll";
import { resolveTimeZone, searchLocation } from "./api/geocodeService";
import { resolveStone } from "./sky/jewelry";
import { buildOrderFile, orderFileName } from "./sky/orderFile";
import { settingsFromRecord, toStarMapPayload } from "./sky/settings";
import { downloadJson } from "./utils/download";

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
  const [step, setStep] = useState("sky");
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
  const {
    jewelry,
    chooseType,
    chooseMetal,
    chooseSize,
    updateStone,
    assignStone,
    keepStones,
    updateEngraving,
  } = useJewelry();

  const panelRef = useRef(null);

  const visibleFavourites = chart?.favourites ?? [];
  const hiddenFavourites = settings.favouriteStars.filter(
    (name) => !visibleFavourites.includes(name),
  );
  const stones = visibleFavourites.map((name) =>
    resolveStone(name, jewelry.stones[name]),
  );

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
    const record = settingsFromRecord(map);

    applySettings(record);
    keepStones(record.favouriteStars);
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

  const handleGuideSelect = ({ starName, gem, isGemFixed, bookEntry }) => {
    const stars = settings.favouriteStars.includes(starName)
      ? settings.favouriteStars
      : [...settings.favouriteStars, starName];

    updateSetting("favouriteStars", stars);

    if (gem) {
      assignStone(starName, gem, Boolean(isGemFixed));
    }

    if (bookEntry) {
      updateSetting("bookEntries", [...settings.bookEntries, bookEntry]);
    }

    setMessage(`${starName} kiválasztva.`);
  };

  const handleSettingChange = (key, value) => {
    updateSetting(key, value);

    if (key === "favouriteStars") {
      keepStones(value);
    }
  };

  const handleResetSettings = () => {
    resetSettings();
    keepStones([]);
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

  const goToStep = (next) => {
    setStep(next);
    setError("");
    setMessage("");
    panelRef.current.scrollTop = 0;

    const top = sectionRef.current.offsetTop;

    if (window.scrollY > top) {
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const handleOrder = () => {
    downloadJson(
      buildOrderFile({ view, settings, jewelry, stones }),
      orderFileName(view),
    );
    setError("");
    setMessage("A rendelési fájl letöltve.");
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

          <ConfiguratorSteps active={step} onSelect={goToStep} />

          {step === "sky" ? (
            <>
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
                  missingStars={hiddenFavourites}
                  daylightStars={chart?.daylightFavourites ?? []}
                  onChange={handleSettingChange}
                  onReset={handleResetSettings}
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
            </>
          ) : (
            <>
              <h3 className="map-info">
                {view.location} – {view.date} – {settings.time}
              </h3>

              <JewelrySettings
                view={view}
                jewelry={jewelry}
                stones={stones}
                hiddenStars={hiddenFavourites}
                onType={chooseType}
                onMetal={chooseMetal}
                onSize={chooseSize}
                onStone={updateStone}
                onEngraving={updateEngraving}
                onEditStars={() => goToStep("sky")}
              />
            </>
          )}
        </div>
        <div className="jewelry-preview">
          {step === "sky" ? (
            <ProductGallery
              view={view}
              settings={settings}
              chart={chart}
              visibleFavourites={visibleFavourites}
              onRender={handleChartRender}
            />
          ) : (
            <JewelryPreview
              view={view}
              settings={settings}
              chart={chart}
              jewelry={jewelry}
              stones={stones}
              onRender={handleChartRender}
            />
          )}

          <div className="map-actions">
            {step === "jewelry" ? (
              <>
                <button
                  className="save-button"
                  type="button"
                  onClick={() => goToStep("sky")}
                >
                  Vissza
                </button>

                <div className="next-step">
                  <button
                    className="next-button"
                    type="button"
                    onClick={handleOrder}
                  >
                    Megrendelem
                  </button>
                  <span>Rendelési fájl letöltése</span>
                </div>
              </>
            ) : selectedId ? (
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
                    onClick={() => goToStep("jewelry")}
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
