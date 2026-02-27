import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useAssistant, type Conversation } from "@/context/AssistantContext";
import * as Haptics from "expo-haptics";

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

function ConvItem({
  conv,
  isActive,
  onPress,
  onDelete,
}: {
  conv: Conversation;
  isActive: boolean;
  onPress: () => void;
  onDelete: () => void;
}) {
  const previewMsg = conv.messages[conv.messages.length - 1]?.content ?? "No messages yet";
  const preview = previewMsg.slice(0, 55) + (previewMsg.length > 55 ? "…" : "");

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.convItem,
        isActive && styles.convItemActive,
        pressed && styles.convItemPressed,
      ]}
    >
      <View style={styles.convInfo}>
        <Text style={[styles.convTitle, isActive && styles.convTitleActive]} numberOfLines={1}>
          {conv.title}
        </Text>
        <Text style={styles.convPreview} numberOfLines={1}>
          {preview}
        </Text>
      </View>
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onDelete();
        }}
        style={styles.deleteBtn}
        hitSlop={8}
      >
        <Feather name="trash-2" size={14} color={Colors.textMuted} />
      </Pressable>
    </Pressable>
  );
}

export function ConversationDrawer({ isVisible, onClose }: Props) {
  const { conversations, activeConversationId, setActiveConversation, createConversation, deleteConversation } =
    useAssistant();
  const translateX = useSharedValue(-300);

  React.useEffect(() => {
    translateX.value = withTiming(isVisible ? 0 : -300, { duration: 280 });
  }, [isVisible]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-300, 0], [0, 0.5]),
  }));

  if (!isVisible) return null;

  return (
    <>
      <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, overlayOpacity]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.drawer, drawerStyle]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Conversations</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Feather name="x" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>
        <Pressable
          style={({ pressed }) => [styles.newConvBtn, pressed && styles.newConvBtnPressed]}
          onPress={() => {
            if (Platform.OS !== "web") Haptics.selectionAsync();
            createConversation();
            onClose();
          }}
        >
          <Feather name="plus" size={16} color={Colors.accent} />
          <Text style={styles.newConvLabel}>New Conversation</Text>
        </Pressable>
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <ConvItem
              conv={item}
              isActive={item.id === activeConversationId}
              onPress={() => {
                setActiveConversation(item.id);
                onClose();
              }}
              onDelete={() => deleteConversation(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="message-square" size={32} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No conversations yet</Text>
            </View>
          }
          contentContainerStyle={styles.list}
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "#000",
    zIndex: 10,
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 290,
    backgroundColor: Colors.backgroundTertiary,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    zIndex: 11,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginTop: Platform.OS === "web" ? 67 : 0,
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: "Rajdhani_700Bold",
    fontSize: 16,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  newConvBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: Colors.accentSoft,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  newConvBtnPressed: {
    backgroundColor: Colors.accentGlow,
  },
  newConvLabel: {
    color: Colors.accent,
    fontFamily: "Rajdhani_600SemiBold",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  list: {
    paddingBottom: 20,
  },
  convItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  convItemActive: {
    backgroundColor: Colors.accentSoft,
  },
  convItemPressed: {
    backgroundColor: Colors.surfaceElevated,
  },
  convInfo: {
    flex: 1,
    gap: 2,
  },
  convTitle: {
    color: Colors.textSecondary,
    fontFamily: "Rajdhani_600SemiBold",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  convTitleActive: {
    color: Colors.accent,
  },
  convPreview: {
    color: Colors.textMuted,
    fontFamily: "Rajdhani_400Regular",
    fontSize: 11,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    color: Colors.textMuted,
    fontFamily: "Rajdhani_400Regular",
    fontSize: 13,
  },
});
