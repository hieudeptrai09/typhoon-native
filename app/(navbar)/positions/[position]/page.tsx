import { getPositionDetails } from "@/lib/db/api/getPositionDetails";
import { getPositionFromSlug, getPositionSlug, getPositionTitle } from "@/lib/utils/position";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import PositionPageContent from "./PositionPageContent";

interface PositionPageProps {
  params: Promise<{ position: string }>;
}

const isValidPosition = (position: number): boolean =>
  Number.isInteger(position) && position >= 1 && position <= 143;

export async function generateStaticParams() {
  return Array.from({ length: 143 }, (_, i) => ({ position: getPositionSlug(i + 1) }));
}

export async function generateMetadata({ params }: PositionPageProps): Promise<Metadata> {
  const { position } = await params;
  const positionNum = getPositionFromSlug(position);

  if (positionNum === null || !isValidPosition(positionNum)) {
    return {};
  }

  const positionTitle = getPositionTitle(positionNum);

  return {
    title: `${positionTitle} — Naming Position`,
    description: `Names, storm history, and average intensity for naming position ${positionTitle}.`,
    alternates: {
      canonical: `/positions/${getPositionSlug(positionNum)}/`,
    },
  };
}

export default async function PositionPage({ params }: PositionPageProps) {
  const { position } = await params;
  const positionNum = getPositionFromSlug(position);

  if (positionNum !== null && getPositionSlug(positionNum) !== position) {
    permanentRedirect(`/positions/${getPositionSlug(positionNum)}/`);
  }

  if (positionNum === null || !isValidPosition(positionNum)) {
    notFound();
  }

  const result = await getPositionDetails(positionNum);

  if (result && !result.data) {
    notFound();
  }

  return (
    <PositionPageContent
      detail={result?.data ?? null}
      position={positionNum}
      isError={result === null}
    />
  );
}
