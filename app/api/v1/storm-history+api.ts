import { getAllStormHistory } from "@/be/api/getStormHistory";
import { CACHE, json, route } from "@/be/http";

export const GET = route(async () => json(await getAllStormHistory(), CACHE.volatile));
