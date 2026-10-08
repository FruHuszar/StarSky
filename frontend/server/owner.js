import { sha256 } from "./http.js";

const COOKIE = "__Host-starsky_owner";
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const ONE_YEAR = 60 * 60 * 24 * 365;

const readCookie = (request) =>
  request.headers
    .get("Cookie")
    ?.split(";")
    .map((part) => part.trim().split("="))
    .find(([name]) => name === COOKIE)?.[1];

const createToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));

  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
};

export const resolveOwner = async (request) => {
  const current = readCookie(request);
  const token = TOKEN_PATTERN.test(current ?? "") ? current : createToken();

  return {
    id: await sha256(token),
    cookie:
      token === current
        ? null
        : `${COOKIE}=${token}; Path=/; Max-Age=${ONE_YEAR}; Secure; HttpOnly; SameSite=Strict`,
  };
};
