import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import * as Haptics from "expo-haptics";

interface QuickAction {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  prompt: string;
}

const ACTIONS: QuickAction[] = [
  { icon: "search", label: "Web Search", prompt: "Help me search the web for: " },
  { icon: "clock", label: "Set Reminder", prompt: "Help me set a reminder for: " },
  { icon: "calendar", label: "Schedule", prompt: "Help me plan and schedule: " },
  { icon: "zap", label: "Quick Task", prompt: "Help me quickly: " },
  { icon: "book-open", label: "Explain", prompt: "Explain in simple terms: " },
  { icon: "code", label: "Code Help", prompt: "Help me write code for: " },
];

interface Props {
  onSelect: (prompt: string) => void;
}

export function QuickActions({ onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      style={styles.container}
    >
      {ACTIONS.map((action) => (
        <Pressable
          key={action.label}
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.selectionAsync();
            }
            onSelect(action.prompt);
          }}
          style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
        >
          <Feather name={action.icon} size={13} color={Colors.accent} />
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.accentSoft,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillPressed: {
    backgroundColor: Colors.accentGlow,
    borderColor: Colors.borderBright,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Rajdhani_600SemiBold",
    letterSpacing: 0.3,
  },
});
