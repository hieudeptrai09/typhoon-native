import { getActiveOnThisDay } from "@/lib/db/api/getActiveOnThisDay";
import { CACHE, json, readDayMonth, route } from "@/lib/db/http";

export const GET = route(async (request) => {
  const { day, month } = readDayMonth(new URL(request.url));

  return json(await getActiveOnThisDay(day, month), CACHE.volatile);
});
