import CountryFlag from "@/lib/components/common/CountryFlag";
import DefModal from "@/lib/components/common/DefModal";
import EmptyResults from "@/lib/components/common/EmptyResults";
import FrownError from "@/lib/components/common/FrownError";
import ImageCredit from "@/lib/components/common/ImageCredit";
import ImageWithLoader from "@/lib/components/common/ImageWithLoader";
import Tabs, { type Tab } from "@/lib/components/common/Tabs";
import StormStats from "@/lib/components/storm/StormStats";
import { BACKGROUND_BADGE, INTENSITY_LABEL, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import type { BaseModalProps, PositionDetail, Storm, TyphoonName } from "@/lib/types";
import { getDistanceColor, getNameStatusColor } from "@/lib/utils/colors";
import { formatStormDateRange } from "@/lib/utils/date";
import { getZoomEarthUrl } from "@/lib/utils/format";
import { getPositionTitle } from "@/lib/utils/position";
import {
  calculateAverage,
  calculateGapAverage,
  formatDistance,
  getGroupedStorms,
  getIntensityFromNumber,
  sortNamesByFirstYear,
} from "@/lib/utils/storm/aggregate";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as WebBrowser from "expo-web-browser";
import { useState, type ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

interface PositionModalProps extends BaseModalProps {
  detail: PositionDetail | null;
  position: number;
  isError?: boolean;
}

type TabType = "names" | "storms";

/** Above this the position belongs to another basin's agency, which has no grid cell or country. */
const LAST_GRID_POSITION = 140;

// Replaces antd's Carousel: a paging ScrollView is the gesture people already expect here, so the
// arrows the web build needed are gone and only the page dots remain.
function Carousel({ slides }: { slides: ReactNode[] }) {
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);

  if (slides.length === 0) return null;

  const handleLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width === 0) return;
    setPage(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <View onLayout={handleLayout}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEnabled={slides.length > 1}
      >
        {slides.map((slide, index) => (
          <View key={index} style={{ width }}>
            {slide}
          </View>
        ))}
      </ScrollView>

      {slides.length > 1 && (
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View key={index} style={[styles.dot, index === page && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

/** One name slide: "Name (language): meaning" above its image. */
function NameSlide({ name }: { name: TyphoonName }) {
  return (
    <View style={styles.slide}>
      <Text style={styles.slideText}>
        <Text style={[styles.slideName, { color: getNameStatusColor(name) }]}>{name.name}</Text>
        {name.country ? <Text style={styles.slideMeta}> ({name.language}): </Text> : null}
        {name.meaning ? <Text style={styles.slideMeaning}>{name.meaning}</Text> : null}
      </Text>

      {name.image ? (
        <View>
          <ImageWithLoader
            source={name.image}
            label={name.name}
            style={styles.slideImage}
            spinnerSize="small"
          />
          <ImageCredit credit={name.imageCredit} />
        </View>
      ) : null}
    </View>
  );
}

function StormGridCard({ storm }: { storm: Storm }) {
  const accent = TEXT_COLOR_WHITE_BACKGROUND[storm.intensity];
  const hasMap = Boolean(storm.map && storm.map.trim() !== "");

  return (
    <View style={styles.card}>
      {hasMap ? (
        <ImageWithLoader
          source={storm.map}
          label={`${storm.name} ${storm.year} track`}
          style={styles.cardImage}
          spinnerSize="small"
          showErrorLabel={false}
        />
      ) : (
        <View style={styles.cardNoImage}>
          <Ionicons name="image-outline" size={16} color="#94a3b8" />
        </View>
      )}

      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: accent }]}>
          {INTENSITY_LABEL[storm.intensity]} {storm.name}
        </Text>

        <View style={styles.cardDate}>
          <Ionicons name="calendar-outline" size={12} color="#334155" />
          <Text style={styles.cardDateText} numberOfLines={1}>
            {formatStormDateRange(storm.dateStart, storm.dateEnd)}
          </Text>
        </View>

        <Pressable
          onPress={() => WebBrowser.openBrowserAsync(getZoomEarthUrl(storm.name, storm.year))}
          hitSlop={8}
          style={({ pressed }) => [styles.link, pressed && styles.pressed]}
          accessibilityRole="link"
          accessibilityLabel={`View ${storm.name} ${storm.year} on Zoom Earth`}
        >
          <Text style={styles.linkLabel}>Zoom Earth</Text>
          <Ionicons name="open-outline" size={12} color="#0369a1" />
        </Pressable>
      </View>
    </View>
  );
}

export default function PositionModal({
  isOpen,
  onClose,
  detail,
  position,
  isError = false,
}: PositionModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("names");

  const isInternal = position <= LAST_GRID_POSITION;
  const country = detail?.country ?? "";
  const names = detail?.names ?? [];
  const storms = detail?.storms ?? [];
  const isEmpty = !detail || (names.length === 0 && storms.length === 0);

  const titleColor =
    storms.length > 0
      ? TEXT_COLOR_WHITE_BACKGROUND[getIntensityFromNumber(calculateAverage(storms))]
      : "#64748b";

  const title: ReactNode = (
    <View style={styles.title}>
      {isInternal && country ? <CountryFlag country={country} size={20} /> : null}
      <Text style={[styles.titleLabel, { color: titleColor }]} numberOfLines={1}>
        {getPositionTitle(position)}
      </Text>
    </View>
  );

  const stormsPanel = (
    <View style={styles.panel}>
      {storms.length === 0 ? (
        <Text style={styles.empty}>No storms recorded at this position.</Text>
      ) : (
        <>
          <StormStats storms={storms} />

          {sortNamesByFirstYear(Object.entries(getGroupedStorms(storms, "name"))).map(
            ([name, group]) => {
              const sorted = [...group].sort((a, b) => a.year - b.year);
              const average = calculateAverage(sorted);
              const groupIntensity = getIntensityFromNumber(average);
              const recurrence = calculateGapAverage(sorted);

              return (
                <View key={name} style={styles.group}>
                  <View
                    style={[
                      styles.groupHeader,
                      { borderLeftColor: BACKGROUND_BADGE[groupIntensity] },
                    ]}
                  >
                    <Text style={styles.groupName}>{name}</Text>

                    <View style={styles.groupStats}>
                      <Text style={styles.stat}>
                        Count: <Text style={styles.statValue}>{sorted.length}</Text>
                      </Text>
                      <Text style={styles.stat}>
                        Avg:{" "}
                        <Text
                          style={[
                            styles.statValue,
                            { color: TEXT_COLOR_WHITE_BACKGROUND[groupIntensity] },
                          ]}
                        >
                          {average.toFixed(2)}
                        </Text>
                      </Text>
                      {/* A lone storm leaves no gap to measure, so the stat is left off. */}
                      {recurrence >= 0 && (
                        <Text style={styles.stat}>
                          Every:{" "}
                          <Text style={[styles.statValue, { color: getDistanceColor(recurrence) }]}>
                            {formatDistance(recurrence)}
                          </Text>{" "}
                          yrs
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.cards}>
                    {sorted.map((storm, index) => (
                      <StormGridCard key={index} storm={storm} />
                    ))}
                  </View>
                </View>
              );
            },
          )}
        </>
      )}
    </View>
  );

  let content: ReactNode;

  if (isError) {
    content = <FrownError />;
  } else if (isEmpty) {
    content = (
      <EmptyResults icon="search-outline" description="No data recorded for this position yet." />
    );
  } else {
    const tabs: Tab<TabType>[] = [
      {
        key: "names",
        label: `Names (${names.length})`,
        content:
          names.length === 0 ? (
            <Text style={styles.empty}>No names have been assigned to this slot.</Text>
          ) : (
            <Carousel
              slides={names.map((name) => (
                <NameSlide key={name.id} name={name} />
              ))}
            />
          ),
      },
      { key: "storms", label: `Storms (${storms.length})`, content: stormsPanel },
    ];

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
    gap: 10,
  },
  titleLabel: {
    flexShrink: 1,
    fontFamily: "OpenSans_700Bold",
    fontSize: 22,
  },
  dots: {
    flexDirection: "row",
    alignSelf: "center",
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#cbd5e1",
  },
  dotActive: {
    backgroundColor: "#0369a1",
  },
  slide: {
    gap: 12,
    paddingHorizontal: 4,
  },
  slideText: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: "#475569",
  },
  slideName: {
    fontFamily: "OpenSans_700Bold",
  },
  slideMeta: {
    color: "#475569",
  },
  slideMeaning: {
    fontFamily: "OpenSans_400Regular_Italic",
  },
  slideImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  panel: {
    gap: 20,
  },
  empty: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    paddingVertical: 16,
  },
  group: {
    gap: 10,
  },
  groupHeader: {
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    backgroundColor: "#f8fafc",
  },
  groupName: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: "#334155",
  },
  groupStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 14,
    rowGap: 2,
  },
  stat: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: "#475569",
  },
  statValue: {
    fontFamily: "OpenSans_700Bold",
    color: "#334155",
  },
  cards: {
    gap: 10,
  },
  card: {
    gap: 8,
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
  },
  cardImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 6,
    backgroundColor: "#ffffff",
  },
  cardNoImage: {
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
  },
  cardBody: {
    gap: 4,
  },
  cardTitle: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 14,
    lineHeight: 19,
  },
  cardDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardDateText: {
    flexShrink: 1,
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: "#475569",
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
    color: "#0369a1",
  },
});
