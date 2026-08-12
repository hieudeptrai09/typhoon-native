import { getStorms } from "@/lib/db/api/getStorms";
import { CACHE, json, optionalInt, route } from "@/lib/db/http";

export const GET = route(async (request) => {
  const url = new URL(request.url);
  const position = optionalInt(url, "position");

  return json(await getStorms(position), CACHE.volatile);
});
