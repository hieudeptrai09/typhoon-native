import { getTyphoonNameByName, isNameNotFound } from "@/lib/db/api/getTyphoonNameByName";
import { CACHE, json, notFound, requiredSegment, route } from "@/lib/db/http";

export const GET = route<{ name: string }>(async (request, { name }) => {
  const value = requiredSegment(name, "name");
  const result = await getTyphoonNameByName(value);

  // Neither in rotation nor ever used by a storm.
  if (isNameNotFound(result)) {
    return notFound(`No name or storm called "${value}".`);
  }

  return json(result, CACHE.seasonal);
});
