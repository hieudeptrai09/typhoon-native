import { getNameList } from "@/be/api/getNameList";
import { CACHE, json, route } from "@/be/http";

export const GET = route(async () => json(await getNameList(), CACHE.reference));
