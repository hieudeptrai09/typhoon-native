import { getPositionDetails } from "@/lib/db/api/getPositionDetails";
import { getPositionFromSlug, getPositionSlug } from "@/lib/utils/position";
import { notFound, permanentRedirect } from "next/navigation";
import PositionModal from "./PositionModal";

interface PositionModalPageProps {
  params: Promise<{ position: string }>;
}

const isValidPosition = (position: number): boolean =>
  Number.isInteger(position) && position >= 1 && position <= 143;

export default async function PositionModalPage({ params }: PositionModalPageProps) {
  const { position } = await params;
  const positionNum = getPositionFromSlug(position);

  if (positionNum !== null && getPositionSlug(positionNum) !== position) {
    permanentRedirect(`/positions/${getPositionSlug(positionNum)}/`);
  }

  if (positionNum === null || !isValidPosition(positionNum)) {
    notFound();
  }

  const result = await getPositionDetails(positionNum);

  return (
    <PositionModal detail={result?.data ?? null} position={positionNum} isError={result === null} />
  );
}
