export const MAX_MAPS_PER_OWNER = 50;

export const toResource = (row) => ({
  id: row.id,
  location: row.location,
  date: row.date,
  time: row.time,
  latitude: row.latitude,
  longitude: row.longitude,
  timezone: row.timezone,
  settings: JSON.parse(row.settings),
  created_at: row.created_at,
});

export const findOwnedMap = (db, id, ownerId) =>
  db
    .prepare("SELECT * FROM star_maps WHERE id = ?1 AND owner_id = ?2")
    .bind(id, ownerId)
    .first();
