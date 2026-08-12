import { getTyphoonNames } from "@/lib/db/api/getTyphoonNames";
import { CACHE, json, route } from "@/lib/db/http";

export const GET = route(async () => json(await getTyphoonNames(), CACHE.reference));
