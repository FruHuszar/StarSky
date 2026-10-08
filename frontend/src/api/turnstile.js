const SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

let scriptPromise = null;

const loadTurnstile = () => {
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => {
      scriptPromise = null;
      script.remove();
      reject(new Error("A Turnstile nem tölthető be."));
    };

    document.head.append(script);
  });

  return scriptPromise;
};

export const getTurnstileToken = async () => {
  const turnstile = await loadTurnstile();
  const slot = document.createElement("div");

  slot.className = "turnstile-slot";
  document.body.append(slot);

  return new Promise((resolve, reject) => {
    let widgetId = null;

    const finish = (settle) => (value) => {
      turnstile.remove(widgetId);
      slot.remove();
      settle(value);
    };

    widgetId = turnstile.render(slot, {
      sitekey: SITE_KEY,
      appearance: "interaction-only",
      language: "hu",
      callback: finish(resolve),
      "error-callback": finish(() =>
        reject(new Error("A biztonsági ellenőrzés nem sikerült.")),
      ),
      "timeout-callback": finish(() =>
        reject(new Error("A biztonsági ellenőrzés lejárt.")),
      ),
    });
  });
};
