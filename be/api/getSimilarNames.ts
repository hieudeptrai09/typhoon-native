import { type ApiListResponse } from "@/be";
import { getNameList } from "@/be/api/getNameList";
import { topSuggestions } from "@/lib/utils/fuzzy";

export async function getSimilarNames(name: string): Promise<ApiListResponse<string[]>> {
  const result = await getNameList();

  const data = topSuggestions(name, result?.data ?? []);

  return { data, count: data.length };
}
