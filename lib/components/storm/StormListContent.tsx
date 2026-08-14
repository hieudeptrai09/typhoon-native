import CountryFlag from "@/lib/components/common/CountryFlag";
import EmptyResults from "@/lib/components/common/EmptyResults";
import ImageWithLoader from "@/lib/components/common/ImageWithLoader";
import StormHighlightBadges, { hasHighlight } from "@/lib/components/storm/StormHighlightBadges";
import StormStats from "@/lib/components/storm/StormStats";
import { BACKGROUND_BADGE, INTENSITY_LABEL, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import { formatStormDateRange } from "@/lib/utils/date";
import { getZoomEarthUrl } from "@/lib/utils/format";
import { isExternalPosition } from "@/lib/utils/position";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

export interface StormListContentProps {
  storms: Storm[];
}

function StormRow({ storm, showMap }: { storm: Storm; showMap: boolean }) {
  const borderColor = BACKGROUND_BADGE[storm.intensity];
  const textColor = TEXT_COLOR_WHITE_BACKGROUND[storm.intensity];
  const label = INTENSITY_LABEL[storm.intensity];
  const hasMap = Boolean(storm.map && storm.map.trim() !== "");
  const dateRange = formatStormDateRange(storm.dateStart, storm.dateEnd);

  return (
    <View style={[styles.row, { borderLeftColor: borderColor }]}>
      {showMap && hasMap && (
        <ImageWithLoader
          source={storm.map}
          label={`${storm.name} ${storm.year} track`}
          style={styles.rowMap}
        />
      )}

      {hasHighlight(storm) && (
        <View style={styles.rowBadges}>
          <StormHighlightBadges storm={storm} />
        </View>
      )}

      <Text style={[styles.rowTitle, { color: textColor }]}>
        {label} {storm.name}
        {storm.jtwcDesignation ? ` (${storm.jtwcDesignation})` : ""}
      </Text>

      <View style={styles.rowFooter}>
        <Text style={styles.rowDate}>{dateRange}</Text>
        <Pressable
          onPress={() => WebBrowser.openBrowserAsync(getZoomEarthUrl(storm.name, storm.year))}
          hitSlop={8}
          style={({ pressed }) => [styles.link, pressed && styles.pressed]}
          accessibilityRole="link"
          accessibilityLabel={`View ${storm.name} ${storm.year} on Zoom Earth`}
        >
          <Text style={styles.linkLabel}>Zoom Earth</Text>
          <Ionicons name="open-outline" size={12} color={COLOR.accent} />
        </Pressable>
      </View>
    </View>
  );
}

const StormListContent = ({ storms }: StormListContentProps) => {
  const [showMap, setShowMap] = useState(false);

  if (storms.length === 0) {
    return <EmptyResults icon="file-tray-outline" description="No storms found for this name." />;
  }

  const isInternal = !isExternalPosition(storms[0].position);

  return (
    <View style={styles.root}>
      <View style={styles.summary}>
        <View style={styles.summaryHeader}>
          <View style={styles.origin}>
            {isInternal ? (
              <CountryFlag country={storms[0].country} showName />
            ) : (
              <Text style={styles.originName}>{storms[0].country}</Text>
            )}
            {isInternal && <Text style={styles.position}>· #{storms[0].position}</Text>}
          </View>

          <View style={styles.toggle}>
            <Text style={styles.toggleLabel}>Show Map</Text>
            <Switch
              value={showMap}
              onValueChange={setShowMap}
              trackColor={{ false: COLOR.disabled, true: COLOR.accentBorder }}
              thumbColor={showMap ? COLOR.accent : COLOR.surfaceSubtle}
              accessibilityLabel="Show storm track map"
            />
          </View>
        </View>

        <StormStats storms={storms} />
      </View>

      <View style={styles.list}>
        <Text style={styles.listHeading}>All Storms ({storms.length})</Text>
        {storms.map((storm, index) => (
          <StormRow key={`${storm.year}-${storm.name}-${index}`} storm={storm} showMap={showMap} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: 16,
  },
  summary: {
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.borderStrong,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  origin: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  originName: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 13,
    color: COLOR.textSecondary,
  },
  position: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: COLOR.textFaint,
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.textBody,
  },
  list: {
    gap: 6,
  },
  listHeading: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: COLOR.textSecondary,
    marginBottom: 2,
  },
  row: {
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    backgroundColor: COLOR.surfaceSubtle,
  },
  rowMap: {
    height: 192,
    width: "100%",
    marginBottom: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLOR.border,
  },
  rowBadges: {
    marginBottom: 2,
  },
  rowTitle: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 14,
  },
  rowFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  rowDate: {
    flexShrink: 1,
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: COLOR.textMuted,
  },
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pressed: {
    opacity: 0.6,
  },
  linkLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    color: COLOR.accent,
  },
});

export default StormListContent;
