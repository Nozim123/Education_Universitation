import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Tables } from "@/integrations/supabase/types";

type Conversation = Tables<"conversations">;
type Message = Tables<"messages">;
type Profile = Tables<"profiles">;

interface ConversationWithParticipants extends Conversation {
  participants: {
    user_id: string;
    profile: Profile;
  }[];
  lastMessage?: Message | null;
  unreadCount?: number;
}

interface MessageWithSender extends Message {
  sender: Profile;
}

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithParticipants[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithParticipants | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Fetch user's conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get conversations where user is a participant
      const { data: participantData, error: participantError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (participantError) throw participantError;

      const conversationIds = participantData?.map(p => p.conversation_id) || [];

      if (conversationIds.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Fetch full conversation data
      const { data: conversationsData, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .in("id", conversationIds)
        .order("updated_at", { ascending: false });

      if (convError) throw convError;

      // For each conversation, fetch participants and last message
      const enrichedConversations = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          // Get participants
          const { data: participants } = await supabase
            .from("conversation_participants")
            .select(`
              user_id,
              profile:profiles(*)
            `)
            .eq("conversation_id", conv.id);

          // Get last message
          const { data: lastMessageData } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1);

          return {
            ...conv,
            participants: (participants || []).map(p => ({
              user_id: p.user_id,
              profile: p.profile as Profile,
            })),
            lastMessage: lastMessageData?.[0] || null,
            unreadCount: 0, // TODO: implement unread count
          };
        })
      );

      setConversations(enrichedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      setMessagesLoading(true);

      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages((data as MessageWithSender[]) || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // Send a message
  const sendMessage = async (content: string) => {
    if (!user || !selectedConversation) return { error: new Error("Not ready") };

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        content,
        message_type: "text",
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*)
      `)
      .single();

    if (!error && data) {
      setMessages(prev => [...prev, data as MessageWithSender]);
      
      // Update conversation's updated_at
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", selectedConversation.id);
    }

    return { error, data };
  };

  // Create or get a conversation with another user
  const startConversation = async (otherUserId: string) => {
    if (!user) return { error: new Error("Not authenticated"), data: null };

    try {
      // Check if conversation already exists
      const { data: existingParticipations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      const myConvIds = existingParticipations?.map(p => p.conversation_id) || [];

      if (myConvIds.length > 0) {
        const { data: otherParticipations } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", otherUserId)
          .in("conversation_id", myConvIds);

        const sharedConvId = otherParticipations?.[0]?.conversation_id;

        if (sharedConvId) {
          const existingConv = conversations.find(c => c.id === sharedConvId);
          if (existingConv) {
            setSelectedConversation(existingConv);
            return { error: null, data: existingConv };
          }
        }
      }

      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({ is_group: false })
        .select()
        .single();

      if (convError) throw convError;

      // Add participants
      await supabase.from("conversation_participants").insert([
        { conversation_id: newConv.id, user_id: user.id },
        { conversation_id: newConv.id, user_id: otherUserId },
      ]);

      // Refresh conversations
      await fetchConversations();

      return { error: null, data: newConv };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  // Select a conversation
  const selectConversation = (conversation: ConversationWithParticipants) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Real-time subscription for messages
  useEffect(() => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`messages:${selectedConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        async (payload) => {
          // Don't add duplicate messages
          const newMessage = payload.new as Message;
          
          // Skip if we already have this message (we added it locally)
          if (messages.some(m => m.id === newMessage.id)) return;

          // Fetch sender profile
          const { data: sender } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", newMessage.sender_id)
            .single();

          const messageWithSender: MessageWithSender = {
            ...newMessage,
            sender: sender as Profile,
          };

          setMessages(prev => [...prev, messageWithSender]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, messages]);

  // Real-time subscription for conversations
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("conversations-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConversations]);

  return {
    conversations,
    selectedConversation,
    messages,
    loading,
    messagesLoading,
    selectConversation,
    sendMessage,
    startConversation,
    fetchConversations,
  };
};
