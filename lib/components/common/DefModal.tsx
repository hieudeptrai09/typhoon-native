import { COLOR } from "@/lib/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SHEET_OFFSCREEN = 600;
const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 0.7;

interface DefModalProps {
  open?: boolean;
  onClose: () => void;
  title?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

/** Bottom sheet: the native stand-in for the centred dialog the web build uses. */
const DefModal = ({ open = true, onClose, title, footer, children }: DefModalProps) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_OFFSCREEN)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  // Keeps the sheet mounted through its exit animation, after `open` is already false.
  const [mounted, setMounted] = useState(open);
  // The drag-to-dismiss responder is built once, so it can't close over the prop directly.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (open) {
      setMounted(true);
      translateY.setValue(SHEET_OFFSCREEN);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 220,
          mass: 0.7,
        }),
        Animated.timing(backdrop, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SHEET_OFFSCREEN,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdrop, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [open, translateY, backdrop]);

  const pan = useRef(
    PanResponder.create({
      // Claim only a clear downward drag, so a horizontal swipe inside the sheet still works.
      onMoveShouldSetPanResponder: (_event, gesture) =>
        gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_event, gesture) => {
        if (gesture.dy > 0) translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_event, gesture) => {
        if (gesture.dy > DISMISS_DISTANCE || gesture.vy > DISMISS_VELOCITY) {
          onCloseRef.current();
          return;
        }
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 24,
          stiffness: 260,
        }).start();
      },
    }),
  ).current;

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          />
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.avoider}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.sheet,
              { paddingBottom: insets.bottom + 12, transform: [{ translateY }] },
            ]}
          >
            <View {...pan.panHandlers}>
              <View style={styles.grabber} />
              {title !== undefined && (
                <View style={styles.header}>
                  {typeof title === "string" ? (
                    <Text style={styles.title} numberOfLines={2}>
                      {title}
                    </Text>
                  ) : (
                    <View style={styles.titleSlot}>{title}</View>
                  )}
                  <Pressable
                    onPress={onClose}
                    hitSlop={12}
                    style={styles.close}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <Ionicons name="close" size={22} color={COLOR.textBody} />
                  </Pressable>
                </View>
              )}
            </View>

            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>

            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLOR.overlay,
  },
  // flex:1 is load-bearing: without it the sheet's percentage maxHeight has no height to
  // resolve against and the sheet can grow past the screen.
  avoider: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "88%",
    backgroundColor: COLOR.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLOR.borderStrong,
    marginTop: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.borderStrong,
  },
  titleSlot: {
    flex: 1,
  },
  title: {
    flex: 1,
    fontFamily: "OpenSans_700Bold",
    fontSize: 18,
    color: COLOR.text,
  },
  close: {
    padding: 2,
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    paddingTop: 14,
    paddingBottom: 4,
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLOR.borderStrong,
  },
});

export default DefModal;
