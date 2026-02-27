import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  name: string;
  assistantName: string;
  personality: "professional" | "friendly" | "concise";
  speakResponses: boolean;
  voiceEnabled: boolean;
}

interface AssistantContextValue {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  profile: UserProfile;
  isStreaming: boolean;
  showTyping: boolean;
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  sendMessage: (text: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearHistory: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  assistantName: "ARIA",
  personality: "friendly",
  speakResponses: false,
  voiceEnabled: false,
};

const STORAGE_KEYS = {
  CONVERSATIONS: "aria_conversations",
  PROFILE: "aria_profile",
  ACTIVE_ID: "aria_active_id",
};

let messageCounter = 0;
function generateId(): string {
  messageCounter++;
  return `msg-${Date.now()}-${messageCounter}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateConvId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const AssistantContext = createContext<AssistantContextValue | null>(null);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    (async () => {
      try {
        const [savedConvs, savedProfile, savedActiveId] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
          AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_ID),
        ]);

        if (savedConvs) setConversations(JSON.parse(savedConvs));
        if (savedProfile) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(savedProfile) });
        if (savedActiveId) setActiveConversationId(savedActiveId);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    })();
  }, []);

  const saveConversations = async (convs: Conversation[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convs));
    } catch (e) {
      console.error("Failed to save conversations", e);
    }
  };

  const createConversation = (): string => {
    const id = generateConvId();
    const now = Date.now();
    const newConv: Conversation = {
      id,
      title: "New conversation",
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newConv, ...conversations];
    setConversations(updated);
    setActiveConversationId(id);
    saveConversations(updated);
    AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_ID, id);
    return id;
  };

  const deleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    saveConversations(updated);
    if (activeConversationId === id) {
      const newActive = updated[0]?.id ?? null;
      setActiveConversationId(newActive);
      AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_ID, newActive ?? "");
    }
  };

  const handleSetActiveConversation = (id: string | null) => {
    setActiveConversationId(id);
    AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_ID, id ?? "");
  };

  const sendMessage = async (text: string) => {
    if (isStreaming || !text.trim()) return;

    let convId = activeConversationId;
    let currentConvs = conversations;

    if (!convId) {
      convId = generateConvId();
      const now = Date.now();
      const newConv: Conversation = {
        id: convId,
        title: text.slice(0, 40),
        messages: [],
        createdAt: now,
        updatedAt: now,
      };
      currentConvs = [newConv, ...conversations];
      setConversations(currentConvs);
      setActiveConversationId(convId);
      AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_ID, convId);
    }

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };

    const activeConv = currentConvs.find((c) => c.id === convId);
    const prevMessages = activeConv?.messages ?? [];
    const updatedWithUser = [...prevMessages, userMessage];

    const updateConv = (msgs: Message[], title?: string) => {
      const updated = currentConvs.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            messages: msgs,
            title: title ?? c.title,
            updatedAt: Date.now(),
          };
        }
        return c;
      });
      setConversations(updated);
      return updated;
    };

    const convTitle =
      prevMessages.length === 0 ? text.slice(0, 45) : activeConv?.title ?? "Conversation";
    const convAfterUser = updateConv(updatedWithUser, convTitle);

    setIsStreaming(true);
    setShowTyping(true);

    const systemPromptMap = {
      professional: `You are ${profile.assistantName}, a professional AI personal assistant. Be precise, formal, and thorough.`,
      friendly: `You are ${profile.assistantName}, a warm and helpful AI assistant. Be conversational, supportive, and proactive.`,
      concise: `You are ${profile.assistantName}, a concise AI assistant. Give short, direct answers. No fluff.`,
    };

    const userName = profile.name ? `The user's name is ${profile.name}. ` : "";
    const systemPrompt =
      userName + systemPromptMap[profile.personality] +
      ` You assist with questions, tasks, planning, analysis, reminders, web searches, and more. For device tasks (calls, messages, apps), guide the user step by step.`;

    const apiMessages = updatedWithUser.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const { getApiUrl } = await import("@/lib/query-client");
      const { fetch } = await import("expo/fetch");
      const baseUrl = getApiUrl();

      const response = await fetch(`${baseUrl}api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ messages: apiMessages, systemPrompt }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";
      let assistantAdded = false;
      let latestConvs = convAfterUser;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;

              if (!assistantAdded) {
                setShowTyping(false);
                const assistantMsg: Message = {
                  id: generateId(),
                  role: "assistant",
                  content: fullContent,
                  timestamp: Date.now(),
                };
                const msgs = [...updatedWithUser, assistantMsg];
                latestConvs = latestConvs.map((c) =>
                  c.id === convId ? { ...c, messages: msgs, updatedAt: Date.now() } : c
                );
                setConversations([...latestConvs]);
                assistantAdded = true;
              } else {
                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id !== convId) return c;
                    const msgs = [...c.messages];
                    msgs[msgs.length - 1] = {
                      ...msgs[msgs.length - 1],
                      content: fullContent,
                    };
                    return { ...c, messages: msgs, updatedAt: Date.now() };
                  })
                );
              }
            }
          } catch {}
        }
      }

      setConversations((prev) => {
        saveConversations(prev);
        return prev;
      });
    } catch (error) {
      setShowTyping(false);
      const errMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "I'm having trouble connecting. Please check your connection and try again.",
        timestamp: Date.now(),
      };
      const errConvs = convAfterUser.map((c) =>
        c.id === convId
          ? { ...c, messages: [...updatedWithUser, errMsg], updatedAt: Date.now() }
          : c
      );
      setConversations(errConvs);
      saveConversations(errConvs);
    } finally {
      setIsStreaming(false);
      setShowTyping(false);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
  };

  const clearHistory = () => {
    setConversations([]);
    setActiveConversationId(null);
    saveConversations([]);
    AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_ID, "");
  };

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );

  const value = useMemo(
    () => ({
      conversations,
      activeConversationId,
      activeConversation,
      profile,
      isStreaming,
      showTyping,
      createConversation,
      deleteConversation,
      setActiveConversation: handleSetActiveConversation,
      sendMessage,
      updateProfile,
      clearHistory,
    }),
    [conversations, activeConversationId, activeConversation, profile, isStreaming, showTyping]
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error("useAssistant must be used within AssistantProvider");
  return ctx;
}
