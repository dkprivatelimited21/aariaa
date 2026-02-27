import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";

interface Props {
  isActive?: boolean;
  size?: number;
}

export function PulseOrb({ isActive, size = 48 }: Props) {
  const ring1Scale = useSharedValue(1);
  const ring1Opacity = useSharedValue(0.6);
  const ring2Scale = useSharedValue(1);
  const ring2Opacity = useSharedValue(0.4);
  const coreScale = useSharedValue(1);

  useEffect(() => {
    const speed = isActive ? 800 : 2000;
    ring1Scale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: speed, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: speed, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );
    ring1Opacity.value = withRepeat(
      withSequence(withTiming(0, { duration: speed }), withTiming(0.6, { duration: speed })),
      -1,
      false
    );
    ring2Scale.value = withDelay(
      speed / 2,
      withRepeat(
        withSequence(
          withTiming(1.5, { duration: speed, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: speed })
        ),
        -1,
        false
      )
    );
    ring2Opacity.value = withDelay(
      speed / 2,
      withRepeat(
        withSequence(withTiming(0, { duration: speed }), withTiming(0.4, { duration: speed })),
        -1,
        false
      )
    );
    if (isActive) {
      coreScale.value = withRepeat(
        withSequence(withTiming(1.1, { duration: 300 }), withTiming(0.9, { duration: 300 })),
        -1,
        true
      );
    } else {
      coreScale.value = withTiming(1);
    }
  }, [isActive]);

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value,
  }));
  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Opacity.value,
  }));
  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coreScale.value }],
  }));

  return (
    <View style={[styles.container, { width: size * 2, height: size * 2 }]}>
      <Animated.View
        style={[
          styles.ring,
          {
            width: size * 2,
            height: size * 2,
            borderRadius: size,
            borderColor: Colors.accent,
          },
          ring1Style,
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          {
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: size * 0.75,
            borderColor: Colors.accentDim,
          },
          ring2Style,
        ]}
      />
      <Animated.View
        style={[
          styles.core,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isActive ? Colors.accent : Colors.accentDim,
          },
          coreStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderWidth: 1.5,
  },
  core: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
});
