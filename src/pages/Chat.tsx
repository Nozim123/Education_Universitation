import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { 
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Image,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  MessageSquare,
  Plus,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { UserSearchDialog } from "@/components/chat/UserSearchDialog";
import { format } from "date-fns";

const Chat = () => {
  const { user } = useAuth();
  const {
    conversations,
    selectedConversation,
    messages,
    loading,
    messagesLoading,
    selectConversation,
    sendMessage,
    startConversation,
    fetchConversations,
  } = useChat();
  
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    const text = messageText;
    setMessageText("");
    await sendMessage(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartConversation = async (userId: string) => {
    const result = await startConversation(userId);
    if (result.data) {
      await fetchConversations();
    }
  };

  // Get the other participant in a conversation
  const getOtherParticipant = (conversation: typeof conversations[0]) => {
    const otherParticipant = conversation.participants.find(
      p => p.user_id !== user?.id
    );
    return otherParticipant?.profile;
  };

  const getConversationName = (conversation: typeof conversations[0]) => {
    if (conversation.name) return conversation.name;
    const other = getOtherParticipant(conversation);
    if (other?.first_name && other?.last_name) {
      return `${other.first_name} ${other.last_name}`;
    }
    return other?.email?.split("@")[0] || "Unknown";
  };

  const getConversationAvatar = (conversation: typeof conversations[0]) => {
    const other = getOtherParticipant(conversation);
    return other?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other?.id}`;
  };

  const filteredConversations = conversations.filter(conv => {
    const name = getConversationName(conv).toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <Layout showFooter={false}>
        <div className="h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="h-[calc(100vh-4rem)] bg-background">
        <div className="container mx-auto px-4 h-full py-4">
          <div className="bg-card rounded-2xl border h-full flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r flex flex-col">
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-xl">Messages</h2>
                  <UserSearchDialog onStartConversation={handleStartConversation}>
                    <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                      <UserPlus className="w-5 h-5" />
                    </Button>
                  </UserSearchDialog>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search conversations..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Conversations List */}
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((convo) => {
                      const other = getOtherParticipant(convo);
                      return (
                        <motion.button
                          key={convo.id}
                          onClick={() => selectConversation(convo)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                            selectedConversation?.id === convo.id ? "bg-primary/10" : "hover:bg-muted"
                          }`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={getConversationAvatar(convo)} />
                              <AvatarFallback>{getConversationName(convo)[0]}</AvatarFallback>
                            </Avatar>
                            {other?.is_online && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-card" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium truncate">{getConversationName(convo)}</span>
                              {convo.lastMessage && (
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(convo.lastMessage.created_at || ""), "HH:mm")}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {convo.lastMessage?.content || "No messages yet"}
                            </p>
                          </div>
                          {(convo.unreadCount || 0) > 0 && (
                            <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                              {convo.unreadCount}
                            </div>
                          )}
                        </motion.button>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No conversations yet</p>
                      <UserSearchDialog onStartConversation={handleStartConversation}>
                        <Button variant="link" className="mt-2">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Start a new chat
                        </Button>
                      </UserSearchDialog>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Area */}
            {selectedConversation ? (
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={getConversationAvatar(selectedConversation)} />
                        <AvatarFallback>{getConversationName(selectedConversation)[0]}</AvatarFallback>
                      </Avatar>
                      {getOtherParticipant(selectedConversation)?.is_online && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-card" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{getConversationName(selectedConversation)}</h3>
                      <p className="text-xs text-muted-foreground">
                        {getOtherParticipant(selectedConversation)?.is_online ? (
                          <span className="text-success">Online</span>
                        ) : (
                          "Last seen recently"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isMe = message.sender_id === user?.id;
                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                isMe
                                  ? "bg-primary text-primary-foreground rounded-br-sm"
                                  : "bg-muted rounded-bl-sm"
                              }`}
                            >
                              <p>{message.content}</p>
                              <div className={`flex items-center gap-1 mt-1 ${
                                isMe ? "justify-end" : ""
                              }`}>
                                <span className={`text-xs ${
                                  isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}>
                                  {message.created_at && format(new Date(message.created_at), "HH:mm")}
                                </span>
                                {isMe && (
                                  message.status === "read" ? (
                                    <CheckCheck className="w-3 h-3 text-primary-foreground/70" />
                                  ) : (
                                    <Check className="w-3 h-3 text-primary-foreground/70" />
                                  )
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Image className="w-4 h-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon">
                      <Smile className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      className="rounded-full"
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold text-lg mb-2">Select a conversation</h3>
                  <p className="mb-4">Choose a conversation from the sidebar to start chatting</p>
                  <UserSearchDialog onStartConversation={handleStartConversation}>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Start New Conversation
                    </Button>
                  </UserSearchDialog>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
