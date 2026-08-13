"use server";

import { getActiveOnThisDay, type ActiveOnThisDayStorm } from "@/lib/db/api/getActiveOnThisDay";
import { getOnThisDay, type OnThisDayStorm } from "@/lib/db/api/getOnThisDay";
import { getRandomFact } from "@/lib/db/api/getRandomFact";

// Callers reach these over the network, so a bad day/month falls back to the server's date rather
// than reaching the query cache.
const resolveDate = (day: number, month: number) => {
  const isValid =
    Number.isInteger(day) &&
    day >= 1 &&
    day <= 31 &&
    Number.isInteger(month) &&
    month >= 1 &&
    month <= 12;

  if (isValid) return { day, month };

  const now = new Date();
  return { day: now.getDate(), month: now.getMonth() + 1 };
};

export async function fetchRandomFact(): Promise<string | null> {
  const result = await getRandomFact();
  return result.data;
}

export async function fetchOnThisDay(day: number, month: number): Promise<OnThisDayStorm[]> {
  const resolved = resolveDate(day, month);
  const result = await getOnThisDay(resolved.day, resolved.month);
  return result.data;
}

export async function fetchActiveOnThisDay(
  day: number,
  month: number,
): Promise<ActiveOnThisDayStorm[]> {
  const resolved = resolveDate(day, month);
  const result = await getActiveOnThisDay(resolved.day, resolved.month);
  return result.data;
}
