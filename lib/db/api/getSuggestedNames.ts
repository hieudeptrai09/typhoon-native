import sql, { type ApiListResponse } from "@/lib/db";
import {
  imageCreditColumns,
  imageCreditJoin,
  toImageCredit,
  type ImageCreditRow,
} from "@/lib/db/module/imageCredit";
import type { SuggestionWithNameId } from "@/lib/types";
import { unstable_cache } from "next/cache";

interface SuggestedNameRow extends ImageCreditRow {
  // bigint: postgres.js returns int8 as a string to avoid silent precision loss.
  nameId: string;
  replacementName: string;
  replacementMeaning: string | null;
  isChosen: boolean;
  image: string | null;
}

async function queryAllSuggestedNames(): Promise<ApiListResponse<SuggestionWithNameId[]>> {
  const rows = await sql.query<SuggestedNameRow[]>(
    `SELECT
      sn.nameid AS "nameId",
      sn.replacementname AS "replacementName",
      sn.meaning as "replacementMeaning",
      sn.ischosen AS "isChosen",
      sn.image,
      ${imageCreditColumns("sn.")}
    FROM suggestednames sn
    ${imageCreditJoin("sn.")}
    ORDER BY sn.id ASC, sn.nameid DESC, sn.ischosen DESC`,
  );

  const data: SuggestionWithNameId[] = rows.map((row) => ({
    // Load-bearing: nameId arrives as a string because the column is bigint.
    nameId: Number(row.nameId),
    replacementName: row.replacementName,
    replacementMeaning: row.replacementMeaning ?? "",
    isChosen: row.isChosen,
    image: row.image ?? undefined,
    imageCredit: toImageCredit(row),
  }));

  return { data, count: data.length };
}

export const getAllSuggestedNames = unstable_cache(
  queryAllSuggestedNames,
  ["getAllSuggestedNames"],
  { revalidate: 3600 },
);
