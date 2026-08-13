import { getStormHighlight } from "@/be/api/getStormHighlight";
import { json, route } from "@/be/http";

// No cache policy: this is the one surface that has to notice a storm starting.
export const GET = route(async () => json(await getStormHighlight()));
