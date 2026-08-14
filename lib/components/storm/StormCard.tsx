import ZoomableImage from "@/lib/components/common/ZoomableImage";
import StormHighlightBadges, { hasHighlight } from "@/lib/components/storm/StormHighlightBadges";
import { BACKGROUND_BADGE, INTENSITY_LABEL, TEXT_COLOR_BADGE } from "@/lib/constants";
import { COLOR } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import { formatStormDateRange } from "@/lib/utils/date";
import { getZoomEarthUrl } from "@/lib/utils/format";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, Text, View } from "react-native";

const StormCard = ({ storm }: { storm: Storm }) => {
  const bgColor = BACKGROUND_BADGE[storm.intensity];
  const textColor = TEXT_COLOR_BADGE[storm.intensity];
  const label = INTENSITY_LABEL[storm.intensity];
  const dateRange = formatStormDateRange(storm.dateStart, storm.dateEnd);

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

      <ZoomableImage
        source={storm.map?.trim() || null}
        label={`${storm.name} ${storm.year} track`}
        style={styles.map}
      />

      <Pressable
        onPress={() => WebBrowser.openBrowserAsync(getZoomEarthUrl(storm.name, storm.year))}
        style={({ pressed }) => [styles.link, pressed && styles.pressed]}
        accessibilityRole="link"
        accessibilityLabel={`View ${storm.name} ${storm.year} on Zoom Earth`}
      >
        <Text style={styles.linkLabel}>Zoom Earth</Text>
        <Ionicons name="open-outline" size={12} color={COLOR.accent} />
      </Pressable>
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
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 44,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLOR.border,
  },
  pressed: {
    backgroundColor: COLOR.surfaceMuted,
  },
  linkLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    color: COLOR.accent,
  },
});

export default StormCard;
