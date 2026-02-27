import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useAssistant, type Message } from "@/context/AssistantContext";
import { MessageBubble } from "@/components/MessageBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ChatInput } from "@/components/ChatInput";
import { QuickActions } from "@/components/QuickActions";
import { PulseOrb } from "@/components/PulseOrb";
import { ConversationDrawer } from "@/components/ConversationDrawer";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { activeConversation, isStreaming, showTyping, sendMessage, createConversation, profile } =
    useAssistant();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [inputPrefill, setInputPrefill] = useState("");
  const inputRef = useRef<any>(null);

  const messages = activeConversation?.messages ?? [];
  const reversedMessages = [...messages].reverse();

  const headerOpacity = useSharedValue(1);
  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value }));

  useEffect(() => {
    if (messages.length > 0) {
      setShowQuickActions(false);
    }
  }, [messages.length]);

  const handleQuickAction = (prompt: string) => {
    setInputPrefill(prompt);
    setShowQuickActions(false);
  };

  const handleSend = (text: string) => {
    setInputPrefill("");
    setShowQuickActions(false);
    sendMessage(text);
  };

  const handleNewConversation = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    createConversation();
    setShowQuickActions(true);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={styles.root}>
      <ConversationDrawer isVisible={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <Animated.View style={[styles.header, { paddingTop: topPad }, headerStyle]}>
        <Pressable
          onPress={() => setDrawerOpen(true)}
          style={styles.headerBtn}
          hitSlop={8}
        >
          <Feather name="menu" size={20} color={Colors.textSecondary} />
        </Pressable>

        <View style={styles.headerCenter}>
          <PulseOrb isActive={isStreaming} size={10} />
          <Text style={styles.headerTitle}>
            {profile.assistantName || "ARIA"}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            onPress={handleNewConversation}
            style={styles.headerBtn}
            hitSlop={8}
          >
            <Feather name="plus" size={20} color={Colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/settings")}
            style={styles.headerBtn}
            hitSlop={8}
          >
            <Feather name="sliders" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <PulseOrb isActive={false} size={36} />
            <Text style={styles.emptyTitle}>
              {profile.name ? `Hello, ${profile.name}` : "Hello"}
            </Text>
            <Text style={styles.emptySubtitle}>
              I'm {profile.assistantName || "ARIA"}, your personal AI assistant.
              {"\n"}How can I help you today?
            </Text>
          </View>
        ) : (
          <FlatList
            data={reversedMessages}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <MessageBubble
                message={item}
                isLatest={index === 0}
              />
            )}
            inverted={messages.length > 0}
            ListHeaderComponent={showTyping ? <TypingIndicator /> : null}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={{ paddingBottom: bottomPad }}>
          {showQuickActions && messages.length === 0 && (
            <QuickActions onSelect={handleQuickAction} />
          )}
          <ChatInput
            onSend={handleSend}
            disabled={isStreaming}
            initialValue={inputPrefill}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  headerTitle: {
    fontFamily: "ShareTechMono_400Regular",
    fontSize: 15,
    color: Colors.text,
    letterSpacing: 3,
  },
  messageList: {
    paddingVertical: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 20,
  },
  emptyTitle: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: 28,
    color: Colors.text,
    textAlign: "center",
    letterSpacing: 1,
  },
  emptySubtitle: {
    fontFamily: "Rajdhani_400Regular",
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
});
