import { getTyphoonNameByName, isNameNotFound } from "@/lib/db/api/getTyphoonNameByName";
import { CACHE, json, notFound, requiredString, route } from "@/lib/db/http";

export const GET = route(async (request) => {
  const name = requiredString(new URL(request.url), "name");
  const result = await getTyphoonNameByName(name);

  // Neither in rotation nor ever used by a storm.
  if (isNameNotFound(result)) {
    return notFound(`No name or storm called "${name}".`);
  }

  return json(result, CACHE.seasonal);
});
