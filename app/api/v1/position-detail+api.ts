import { getPositionDetails } from "@/be/api/getPositionDetails";
import { CACHE, json, notFound, requiredInt, route } from "@/be/http";

export const GET = route(async (request) => {
  const url = new URL(request.url);
  const position = requiredInt(url, "position");
  const result = await getPositionDetails(position);

  if (result.data === null) {
    return notFound(`No position ${position}.`);
  }

  return json(result, CACHE.seasonal);
});
