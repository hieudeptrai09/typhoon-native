import { useQuery } from "@/lib/api/client";
import { NAMING_LIST_FIRST_YEAR, TITLE_COMMON } from "@/lib/constants";
import { COLOR, HIT_SIZE, RADIUS, SPACE } from "@/lib/constants/theme";
import { getNameList } from "@/lib/data/getNameList";
import { getStorms } from "@/lib/data/getStorms";
import type { IconName } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { useRouter, type Href } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Fragment, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61586585781960";
const CC0_URL = "https://creativecommons.org/publicdomain/zero/1.0/";
const APP_VERSION = Constants.expoConfig?.version;

// The stats card is pulled up by this much so it straddles the hero's bottom edge.
const STATS_OVERLAP = 32;

const openLink = (url: string) => {
  WebBrowser.openBrowserAsync(url);
};

interface Feature {
  icon: IconName;
  title: string;
  detail: string;
  href: Href;
}

const features: Feature[] = [
  {
    icon: "today-outline",
    title: "Today",
    detail: "Active storms, this season's pace, and what formed on this day.",
    href: "/",
  },
  {
    icon: "thunderstorm-outline",
    title: "Storms",
    detail: `Every storm since ${NAMING_LIST_FIRST_YEAR} — rankings, records, and season stats.`,
    href: "/storms",
  },
  {
    icon: "calendar-outline",
    title: "Calendar",
    detail: "When storms form, laid out season by season.",
    href: "/calendar",
  },
  {
    icon: "book-outline",
    title: "Names",
    detail: "The naming lists, retired names, and the stories behind them.",
    href: "/names",
  },
];

const browseLinks: { icon: IconName; label: string; href: Href }[] = [
  { icon: "calendar-number-outline", label: "Seasons", href: "/years" },
  { icon: "flag-outline", label: "Countries", href: "/countries" },
  { icon: "grid-outline", label: "Positions", href: "/positions" },
  { icon: "text-outline", label: "Names A–Z", href: "/info" },
];

const sources = [
  {
    name: "Japan Meteorological Agency",
    detail: "Official names and best-track data",
    url: "https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/tyname.html",
  },
  {
    name: "Joint Typhoon Warning Center",
    detail: "Warnings and intensity estimates",
    url: "https://www.metoc.navy.mil/jtwc/jtwc.html",
  },
  {
    name: "Wikipedia",
    detail: "Naming history, CC BY-SA 4.0",
    url: "https://en.wikipedia.org/",
  },
];

const SectionTitle = ({ children }: { children: string }) => (
  <Text style={styles.sectionTitle} accessibilityRole="header">
    {children}
  </Text>
);

interface StatProps {
  value: number | undefined;
  label: string;
}

const Stat = ({ value, label }: StatProps) => (
  <View style={styles.stat} accessible accessibilityLabel={`${value ?? "Unknown"} ${label}`}>
    <Text style={styles.statValue}>{value?.toLocaleString() ?? "—"}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function AboutScreen() {
  const router = useRouter();
  // Same keys as the tabs, so these are almost always cache hits by the time About opens.
  const storms = useQuery("storms", () => getStorms());
  const names = useQuery("name-list", getNameList);

  const seasonCount = useMemo(
    () => (storms.data ? new Set(storms.data.map((storm) => storm.year)).size : undefined),
    [storms.data],
  );

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* iOS bounces past the top edge; without this the grey page shows above the hero. */}
      <View style={styles.overscroll} />

      <View style={styles.hero}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.appIcon}
          accessibilityIgnoresInvertColors
        />
        <Text style={styles.headline} accessibilityRole="header">
          Every Western Pacific typhoon, in your pocket
        </Text>
        <Text style={styles.subhead}>
          Follow storms as they form, compare seasons since {NAMING_LIST_FIRST_YEAR}, and discover
          the stories behind their names.
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.stats}>
          <Stat value={storms.data?.length} label="Storms" />
          <View style={styles.statDivider} />
          <Stat value={seasonCount} label="Seasons" />
          <View style={styles.statDivider} />
          <Stat value={names.data?.length} label="Names" />
        </View>

        <View style={styles.section}>
          <SectionTitle>Explore</SectionTitle>
          <View style={styles.group}>
            {features.map((feature, index) => (
              <Fragment key={feature.title}>
                {index > 0 && <View style={styles.insetSeparator} />}
                <Pressable
                  style={({ pressed }) => [styles.featureRow, pressed && styles.rowPressed]}
                  onPress={() => router.navigate(feature.href)}
                  accessibilityRole="link"
                  accessibilityLabel={feature.title}
                  accessibilityHint={feature.detail}
                >
                  <View style={styles.featureIcon}>
                    <Ionicons name={feature.icon} size={20} color={COLOR.accent} />
                  </View>
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDetail}>{feature.detail}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLOR.textFaint} />
                </Pressable>
              </Fragment>
            ))}
          </View>

          <View style={styles.browseGrid}>
            {browseLinks.map((link) => (
              <Pressable
                key={link.label}
                style={({ pressed }) => [styles.browseTile, pressed && styles.rowPressed]}
                onPress={() => router.navigate(link.href)}
                accessibilityRole="link"
                accessibilityLabel={link.label}
              >
                <Ionicons name={link.icon} size={18} color={COLOR.accent} />
                <Text style={styles.browseLabel} numberOfLines={1}>
                  {link.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle>Built on open data</SectionTitle>
          <View style={styles.group}>
            {sources.map((source, index) => (
              <Fragment key={source.name}>
                {index > 0 && <View style={styles.separator} />}
                <Pressable
                  style={({ pressed }) => [styles.sourceRow, pressed && styles.rowPressed]}
                  onPress={() => openLink(source.url)}
                  accessibilityRole="link"
                  accessibilityLabel={source.name}
                  accessibilityHint="Opens in browser"
                >
                  <View style={styles.featureText}>
                    <Text style={styles.sourceName}>{source.name}</Text>
                    <Text style={styles.featureDetail}>{source.detail}</Text>
                  </View>
                  <Ionicons name="open-outline" size={16} color={COLOR.textFaint} />
                </Pressable>
              </Fragment>
            ))}
          </View>
          <Text style={styles.fineprint}>
            All data and text here are free to reuse under{" "}
            <Text style={styles.link} onPress={() => openLink(CC0_URL)}>
              CC0
            </Text>{" "}
            — no permission needed, though credit is appreciated. Images keep their original
            copyright and are credited where the author is known; rights holders can{" "}
            <Text style={styles.link} onPress={() => openLink(FACEBOOK_URL)}>
              ask for changes or removal
            </Text>
            .
          </Text>
        </View>

        <View style={styles.cta}>
          <Text style={styles.ctaTitle}>Spotted a mistake?</Text>
          <Text style={styles.ctaBody}>
            This is a personal, non-commercial project by{" "}
            <Text style={styles.ctaEmphasis}>Cá Tra</Text>. Corrections and questions are always
            welcome.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.ctaButton, pressed && styles.buttonPressed]}
            onPress={() => openLink(FACEBOOK_URL)}
            accessibilityRole="link"
            accessibilityLabel="Message on Facebook"
          >
            <Ionicons name="logo-facebook" size={18} color={COLOR.accent} />
            <Text style={styles.ctaButtonLabel}>Message on Facebook</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>
          © {new Date().getFullYear()} {TITLE_COMMON}
          {APP_VERSION ? ` · v${APP_VERSION}` : ""}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLOR.background,
  },
  overscroll: {
    position: "absolute",
    top: -1000,
    left: 0,
    right: 0,
    height: 1000,
    backgroundColor: COLOR.accent,
  },
  hero: {
    alignItems: "center",
    gap: SPACE.md,
    paddingHorizontal: SPACE.xl,
    paddingTop: SPACE.lg,
    paddingBottom: SPACE.xl + STATS_OVERLAP,
    backgroundColor: COLOR.accent,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.lg + 4,
    backgroundColor: COLOR.surface,
    marginBottom: SPACE.xs,
  },
  headline: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 26,
    lineHeight: 34,
    color: COLOR.textInverse,
    textAlign: "center",
  },
  subhead: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    lineHeight: 23,
    color: COLOR.onHero,
    textAlign: "center",
  },
  body: {
    paddingHorizontal: SPACE.lg,
    paddingBottom: SPACE.xxl,
    gap: SPACE.xl,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -STATS_OVERLAP,
    paddingVertical: SPACE.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: COLOR.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.border,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 24,
    color: COLOR.text,
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLOR.textMuted,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: COLOR.border,
  },
  section: {
    gap: SPACE.md,
  },
  sectionTitle: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLOR.accent,
    paddingHorizontal: SPACE.xs,
  },
  group: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLOR.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.border,
    overflow: "hidden",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.md,
    minHeight: HIT_SIZE + SPACE.lg,
    paddingHorizontal: SPACE.lg,
    paddingVertical: SPACE.md,
  },
  rowPressed: {
    backgroundColor: COLOR.surfaceMuted,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOR.accentSoft,
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 16,
    color: COLOR.text,
  },
  featureDetail: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    lineHeight: 19,
    color: COLOR.textMuted,
  },
  // Starts past the icon badge so the line reads as belonging to the text column.
  insetSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: SPACE.lg + 40 + SPACE.md,
    backgroundColor: COLOR.border,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: SPACE.lg,
    backgroundColor: COLOR.border,
  },
  browseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACE.sm,
  },
  browseTile: {
    flexGrow: 1,
    flexBasis: "45%",
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
    minHeight: HIT_SIZE,
    paddingHorizontal: SPACE.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLOR.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.border,
  },
  browseLabel: {
    flex: 1,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: COLOR.textSecondary,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.md,
    minHeight: HIT_SIZE,
    paddingHorizontal: SPACE.lg,
    paddingVertical: SPACE.md,
  },
  sourceName: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: COLOR.text,
  },
  fineprint: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    lineHeight: 18,
    color: COLOR.textMuted,
    paddingHorizontal: SPACE.xs,
  },
  link: {
    fontFamily: "OpenSans_600SemiBold",
    color: COLOR.accent,
  },
  cta: {
    gap: SPACE.sm,
    padding: SPACE.xl,
    borderRadius: RADIUS.lg,
    backgroundColor: COLOR.accent,
  },
  ctaTitle: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 20,
    color: COLOR.textInverse,
  },
  ctaBody: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    lineHeight: 23,
    color: COLOR.onHero,
  },
  ctaEmphasis: {
    fontFamily: "OpenSans_600SemiBold",
    color: COLOR.textInverse,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACE.sm,
    height: HIT_SIZE,
    marginTop: SPACE.sm,
    borderRadius: RADIUS.pill,
    backgroundColor: COLOR.surface,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  ctaButtonLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: COLOR.accent,
  },
  footer: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: COLOR.textFaint,
    textAlign: "center",
  },
});
