import ImageCredit from "@/lib/components/common/ImageCredit";
import TyphoonSpinner from "@/lib/components/common/TyphoonSpinner";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { ImageCredit as ImageCreditType } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, type ImageContentFit } from "expo-image";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ImageWithLoaderProps {
  source?: string | null;
  label: string;
  contentFit?: ImageContentFit;
  style?: StyleProp<ViewStyle>;
  spinnerSize?: "small" | "medium" | "large";
  showErrorLabel?: boolean;
  credit?: ImageCreditType;
}

const ImageWithLoader = ({
  source,
  label,
  contentFit = "contain",
  style,
  spinnerSize = "medium",
  showErrorLabel = true,
  credit,
}: ImageWithLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  if (!source || hasError) {
    return (
      <View
        style={[styles.root, styles.fallback, style]}
        accessibilityRole="image"
        accessibilityLabel="No image available"
      >
        <Ionicons name="image-outline" size={32} color={COLOR.textFaint} />
        {showErrorLabel && <Text style={styles.fallbackLabel}>No image available</Text>}
      </View>
    );
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="imagebutton"
        accessibilityLabel={`${label}. Tap to enlarge.`}
      >
        <View style={[styles.root, style]}>
          <Image
            source={{ uri: source }}
            style={StyleSheet.absoluteFill}
            contentFit={contentFit}
            transition={200}
            accessible
            accessibilityLabel={label}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
          {isLoading && (
            <View style={styles.overlay} pointerEvents="none">
              <TyphoonSpinner size={spinnerSize} />
            </View>
          )}
        </View>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.viewer} onPress={() => setOpen(false)} accessibilityRole="button">
          <Image
            source={{ uri: source }}
            style={styles.full}
            contentFit="contain"
            transition={150}
            accessible
            accessibilityLabel={label}
          />

          {credit?.author ? (
            <View style={[styles.caption, { paddingBottom: insets.bottom + SPACE.lg }]}>
              <ImageCredit credit={credit} align="center" />
            </View>
          ) : null}

          <View style={[styles.close, { top: insets.top + SPACE.sm }]}>
            <Ionicons name="close" size={26} color={COLOR.textInverse} />
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOR.surfaceSubtle,
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 8,
    backgroundColor: COLOR.surfaceSubtle,
  },
  fallbackLabel: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 12,
    color: COLOR.textFaint,
    textAlign: "center",
  },
  viewer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.92)",
  },
  full: {
    flex: 1,
  },
  caption: {
    paddingHorizontal: SPACE.xl,
  },
  // Decoration: the whole backdrop is the dismiss target, so this must not eat the tap itself.
  close: {
    position: "absolute",
    right: SPACE.md,
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    borderRadius: RADIUS.pill,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
});

export default ImageWithLoader;
