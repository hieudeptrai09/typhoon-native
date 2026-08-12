import { getSimilarNames } from "@/lib/db/api/getSimilarNames";
import { CACHE, json, requiredString, route } from "@/lib/db/http";

export const GET = route(async (request) => {
  const name = requiredString(new URL(request.url), "name");

  return json(await getSimilarNames(name), CACHE.reference);
});
