import { getNameList } from "@/be/api/getNameList";
import { getSimilarNames } from "@/be/api/getSimilarNames";
import { getTyphoonNameByName, isNameNotFound } from "@/be/api/getTyphoonNameByName";
import EmptyResults from "@/lib/components/common/EmptyResults";
import PageHeader from "@/lib/components/common/PageHeader";
import InfoPageContent from "@/lib/components/info/InfoPageContent";
import DidYouMean from "@/lib/components/search/DidYouMean";
import { SearchX } from "lucide-react";
import type { Metadata } from "next";

interface InfoPageProps {
  params: Promise<{ name: string }>;
}

export async function generateStaticParams() {
  const result = await getNameList();
  if (!result?.data) return [];
  return result.data.map((name) => ({ name: name.toLowerCase() }));
}

export async function generateMetadata({ params }: InfoPageProps): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const result = await getTyphoonNameByName(decodedName);

  // The page still renders — it offers trigram suggestions instead of 404ing — but a
  // misspelling shouldn't become an indexable URL.
  if (isNameNotFound(result)) {
    return { robots: { index: false, follow: true } };
  }

  const displayName = decodedName.charAt(0).toUpperCase() + decodedName.slice(1).toLowerCase();

  return {
    title: `${displayName} — Typhoon Info`,
    description: `Details and storm history for typhoon name ${displayName}.`,
    alternates: {
      canonical: `/info/${displayName.toLowerCase()}/`,
    },
  };
}

export default async function InfoPage({ params }: InfoPageProps) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  const [result, nameListResult] = await Promise.all([
    getTyphoonNameByName(decodedName),
    getNameList(),
  ]);

  if (isNameNotFound(result)) {
    // Suggestions are a nicety, so a failed name-list fetch degrades to the plain empty state.
    const similar = await getSimilarNames(decodedName).catch(() => null);

    return (
      <PageHeader title="Name not found">
        <EmptyResults
          icon={SearchX}
          description={`No typhoon name matches "${decodedName}".`}
          action={<DidYouMean names={similar?.data ?? []} />}
        />
      </PageHeader>
    );
  }

  const allNames = [...(nameListResult?.data ?? [])].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );

  return (
    <InfoPageContent
      detail={result?.data ?? null}
      name={decodedName}
      isError={result === null}
      allNames={allNames}
    />
  );
}
