import ImageWithLoader from "@/lib/components/common/ImageWithLoader";
import ZoomEarthLink from "@/lib/components/common/ZoomEarthLink";
import StormHighlightBadges, { hasHighlight } from "@/lib/components/storm/StormHighlightBadges";
import { BACKGROUND_BADGE, INTENSITY_LABEL, TEXT_COLOR_BADGE } from "@/lib/constants";
import { COLOR } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import { formatStormDateRange, hourBucket } from "@/lib/utils/date";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";

const StormCard = ({ storm }: { storm: Storm }) => {
  const bgColor = BACKGROUND_BADGE[storm.intensity];
  const textColor = TEXT_COLOR_BADGE[storm.intensity];
  const label = INTENSITY_LABEL[storm.intensity];
  const dateRange = formatStormDateRange(storm.dateStart, storm.dateEnd);
  const mapUri = storm.map?.trim() || null;
  // A storm still over the basin has its track map redrawn upstream every day behind the same URL,
  // so the cached copy has to expire on its own or the card would show the first day forever.
  const mapCacheKey = mapUri && !storm.dateEnd ? `${mapUri}#${hourBucket()}` : undefined;

  return (
    <View style={styles.card}>
      <View style={[styles.header, { backgroundColor: bgColor }]}>
        {hasHighlight(storm) && (
          <View style={styles.badges}>
            <StormHighlightBadges storm={storm} />
          </View>
        )}

        <Text style={[styles.title, { color: textColor }]}>
          {label} {storm.name}
        </Text>

        {storm.jtwcDesignation ? (
          <View style={styles.meta}>
            <Ionicons name="pricetag-outline" size={12} color={textColor} />
            <Text style={[styles.metaText, { color: textColor }]}>{storm.jtwcDesignation}</Text>
          </View>
        ) : null}

        <View style={styles.meta}>
          <Ionicons name="calendar-outline" size={12} color={textColor} />
          <Text style={[styles.metaText, { color: textColor }]}>{dateRange}</Text>
        </View>
      </View>

      <ImageWithLoader
        source={mapUri}
        label={`${storm.name} ${storm.year} track`}
        style={styles.map}
        cacheKey={mapCacheKey}
      />

      <ZoomEarthLink storm={storm} variant="row" />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.border,
    backgroundColor: COLOR.surface,
  },
  header: {
    minHeight: 104,
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  badges: {
    marginBottom: 2,
  },
  title: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 14,
    lineHeight: 19,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
  },
  map: {
    height: 176,
    width: "100%",
    backgroundColor: COLOR.surfaceSubtle,
  },
});

export default StormCard;
