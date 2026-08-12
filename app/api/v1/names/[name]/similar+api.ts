import { getSimilarNames } from "@/lib/db/api/getSimilarNames";
import { CACHE, json, requiredSegment, route } from "@/lib/db/http";

export const GET = route<{ name: string }>(async (request, { name }) => {
  const value = requiredSegment(name, "name");

  return json(await getSimilarNames(value), CACHE.reference);
});
