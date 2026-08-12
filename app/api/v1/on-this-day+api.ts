import { getOnThisDay } from "@/lib/db/api/getOnThisDay";
import { CACHE, json, readDayMonth, route } from "@/lib/db/http";

export const GET = route(async (request) => {
  const { day, month } = readDayMonth(new URL(request.url));

  return json(await getOnThisDay(day, month), CACHE.volatile);
});
