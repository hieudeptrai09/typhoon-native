import type { ImageCredit } from "@/lib/types";

export interface ImageCreditRow {
  imageAuthor: string | null;
  imageLicense: string | null;
  imageLicenseUrl: string | null;
  imageSourceUrl: string | null;
}

// Public-domain works need no attribution.
const isPublicDomain = (license: string | null): boolean =>
  !!license && /public domain|\bpdm\b|\bcc0\b/i.test(license);

export const toImageCredit = (row: ImageCreditRow): ImageCredit | undefined =>
  row.imageAuthor && !isPublicDomain(row.imageLicense)
    ? {
        author: row.imageAuthor,
        license: row.imageLicense ?? undefined,
        licenseUrl: row.imageLicenseUrl ?? undefined,
        sourceUrl: row.imageSourceUrl ?? undefined,
      }
    : undefined;
