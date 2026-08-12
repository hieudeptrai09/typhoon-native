import { getPositionDetails } from "@/lib/db/api/getPositionDetails";
import { CACHE, json, notFound, requiredInt, route } from "@/lib/db/http";

export const GET = route<{ position: string }>(async (request, { position }) => {
  const value = requiredInt(position, "position");
  const result = await getPositionDetails(value);

  if (result.data === null) {
    return notFound(`No position ${value}.`);
  }

  return json(result, CACHE.seasonal);
});
