"use client";

import DefModal from "@/lib/components/DefModal";
import EmptyResults from "@/lib/components/EmptyResults";
import FrownError from "@/lib/components/FrownError";
import NameDetailsContent from "@/lib/components/NameDetailsContent";
import NameStatusIcon from "@/lib/components/NameStatusIcon";
import StormListContent from "@/lib/components/StormListContent";
import Tabs, { type Tab } from "@/lib/components/Tabs";
import type { SearchDetail } from "@/lib/types";
import { getNameStatusColor } from "@/lib/utils/colors";
import { isExternalPosition } from "@/lib/utils/position";
import { SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

interface InfoModalProps {
  detail: SearchDetail | null;
  name: string;
  isError?: boolean;
}

type TabType = "details" | "storms";

export default function InfoModal({ detail, name, isError = false }: InfoModalProps) {
  const router = useRouter();

  const nameData = detail?.name ?? null;
  const storms = detail?.storms ?? [];
  const displayName = nameData?.name ?? name;
  const isRetired = nameData?.isRetired ?? false;

  const [activeTab, setActiveTab] = useState<TabType>("details");

  const notFound = !nameData && storms.length === 0;

  let title: ReactNode;
  let content: ReactNode;

  if (isError) {
    content = <FrownError />;
  } else if (notFound) {
    content = <EmptyResults icon={SearchX} description="No typhoon with that name was found." />;
  } else {
    const nameStatusColor = getNameStatusColor({
      isRetired,
      retirementReason: nameData?.retirementReason,
      isExternal: isExternalPosition(nameData?.position),
    });

    const tabs: Tab<TabType>[] = [
      {
        key: "storms",
        label: `Storms (${storms.length})`,
        content: <StormListContent storms={storms} />,
      },
      {
        key: "details",
        label: "Name Details",
        content: (
          <NameDetailsContent name={nameData} correctSpelling={storms[0]?.correctSpelling} />
        ),
      },
    ];

    title = (
      <div className="flex items-center gap-2">
        <NameStatusIcon
          isRetired={isRetired}
          retirementReason={nameData?.retirementReason}
          position={nameData?.position ?? 0}
          size={24}
        />
        <span className="text-2xl font-bold capitalize" style={{ color: nameStatusColor }}>
          {displayName.toLowerCase()}
        </span>
      </div>
    );

    content = (
      <div className="pt-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          ariaLabel="Name details tabs"
          idPrefix="info-modal-tab"
        />
      </div>
    );
  }

  return (
    <DefModal onClose={() => router.back()} width={560} title={title}>
      {content}
    </DefModal>
  );
}
