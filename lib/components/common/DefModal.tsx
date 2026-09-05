import { COLOR } from "@/lib/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SHEET_OFFSCREEN = 600;
const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY_PER_SEC = 700;
// A drag must clear this before it takes over, so a horizontal swipe inside the sheet still works.
const DRAG_ACTIVATE_Y = 6;
const DRAG_CANCEL_X = 12;

interface DefModalProps {
  open?: boolean;
  onClose: () => void;
  title?: ReactNode;
  footer?: ReactNode;
  // Off when the body scrolls itself, so two vertical scroll views never stack.
  scroll?: boolean;
  children: ReactNode;
}

const DefModal = ({
  open = true,
  onClose,
  title,
  footer,
  scroll = true,
  children,
}: DefModalProps) => {
  const insets = useSafeAreaInsets();
  // Lazy useState initializers, not useRef: the compiler's rules forbid reading a ref during
  // render, and both values are read from the style props below.
  const [translateY] = useState(() => new Animated.Value(SHEET_OFFSCREEN));
  const [backdrop] = useState(() => new Animated.Value(0));
  // Keeps the sheet mounted through its exit animation, after `open` is already false.
  const [mounted, setMounted] = useState(open);

  // Adjusted during render rather than in the effect below: the sheet has to be in the tree on the
  // very first frame it opens, and a setState inside the effect would cost an extra render first.
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (open) {
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

  // A Gesture is meant to be rebuilt whenever what it closes over changes, so it can read `onClose`
  // directly. runOnJS keeps the callbacks off the UI thread, where the RN Animated value lives.
  const drag = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .activeOffsetY(DRAG_ACTIVATE_Y)
        .failOffsetX([-DRAG_CANCEL_X, DRAG_CANCEL_X])
        .onUpdate((event) => {
          if (event.translationY > 0) translateY.setValue(event.translationY);
        })
        .onEnd((event) => {
          if (event.translationY > DISMISS_DISTANCE || event.velocityY > DISMISS_VELOCITY_PER_SEC) {
            onClose();
            return;
          }
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 24,
            stiffness: 260,
          }).start();
        }),
    [onClose, translateY],
  );

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
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
            <GestureDetector gesture={drag}>
              <View>
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
            </GestureDetector>

            {scroll ? (
              <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
            ) : (
              <View style={[styles.body, styles.bodyContent]}>{children}</View>
            )}

            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </Animated.View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
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
    flexShrink: 1,
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
