import { getAllStormHistory } from "@/lib/db/api/getStormHistory";
import { CACHE, json, route } from "@/lib/db/http";

export const GET = route(async () => json(await getAllStormHistory(), CACHE.volatile));
