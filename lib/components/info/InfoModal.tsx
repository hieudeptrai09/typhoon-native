import DefModal from "@/lib/components/common/DefModal";
import EmptyResults from "@/lib/components/common/EmptyResults";
import FrownError from "@/lib/components/common/FrownError";
import Tabs, { type Tab } from "@/lib/components/common/Tabs";
import NameDetailsContent from "@/lib/components/name/NameDetailsContent";
import NameStatusIcon from "@/lib/components/name/NameStatusIcon";
import StormListContent from "@/lib/components/storm/StormListContent";
import type { BaseModalProps, SearchDetail } from "@/lib/types";
import { getNameStatusColor } from "@/lib/utils/colors";
import { isExternalPosition } from "@/lib/utils/position";
import { useState, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface InfoModalProps extends BaseModalProps {
  detail: SearchDetail | null;
  name: string;
  isError?: boolean;
}

type TabType = "details" | "storms";

// On web this was an intercepted route that rendered over the list. Native has a real /info/[name]
// screen, so this is the sheet variant: for opening a name without leaving the list you are in.
export default function InfoModal({
  isOpen,
  onClose,
  detail,
  name,
  isError = false,
}: InfoModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("details");

  const nameData = detail?.name ?? null;
  const storms = detail?.storms ?? [];
  const displayName = nameData?.name ?? name;
  const isRetired = nameData?.isRetired ?? false;
  const notFound = !nameData && storms.length === 0;

  let title: ReactNode;
  let content: ReactNode;

  if (isError) {
    content = <FrownError />;
  } else if (notFound) {
    content = (
      <EmptyResults icon="search-outline" description="No typhoon with that name was found." />
    );
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
      <View style={styles.title}>
        <NameStatusIcon
          isRetired={isRetired}
          retirementReason={nameData?.retirementReason}
          position={nameData?.position ?? 0}
          size={22}
        />
        <Text style={[styles.titleLabel, { color: nameStatusColor }]} numberOfLines={1}>
          {displayName.toLowerCase()}
        </Text>
      </View>
    );

    content = <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />;
  }

  return (
    <DefModal open={isOpen} onClose={onClose} title={title}>
      {content}
    </DefModal>
  );
}

const styles = StyleSheet.create({
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  titleLabel: {
    flexShrink: 1,
    fontFamily: "OpenSans_700Bold",
    fontSize: 22,
    textTransform: "capitalize",
  },
});
