import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useAssistant, type UserProfile } from "@/context/AssistantContext";
import * as Haptics from "expo-haptics";

type PersonalityOption = {
  value: UserProfile["personality"];
  label: string;
  description: string;
};

const PERSONALITIES: PersonalityOption[] = [
  { value: "friendly", label: "Friendly", description: "Warm, conversational, and supportive" },
  { value: "professional", label: "Professional", description: "Precise, formal, and thorough" },
  { value: "concise", label: "Concise", description: "Short, direct answers only" },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, clearHistory } = useAssistant();
  const [localName, setLocalName] = useState(profile.name);
  const [localAssistantName, setLocalAssistantName] = useState(profile.assistantName);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSave = () => {
    updateProfile({ name: localName.trim(), assistantName: localAssistantName.trim() || "ARIA" });
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleClearHistory = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    clearHistory();
    router.back();
  };

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Feather name="x" size={22} color={Colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <Pressable onPress={handleSave} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Section title="Identity">
          <InputField
            label="Your Name"
            value={localName}
            onChangeText={setLocalName}
            placeholder="Enter your name"
          />
          <InputField
            label="Assistant Name"
            value={localAssistantName}
            onChangeText={setLocalAssistantName}
            placeholder="ARIA"
          />
        </Section>

        <Section title="Personality">
          {PERSONALITIES.map((p) => (
            <Pressable
              key={p.value}
              onPress={() => {
                updateProfile({ personality: p.value });
                if (Platform.OS !== "web") Haptics.selectionAsync();
              }}
              style={({ pressed }) => [
                styles.personalityOption,
                profile.personality === p.value && styles.personalityOptionActive,
                pressed && styles.personalityOptionPressed,
              ]}
            >
              <View style={styles.personalityLeft}>
                {profile.personality === p.value ? (
                  <View style={styles.radioActive}>
                    <View style={styles.radioDot} />
                  </View>
                ) : (
                  <View style={styles.radio} />
                )}
                <View>
                  <Text
                    style={[
                      styles.personalityLabel,
                      profile.personality === p.value && styles.personalityLabelActive,
                    ]}
                  >
                    {p.label}
                  </Text>
                  <Text style={styles.personalityDesc}>{p.description}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </Section>

        <Section title="Preferences">
          <ToggleRow
            label="Speak Responses"
            description="Have ARIA read replies aloud"
            value={profile.speakResponses}
            onToggle={(v) => {
              updateProfile({ speakResponses: v });
            }}
          />
        </Section>

        <Section title="Memory">
          <View style={styles.infoBox}>
            <Feather name="shield" size={14} color={Colors.accent} />
            <Text style={styles.infoText}>
              All conversations and preferences are stored privately on your device. Nothing is
              uploaded to the cloud.
            </Text>
          </View>
          <Pressable
            onPress={handleClearHistory}
            style={({ pressed }) => [styles.dangerBtn, pressed && styles.dangerBtnPressed]}
          >
            <Feather name="trash-2" size={15} color={Colors.error} />
            <Text style={styles.dangerBtnText}>Clear All Conversations</Text>
          </Pressable>
        </Section>

        <Section title="About">
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>ARIA</Text>
            <Text style={styles.aboutSub}>Advanced Reasoning Intelligence Assistant</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.inputField}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        selectionColor={Colors.accent}
      />
    </View>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onToggle,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleInfo}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.surfaceElevated, true: Colors.accentDim }}
        thumbColor={value ? Colors.accent : Colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "ShareTechMono_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    letterSpacing: 3,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.accentSoft,
    borderWidth: 1,
    borderColor: Colors.borderBright,
  },
  saveBtnText: {
    fontFamily: "Rajdhani_600SemiBold",
    fontSize: 14,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  scroll: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: "ShareTechMono_400Regular",
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  sectionContent: {
    gap: 2,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  inputField: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 4,
  },
  inputLabel: {
    fontFamily: "Rajdhani_500Medium",
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  textInput: {
    fontFamily: "Rajdhani_500Medium",
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 2,
  },
  personalityOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  personalityOptionActive: {
    backgroundColor: Colors.accentSoft,
  },
  personalityOptionPressed: {
    backgroundColor: Colors.surfaceElevated,
  },
  personalityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: Colors.textMuted,
  },
  radioActive: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  personalityLabel: {
    fontFamily: "Rajdhani_600SemiBold",
    fontSize: 15,
    color: Colors.textSecondary,
  },
  personalityLabelActive: {
    color: Colors.accent,
  },
  personalityDesc: {
    fontFamily: "Rajdhani_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  toggleInfo: {
    flex: 1,
    gap: 2,
  },
  toggleLabel: {
    fontFamily: "Rajdhani_600SemiBold",
    fontSize: 15,
    color: Colors.textSecondary,
  },
  toggleDesc: {
    fontFamily: "Rajdhani_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoText: {
    flex: 1,
    fontFamily: "Rajdhani_400Regular",
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
  },
  dangerBtnPressed: {
    backgroundColor: "rgba(255,56,96,0.08)",
  },
  dangerBtnText: {
    fontFamily: "Rajdhani_600SemiBold",
    fontSize: 15,
    color: Colors.error,
  },
  aboutCard: {
    padding: 20,
    alignItems: "center",
    gap: 4,
  },
  aboutTitle: {
    fontFamily: "ShareTechMono_400Regular",
    fontSize: 20,
    color: Colors.accent,
    letterSpacing: 4,
  },
  aboutSub: {
    fontFamily: "Rajdhani_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
  },
  aboutVersion: {
    fontFamily: "ShareTechMono_400Regular",
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginTop: 4,
  },
});
