import { resolveOwner } from "../../../server/owner.js";

export const onRequest = async (context) => {
  const owner = await resolveOwner(context.request);

  context.data.ownerId = owner.id;

  const response = await context.next();

  if (!owner.cookie) {
    return response;
  }

  const withCookie = new Response(response.body, response);
  withCookie.headers.append("Set-Cookie", owner.cookie);

  return withCookie;
};
