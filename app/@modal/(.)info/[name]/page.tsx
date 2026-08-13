import { getTyphoonNameByName } from "@/lib/db/api/getTyphoonNameByName";
import InfoModal from "./InfoModal";

interface InfoModalPageProps {
  params: Promise<{ name: string }>;
}

export default async function InfoModalPage({ params }: InfoModalPageProps) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  const result = await getTyphoonNameByName(decodedName);

  return <InfoModal detail={result?.data ?? null} name={decodedName} isError={result === null} />;
}
