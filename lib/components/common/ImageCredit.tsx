import type { ImageCredit as ImageCreditType } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as WebBrowser from "expo-web-browser";
import { StyleSheet, Text, View } from "react-native";

interface ImageCreditProps {
  credit?: ImageCreditType;
  align?: "start" | "center" | "end";
}

const alignStyle = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
} as const;

const ImageCredit = ({ credit, align = "start" }: ImageCreditProps) => {
  if (!credit?.author) return null;

  const { author, license, licenseUrl, sourceUrl } = credit;
  const open = (url: string) => WebBrowser.openBrowserAsync(url);

  return (
    <View style={[styles.root, { justifyContent: alignStyle[align] }]}>
      <Ionicons name="camera-outline" size={12} color="#9ca3af" />
      <Text style={styles.text} numberOfLines={1}>
        {sourceUrl ? (
          <Text style={styles.link} onPress={() => open(sourceUrl)}>
            {author}
          </Text>
        ) : (
          author
        )}
        {license ? (
          <>
            {", "}
            {licenseUrl ? (
              <Text style={styles.link} onPress={() => open(licenseUrl)}>
                {license}
              </Text>
            ) : (
              license
            )}
          </>
        ) : null}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  text: {
    flexShrink: 1,
    fontFamily: "OpenSans_400Regular",
    fontSize: 11,
    lineHeight: 16,
    color: "#9ca3af",
  },
  link: {
    fontFamily: "OpenSans_600SemiBold",
    color: "#94a3b8",
    textDecorationLine: "underline",
  },
});

export default ImageCredit;
