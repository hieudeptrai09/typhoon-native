import { getTyphoonNames } from "@/be/api/getTyphoonNames";
import { CACHE, json, route } from "@/be/http";

export const GET = route(async () => json(await getTyphoonNames(), CACHE.reference));
