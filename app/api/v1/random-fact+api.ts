import { getRandomFact } from "@/be/api/getRandomFact";
import { json, route } from "@/be/http";

// No cache policy: the pick is random per call, and caching would freeze it for every caller.
export const GET = route(async () => json(await getRandomFact()));
