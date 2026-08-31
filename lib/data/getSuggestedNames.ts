import { toImageCredit, type ImageCreditRow } from "@/lib/data/rows/imageCredit";
import { rpc } from "@/lib/data/rpc";
import type { SuggestionWithNameId } from "@/lib/types";

interface SuggestedNameRow extends ImageCreditRow {
  // bigint, cast to text in SQL to avoid precision loss.
  nameId: string;
  replacementName: string;
  replacementMeaning: string | null;
  isChosen: boolean;
  image: string | null;
}

export async function getSuggestedNames(): Promise<SuggestionWithNameId[]> {
  const rows = await rpc<SuggestedNameRow[]>("get_suggested_names");

  return rows.map((row) => ({
    nameId: Number(row.nameId),
    replacementName: row.replacementName,
    replacementMeaning: row.replacementMeaning ?? "",
    isChosen: row.isChosen,
    image: row.image ?? undefined,
    imageCredit: toImageCredit(row),
  }));
}
