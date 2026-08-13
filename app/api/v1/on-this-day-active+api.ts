import { getActiveOnThisDay } from "@/be/api/getActiveOnThisDay";
import { CACHE, json, readDayMonth, route } from "@/be/http";

export const GET = route(async (request) => {
  const { day, month } = readDayMonth(new URL(request.url));

  return json(await getActiveOnThisDay(day, month), CACHE.volatile);
});
