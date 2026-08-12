import { toImageCredit, type ImageCreditRow } from "@/lib/db/module/imageCredit";
import type { RetiredName, RetirementReason } from "@/lib/types";

// Mirrors the v_typhoon_names view in db/functions.sql: field types are what the columns emit, not
// what the domain type wants — toRetiredName closes the gap.
export interface TyphoonNameRow extends ImageCreditRow {
  // bigint, cast to text in the view: JSON numbers would lose precision silently.
  id: string;
  name: string;
  meaning: string;
  position: number;
  country: string;
  isRetired: boolean;
  isReplaced: boolean;
  // NULL exactly when the name is still in rotation.
  retirementReason: RetirementReason | null;
  replacementName: string | null;
  note: string | null;
  language: string;
  originalText: string | null;
  ipa: string | null;
  pronunciationFile: string | null;
  lastYear: number | null;
  image: string | null;
  description: string | null;
  tag: string;
}

export const toRetiredName = (row: TyphoonNameRow): RetiredName => ({
  // Load-bearing: id arrives as a string because the column is bigint.
  id: Number(row.id),
  name: row.name,
  meaning: row.meaning,
  position: row.position,
  country: row.country,
  isRetired: row.isRetired,
  isReplaced: row.isReplaced,
  retirementReason: row.retirementReason ?? undefined,
  replacementName: row.replacementName ?? "",
  note: row.note ?? undefined,
  language: row.language,
  originalText: row.originalText ?? undefined,
  ipa: row.ipa ?? undefined,
  pronunciationFile: row.pronunciationFile ?? undefined,
  // lastyear is NULL for every name still in rotation; 0 is the established "no last year"
  // sentinel here and callers test it for truthiness.
  lastYear: row.lastYear ?? 0,
  image: row.image ?? undefined,
  imageCredit: toImageCredit(row),
  description: row.description ?? undefined,
  tag: row.tag,
});
