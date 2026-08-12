import { getNameList } from "@/lib/db/api/getNameList";
import { CACHE, json, route } from "@/lib/db/http";

export const GET = route(async () => json(await getNameList(), CACHE.reference));
