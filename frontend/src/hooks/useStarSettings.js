import { useCallback, useState } from "react";
import { DEFAULT_SETTINGS, normaliseSettings } from "../sky/settings";

const useStarSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const updateSetting = useCallback((key, value) => {
    setSettings((current) => normaliseSettings({ ...current, [key]: value }));
  }, []);

  const applySettings = useCallback((values) => {
    setSettings(normaliseSettings(values));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSetting, applySettings, resetSettings };
};

export default useStarSettings;
