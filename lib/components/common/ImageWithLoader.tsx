import TyphoonSpinner from "@/lib/components/common/TyphoonSpinner";
import { COLOR } from "@/lib/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, type ImageContentFit } from "expo-image";
import { useState } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

interface ImageWithLoaderProps {
  source?: string | null;
  label: string;
  contentFit?: ImageContentFit;
  /** Applied to the wrapper, which the image fills — give it the size or let a parent size it. */
  style?: StyleProp<ViewStyle>;
  spinnerSize?: "small" | "medium" | "large";
  showErrorLabel?: boolean;
}

const ImageWithLoader = ({
  source,
  label,
  contentFit = "contain",
  style,
  spinnerSize = "medium",
  showErrorLabel = true,
}: ImageWithLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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
});

export default ImageWithLoader;
