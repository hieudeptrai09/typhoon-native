import rpc, { type ApiListResponse } from "@/be";
import { cached } from "@/be/cache";
import { toImageCredit, type ImageCreditRow } from "@/be/module/imageCredit";
import type { SuggestionWithNameId } from "@/lib/types";

interface SuggestedNameRow extends ImageCreditRow {
  // bigint, cast to text in SQL to avoid precision loss.
  nameId: string;
  replacementName: string;
  replacementMeaning: string | null;
  isChosen: boolean;
  image: string | null;
}

async function queryAllSuggestedNames(): Promise<ApiListResponse<SuggestionWithNameId[]>> {
  const rows = await rpc.call<SuggestedNameRow[]>("get_suggested_names");

  const data: SuggestionWithNameId[] = rows.map((row) => ({
    nameId: Number(row.nameId),
    replacementName: row.replacementName,
    replacementMeaning: row.replacementMeaning ?? "",
    isChosen: row.isChosen,
    image: row.image ?? undefined,
    imageCredit: toImageCredit(row),
  }));

  return { data, count: data.length };
}

export const getAllSuggestedNames = cached(queryAllSuggestedNames, ["getAllSuggestedNames"], {
  revalidate: 3600,
});
