// Chuyển từ app/(navbar)/names/[...slug]/page.tsx — convert tại chỗ.

import { getAllStormHistory } from "@/be/api/getStormHistory";
import { getAllSuggestedNames } from "@/be/api/getSuggestedNames";
import { getTyphoonNames } from "@/be/api/getTyphoonNames";
import NamesPageContent from "@/lib/components/name/NamesPageContent";
import { NAMES_DISPLAY_COOKIE, parseDisplayPrefs } from "@/lib/utils/name/displayPrefs";
import { getNamesDescription, getNamesTitle } from "@/lib/utils/name/metadata";
import {
  isHistoryScope,
  isValidNamesSlug,
  paramsToPath,
  slugToParams,
  slugToPath,
} from "@/lib/utils/name/routing";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isValidNamesSlug(slug)) {
    return {};
  }

  const slugParams = slugToParams(slug);

  return {
    title: `${getNamesTitle(slugParams)} | Names`,
    description: getNamesDescription(slugParams),
    alternates: {
      canonical: paramsToPath(slugParams),
    },
  };
}

const NamesPage = async ({ params }: PageProps) => {
  const { slug } = await params;

  if (!isValidNamesSlug(slug)) {
    notFound();
  }

  // Only the history grid and the retired view consume these, and the slug already says which is active.
  const slugParams = slugToParams(slug);

  const path = paramsToPath(slugParams);
  if (slugToPath(slug) !== path) {
    redirect(path);
  }

  const [result, cookieStore, historyResult, suggestedResult] = await Promise.all([
    getTyphoonNames(),
    cookies(),
    isHistoryScope(slugParams) ? getAllStormHistory() : null,
    slugParams.view === "retired" ? getAllSuggestedNames() : null,
  ]);
  const displayPrefs = parseDisplayPrefs(cookieStore.get(NAMES_DISPLAY_COOKIE)?.value);

  return (
    <NamesPageContent
      allNames={result?.data ?? null}
      stormHistory={historyResult?.data ?? []}
      suggestedNames={suggestedResult?.data ?? []}
      displayPrefs={displayPrefs}
    />
  );
};

export default NamesPage;
