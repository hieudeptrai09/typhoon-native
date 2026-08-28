import { getAllSuggestedNames } from "@/be/api/getSuggestedNames";
import { CACHE, json, route } from "@/be/http";

export const GET = route(async () => json(await getAllSuggestedNames(), CACHE.reference));
