// Helpers shared by the opengraph-image routes. Satori has no network access of
// its own, so every remote asset has to be inlined as a data URI before render.

import {
  CN,
  FM,
  HK,
  JP,
  KH,
  KP,
  KR,
  LA,
  MO,
  MY,
  PH,
  TH,
  US,
  VN,
} from "country-flag-icons/string/3x2";

const COUNTRY_FLAG_SVG: Record<string, string> = {
  Cambodia: KH,
  China: CN,
  "DPR Korea": KP,
  "HK, China": HK,
  Japan: JP,
  "Laos PDR": LA,
  "Macao, China": MO,
  Malaysia: MY,
  Micronesia: FM,
  Philippines: PH,
  "RO Korea": KR,
  Thailand: TH,
  "U.S.A.": US,
  Vietnam: VN,
};

export const flagDataUri = (country: string): string | null => {
  const svg = COUNTRY_FLAG_SVG[country];
  if (!svg) return null;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
};

// Wikimedia occasionally drops a request under burst load, so retry before giving up; a missing image only hides that piece of art, it never fails the render.
export async function fetchImageAsDataUri(url: string): Promise<string | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "CaTraTyphoonsApp/1.0 (og-image generator)" },
      });
      if (res.ok) {
        const type = res.headers.get("content-type") ?? "image/png";
        const buffer = Buffer.from(await res.arrayBuffer());
        return `data:${type};base64,${buffer.toString("base64")}`;
      }
    } catch {
      // fall through to retry
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
  }
  return null;
}
