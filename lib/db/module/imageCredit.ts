import type { ImageCredit } from "@/lib/types";

export interface ImageCreditRow {
  imageAuthor: string | null;
  imageLicense: string | null;
  imageLicenseUrl: string | null;
  imageSourceUrl: string | null;
}

export const imageCreditColumns = (prefix = "", licenseAlias = "il") =>
  `${prefix}imageauthor AS "imageAuthor",
      ${licenseAlias}.name AS "imageLicense",
      ${licenseAlias}.url AS "imageLicenseUrl",
      ${prefix}imagesourceurl AS "imageSourceUrl"`;

export const imageCreditJoin = (prefix = "", licenseAlias = "il") =>
  `LEFT JOIN imagelicenses ${licenseAlias} ON ${prefix}imagelicenseid = ${licenseAlias}.id`;

// Public-domain works need no attribution, so their credit line stays hidden.
const isPublicDomain = (license: string | null): boolean =>
  !!license && /public domain|\bpdm\b|\bcc0\b/i.test(license);

// Rows with no author have nothing to attribute, so the credit line stays hidden.
export const toImageCredit = (row: ImageCreditRow): ImageCredit | undefined =>
  row.imageAuthor && !isPublicDomain(row.imageLicense)
    ? {
        author: row.imageAuthor,
        license: row.imageLicense ?? undefined,
        licenseUrl: row.imageLicenseUrl ?? undefined,
        sourceUrl: row.imageSourceUrl ?? undefined,
      }
    : undefined;
