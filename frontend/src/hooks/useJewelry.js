import { useCallback, useState } from "react";
import { cleanEngraving } from "../../shared/text";
import { DEFAULT_JEWELRY, ENGRAVING_LIMIT } from "../data/jewelry";
import { typeById } from "../sky/jewelry";

const useJewelry = () => {
  const [jewelry, setJewelry] = useState(DEFAULT_JEWELRY);

  const chooseType = useCallback((id) => {
    setJewelry((current) => ({
      ...current,
      type: id,
      size: typeById(id).defaultSize,
    }));
  }, []);

  const chooseMetal = useCallback((id) => {
    setJewelry((current) => ({ ...current, metal: id }));
  }, []);

  const chooseSize = useCallback((id) => {
    setJewelry((current) => ({ ...current, size: id }));
  }, []);

  const updateStone = useCallback((star, changes) => {
    setJewelry((current) => {
      const entry = current.stones[star] ?? {};
      const next = { ...entry, ...changes };

      if (entry.isLocked) {
        next.gem = entry.gem;
      }

      return { ...current, stones: { ...current.stones, [star]: next } };
    });
  }, []);

  const assignStone = useCallback((star, gem, isLocked) => {
    setJewelry((current) => ({
      ...current,
      stones: {
        ...current.stones,
        [star]: { ...current.stones[star], gem, isLocked },
      },
    }));
  }, []);

  const keepStones = useCallback((stars) => {
    setJewelry((current) => ({
      ...current,
      stones: Object.fromEntries(
        Object.entries(current.stones).filter(([star]) => stars.includes(star)),
      ),
    }));
  }, []);

  const updateEngraving = useCallback((changes) => {
    setJewelry((current) => {
      const engraving = { ...current.engraving, ...changes };

      return {
        ...current,
        engraving: {
          ...engraving,
          text: cleanEngraving(engraving.text).slice(0, ENGRAVING_LIMIT),
        },
      };
    });
  }, []);

  return {
    jewelry,
    chooseType,
    chooseMetal,
    chooseSize,
    updateStone,
    assignStone,
    keepStones,
    updateEngraving,
  };
};

export default useJewelry;
