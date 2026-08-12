import { getAllSuggestedNames } from "@/lib/db/api/getSuggestedNames";
import { CACHE, json, route } from "@/lib/db/http";

export const GET = route(async () => json(await getAllSuggestedNames(), CACHE.reference));
