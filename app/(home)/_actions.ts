"use server";

import { getRandomFact } from "@/lib/db/api/getRandomFact";
import { getStormHighlights } from "@/lib/db/api/getStormHighlights";
import type { StormHighlight } from "@/lib/types";

export async function fetchRandomFact(): Promise<string | null> {
  const result = await getRandomFact();
  return result.data;
}

export async function fetchStormHighlights(): Promise<StormHighlight[]> {
  const result = await getStormHighlights();
  return result.data;
}
