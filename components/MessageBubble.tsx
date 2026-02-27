import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import type { Message } from "@/context/AssistantContext";

interface Props {
  message: Message;
  isLatest?: boolean;
}

export function MessageBubble({ message, isLatest }: Props) {
  const isUser = message.role === "user";
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(isUser ? 8 : -8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 250 });
    translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const timeStr = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        isUser ? styles.wrapperUser : styles.wrapperAI,
        animStyle,
      ]}
    >
      {!isUser && (
        <View style={styles.avatar}>
          <View style={styles.avatarDot} />
        </View>
      )}
      <View style={styles.bubbleContainer}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          <Text style={[styles.text, isUser ? styles.textUser : styles.textAI]}>
            {message.content}
          </Text>
        </View>
        <Text style={[styles.time, isUser ? styles.timeUser : styles.timeAI]}>{timeStr}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 16,
    alignItems: "flex-end",
    gap: 8,
  },
  wrapperUser: {
    justifyContent: "flex-end",
  },
  wrapperAI: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accentGlow,
    borderWidth: 1,
    borderColor: Colors.borderBright,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  bubbleContainer: {
    maxWidth: "78%",
    gap: 3,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: Colors.userBubble,
    borderWidth: 1,
    borderColor: Colors.userBubbleBorder,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: Colors.aiBubble,
    borderWidth: 1,
    borderColor: Colors.aiBubbleBorder,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Rajdhani_400Regular",
  },
  textUser: {
    color: Colors.text,
    fontFamily: "Rajdhani_500Medium",
  },
  textAI: {
    color: "rgba(255,255,255,0.88)",
  },
  time: {
    fontSize: 10,
    fontFamily: "ShareTechMono_400Regular",
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  timeUser: {
    textAlign: "right",
  },
  timeAI: {
    textAlign: "left",
    paddingLeft: 4,
  },
});
