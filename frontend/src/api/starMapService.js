const API_URL = "http://localhost:8000/api/starmaps";

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`A kérés sikertelen: ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
};

export const fetchStarMaps = () => request(API_URL);

export const createStarMap = (starMap) =>
  request(API_URL, { method: "POST", body: JSON.stringify(starMap) });

export const updateStarMap = (id, starMap) =>
  request(`${API_URL}/${id}`, { method: "PUT", body: JSON.stringify(starMap) });

export const deleteStarMap = (id) =>
  request(`${API_URL}/${id}`, { method: "DELETE" });
