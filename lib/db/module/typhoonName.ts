import {
  imageCreditColumns,
  imageCreditJoin,
  toImageCredit,
  type ImageCreditRow,
} from "@/lib/db/module/imageCredit";
import type { RetiredName, RetirementReason } from "@/lib/types";

// Shape of a full typhoon-name projection.
// Field types are what postgres.js hands back for the underlying column types, not what the domain type wants — see toRetiredName for the gap.
export interface TyphoonNameRow extends ImageCreditRow {
  // bigint: postgres.js returns int8 as a string to avoid silent precision loss.
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

export const typhoonNameColumns = (nameAlias = "tn", positionAlias = "p") =>
  `${nameAlias}.id,
      ${nameAlias}.name,
      ${nameAlias}.meaning,
      ${nameAlias}.position,
      ${positionAlias}.country,
      ${nameAlias}.isretired AS "isRetired",
      ${nameAlias}.isreplaced AS "isReplaced",
      ${nameAlias}.retirementreason AS "retirementReason",
      ${nameAlias}.replacementname AS "replacementName",
      ${nameAlias}.note,
      ${nameAlias}.language,
      ${nameAlias}.originaltext AS "originalText",
      ${nameAlias}.ipa,
      ${nameAlias}.pronunciationfile AS "pronunciationFile",
      ${nameAlias}.lastyear AS "lastYear",
      ${nameAlias}.image,
      ${imageCreditColumns(`${nameAlias}.`)},
      ${nameAlias}.description,
      ${nameAlias}.tag`;

export const typhoonNameJoin = (nameAlias = "tn", positionAlias = "p") =>
  `INNER JOIN positions ${positionAlias} ON ${nameAlias}.position = ${positionAlias}.id
    ${imageCreditJoin(`${nameAlias}.`)}`;

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
