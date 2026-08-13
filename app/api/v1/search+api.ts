import { search } from "@/be/api/search";
import { CACHE, json, requiredString, route } from "@/be/http";

export const GET = route(async (request) => {
  const url = new URL(request.url);
  const query = requiredString(url, "q");

  return json(await search(query), CACHE.seasonal);
});
