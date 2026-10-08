import { getTurnstileToken } from "./turnstile";

const API_URL = "/api/starmaps";

const request = async (url, { method = "GET", body, isVerified } = {}) => {
  const headers = { Accept: "application/json" };

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  if (isVerified) {
    headers["CF-Turnstile-Response"] = await getTurnstileToken();
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(`A kérés sikertelen: ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
};

export const fetchStarMaps = () => request(API_URL);

export const createStarMap = (starMap) =>
  request(API_URL, { method: "POST", body: starMap, isVerified: true });

export const updateStarMap = (id, starMap) =>
  request(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: starMap,
    isVerified: true,
  });

export const deleteStarMap = (id) =>
  request(`${API_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
