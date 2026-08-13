import { getSimilarNames } from "@/be/api/getSimilarNames";
import { CACHE, json, requiredString, route } from "@/be/http";

export const GET = route(async (request) => {
  const name = requiredString(new URL(request.url), "name");

  return json(await getSimilarNames(name), CACHE.reference);
});
