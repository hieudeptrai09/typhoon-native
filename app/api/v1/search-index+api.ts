import { searchIndex } from "@/be/api/search";
import { CACHE, json, route } from "@/be/http";

export const GET = route(async () => json(await searchIndex(), CACHE.reference));
