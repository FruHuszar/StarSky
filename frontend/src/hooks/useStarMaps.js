import { useCallback, useEffect, useState } from "react";
import {
  createStarMap,
  deleteStarMap,
  fetchStarMaps,
  updateStarMap,
} from "../api/starMapService";
import mockData from "../data/mock.json";

const useStarMaps = () => {
  const [maps, setMaps] = useState([]);
  const [isDemo, setIsDemo] = useState(false);

  const loadMaps = useCallback(async () => {
    try {
      setMaps(await fetchStarMaps());
      setIsDemo(false);
    } catch (error) {
      console.error("Az API nem elérhető, mock adatot használunk:", error);
      setMaps(mockData.maps);
      setIsDemo(true);
    }
  }, []);

  useEffect(() => {
    const loadOnMount = async () => {
      await loadMaps();
    };

    loadOnMount();
  }, [loadMaps]);

  const saveMap = async (starMap) => {
    if (isDemo) {
      setMaps((current) => [{ id: Date.now(), ...starMap }, ...current]);
      return true;
    }

    try {
      await createStarMap(starMap);
      await loadMaps();
      return true;
    } catch (error) {
      console.error("A mentés sikertelen:", error);
      return false;
    }
  };

  const editMap = async (id, starMap) => {
    if (isDemo) {
      setMaps((current) =>
        current.map((map) => (map.id === id ? { ...map, ...starMap } : map)),
      );
      return true;
    }

    try {
      await updateStarMap(id, starMap);
      await loadMaps();
      return true;
    } catch (error) {
      console.error("A módosítás sikertelen:", error);
      return false;
    }
  };

  const removeMap = async (id) => {
    if (isDemo) {
      setMaps((current) => current.filter((map) => map.id !== id));
      return true;
    }

    try {
      await deleteStarMap(id);
      await loadMaps();
      return true;
    } catch (error) {
      console.error("A törlés sikertelen:", error);
      return false;
    }
  };

  return { maps, isDemo, saveMap, editMap, removeMap };
};

export default useStarMaps;
