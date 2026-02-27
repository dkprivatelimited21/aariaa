import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import * as Haptics from "expo-haptics";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  initialValue?: string;
}

export function ChatInput({ onSend, disabled, initialValue }: Props) {
  const [text, setText] = useState(initialValue ?? "");

  React.useEffect(() => {
    if (initialValue !== undefined) {
      setText(initialValue);
    }
  }, [initialValue]);

  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const sendScale = useSharedValue(1);

  const sendAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }));

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    const msg = text.trim();
    setText("");
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    sendScale.value = withSpring(0.85, { damping: 10 }, () => {
      sendScale.value = withSpring(1);
    });
    onSend(msg);
    inputRef.current?.focus();
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Ask ARIA anything..."
        placeholderTextColor={Colors.textMuted}
        multiline
        maxLength={2000}
        blurOnSubmit={false}
        onSubmitEditing={handleSend}
        returnKeyType="send"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        editable={!disabled}
        selectionColor={Colors.accent}
      />
      <Animated.View style={sendAnimStyle}>
        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          style={[styles.sendButton, canSend ? styles.sendButtonActive : styles.sendButtonInactive]}
        >
          <Feather
            name="send"
            size={17}
            color={canSend ? Colors.background : Colors.textMuted}
          />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  containerFocused: {
    borderTopColor: "rgba(0, 212, 255, 0.2)",
  },
  input: {
    flex: 1,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    color: Colors.text,
    fontFamily: "Rajdhani_500Medium",
    fontSize: 15,
    maxHeight: 120,
    minHeight: 42,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: Colors.accent,
  },
  sendButtonInactive: {
    backgroundColor: Colors.surfaceElevated,
  },
});
