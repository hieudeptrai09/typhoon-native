import ImageCredit from "@/lib/components/common/ImageCredit";
import ImageWithLoader from "@/lib/components/common/ImageWithLoader";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { ImageCredit as ImageCreditType } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ZoomableImageProps {
  source?: string | null;
  label: string;
  style?: StyleProp<ViewStyle>;
  spinnerSize?: "small" | "medium" | "large";
  showErrorLabel?: boolean;
  credit?: ImageCreditType;
}

const ZoomableImage = ({
  source,
  label,
  style,
  spinnerSize,
  showErrorLabel,
  credit,
}: ZoomableImageProps) => {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const thumbnail = (
    <ImageWithLoader
      source={source}
      label={label}
      style={style}
      spinnerSize={spinnerSize}
      showErrorLabel={showErrorLabel}
    />
  );

  // Nothing to enlarge, so the placeholder stays inert rather than opening an empty viewer.
  if (!source) return thumbnail;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="imagebutton"
        accessibilityLabel={`${label}. Tap to enlarge.`}
      >
        {thumbnail}
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

export default ZoomableImage;
