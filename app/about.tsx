import { TITLE_COMMON } from "@/lib/constants";
import { COLOR, SPACE } from "@/lib/constants/theme";
import { IconName } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as WebBrowser from "expo-web-browser";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61586585781960";
const CC0_URL = "https://creativecommons.org/publicdomain/zero/1.0/";

const openLink = (url: string) => {
  WebBrowser.openBrowserAsync(url);
};

const sources = [
  {
    name: "Japan Meteorological Agency (JMA)",
    detail: "RSMC Tokyo Typhoon Center — official typhoon names and best-track data.",
    url: "https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/tyname.html",
  },
  {
    name: "Joint Typhoon Warning Center (JTWC)",
    detail: "U.S. Navy/Air Force warnings and intensity estimates (public domain).",
    url: "https://www.metoc.navy.mil/jtwc/jtwc.html",
  },
  {
    name: "Wikipedia",
    detail: "Naming history and background context, used under CC BY-SA 4.0.",
    url: "https://en.wikipedia.org/",
  },
];

interface SectionHeadingProps {
  icon: IconName;
  title: string;
}

const SectionHeading = ({ icon, title }: SectionHeadingProps) => (
  <View style={styles.heading}>
    <Ionicons name={icon} size={20} color={COLOR.accent} />
    <Text style={styles.headingText}>{title}</Text>
  </View>
);

export default function AboutScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.section}>
        <SectionHeading icon="book-outline" title="The project" />
        <Text style={styles.body}>
          {TITLE_COMMON} is a database of Western Pacific typhoons — storm tracking, intensity
          analysis, naming history, and the stories behind typhoon names. It covers the Western
          Pacific basin from 2000 to the present, and is maintained as a personal, non-commercial
          project.
        </Text>
      </View>

      <View style={styles.section}>
        <SectionHeading icon="server-outline" title="Data sources & credits" />
        <Text style={styles.body}>
          Facts and figures are compiled from the following sources. Meteorological facts themselves
          aren&apos;t owned by anyone; the credit below acknowledges the organisations whose work
          this database builds upon.
        </Text>
        <View style={styles.sourceList}>
          {sources.map((source) => (
            <Pressable
              key={source.name}
              style={({ pressed }) => [styles.sourceCard, pressed && styles.pressed]}
              onPress={() => openLink(source.url)}
              accessibilityRole="link"
              accessibilityLabel={source.name}
            >
              <View style={styles.sourceTextBlock}>
                <Text style={styles.sourceName}>{source.name}</Text>
                <Text style={styles.sourceDetail}>{source.detail}</Text>
              </View>
              <Ionicons name="open-outline" size={16} color={COLOR.textFaint} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeading icon="reader-outline" title="License" />
        <View style={styles.licenseBox}>
          <Text style={[styles.body, styles.licenseParagraph]}>
            This database is dedicated to the public domain under{" "}
            <Text style={styles.link} onPress={() => openLink(CC0_URL)}>
              Creative Commons Zero 1.0 Universal (CC0 1.0)
            </Text>
            . To the extent possible under law, all rights are waived. You are free to copy, adapt,
            and use the data for any purpose, without asking permission — though a credit is always
            appreciated.
          </Text>
          <Text style={[styles.body, styles.licenseParagraph]}>
            This dedication covers the <Text style={styles.emphasis}>data and text</Text> of this
            database only. It does not extend to the images, which belong to their respective owners
            and remain under their original copyright. No ownership of, or license over, those
            images is claimed here.
          </Text>
          <Text style={[styles.body, styles.licenseParagraph, styles.lastParagraph]}>
            Where an image&apos;s author and license are known, they are credited alongside it. This
            is a personal, non-commercial project, and if you are a rights holder who would like an
            image credited differently or removed, please{" "}
            <Text style={styles.link} onPress={() => openLink(FACEBOOK_URL)}>
              get in touch
            </Text>{" "}
            and I will do so promptly.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeading icon="person-outline" title="Creator" />
        <Text style={styles.body}>
          Built and maintained by <Text style={styles.emphasis}>Cá Tra</Text>. Questions or
          corrections are welcome via Facebook.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.facebookButton, pressed && styles.pressed]}
          onPress={() => openLink(FACEBOOK_URL)}
          accessibilityRole="link"
          accessibilityLabel="Open our Facebook page"
        >
          <Ionicons name="logo-facebook" size={18} color={COLOR.textInverse} />
          <Text style={styles.facebookLabel}>Facebook</Text>
        </Pressable>
      </View>

      <Text style={styles.copyright}>
        © {new Date().getFullYear()} {TITLE_COMMON}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLOR.background,
  },
  content: {
    padding: SPACE.lg,
    paddingBottom: 40,
    gap: SPACE.xl,
  },
  section: {
    gap: 8,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headingText: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 17,
    color: COLOR.textSecondary,
  },
  body: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    lineHeight: 23,
    color: COLOR.textBody,
  },
  emphasis: {
    fontFamily: "OpenSans_600SemiBold",
    color: COLOR.textSecondary,
  },
  link: {
    fontFamily: "OpenSans_600SemiBold",
    color: COLOR.accent,
  },
  sourceList: {
    gap: 10,
    marginTop: 4,
  },
  sourceCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.border,
    backgroundColor: COLOR.surface,
  },
  sourceTextBlock: {
    flex: 1,
    gap: 3,
  },
  sourceName: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: COLOR.accent,
  },
  sourceDetail: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    lineHeight: 19,
    color: COLOR.textMuted,
  },
  licenseBox: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.border,
    backgroundColor: COLOR.surfaceSubtle,
  },
  licenseParagraph: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.border,
  },
  lastParagraph: {
    borderBottomWidth: 0,
  },
  facebookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    borderRadius: 12,
    backgroundColor: COLOR.accent,
    marginTop: 8,
  },
  facebookLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: COLOR.textInverse,
  },
  pressed: {
    opacity: 0.85,
  },
  copyright: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: COLOR.textFaint,
    textAlign: "center",
  },
});
