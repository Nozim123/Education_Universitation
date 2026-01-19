import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, Phone, Volume2, VolumeX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VoiceRoom, VoiceParticipant } from "@/utils/webrtc";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoiceChatProps {
  roomId: string;
  roomName?: string;
  onLeave?: () => void;
}

export const VoiceChat = ({ roomId, roomName = "Voice Room", onLeave }: VoiceChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const voiceRoomRef = useRef<VoiceRoom | null>(null);

  useEffect(() => {
    return () => {
      if (voiceRoomRef.current) {
        voiceRoomRef.current.leaveRoom();
      }
    };
  }, []);

  // Listen for other participants via Supabase Realtime
  useEffect(() => {
    if (!isConnected || !user) return;

    const channel = supabase
      .channel(`voice-room-${roomId}`)
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const otherParticipants = Object.values(state)
          .flat()
          .filter((p: any) => p.user_id !== user.id)
          .map((p: any) => ({
            id: p.user_id,
            name: p.name || "Anonymous",
            isMuted: p.is_muted || false,
            isSpeaking: false,
          }));

        // Add remote participants to voice room
        otherParticipants.forEach((p) => {
          voiceRoomRef.current?.addRemoteParticipant(p.id, p.name);
        });
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        newPresences.forEach((p: any) => {
          if (p.user_id !== user.id) {
            voiceRoomRef.current?.addRemoteParticipant(p.user_id, p.name);
            toast({
              title: "User joined",
              description: `${p.name} joined the voice chat`,
            });
          }
        });
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        leftPresences.forEach((p: any) => {
          voiceRoomRef.current?.removeRemoteParticipant(p.user_id);
          toast({
            title: "User left",
            description: `${p.name} left the voice chat`,
          });
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            name: user.email?.split("@")[0] || "Anonymous",
            is_muted: isMuted,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isConnected, roomId, user, isMuted, toast]);

  const handleJoin = async () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to join voice chat",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      voiceRoomRef.current = new VoiceRoom(setParticipants, setIsSpeaking);
      await voiceRoomRef.current.joinRoom(
        user.id,
        user.email?.split("@")[0] || "Anonymous"
      );
      setIsConnected(true);
      toast({
        title: "Connected",
        description: "You've joined the voice chat",
      });
    } catch (error) {
      console.error("Failed to join voice room:", error);
      toast({
        title: "Connection failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLeave = () => {
    if (voiceRoomRef.current) {
      voiceRoomRef.current.leaveRoom();
      voiceRoomRef.current = null;
    }
    setIsConnected(false);
    setParticipants([]);
    onLeave?.();
    toast({
      title: "Disconnected",
      description: "You've left the voice chat",
    });
  };

  const handleToggleMute = () => {
    if (voiceRoomRef.current) {
      const newMutedState = voiceRoomRef.current.toggleMute();
      setIsMuted(newMutedState);
    }
  };

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-xl"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
            <Phone className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">{roomName}</h3>
            <p className="text-sm text-muted-foreground">
              Join the voice chat to communicate in real-time
            </p>
          </div>
          <Button
            onClick={handleJoin}
            disabled={isConnecting}
            className="w-full gap-2"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Join Voice Chat
              </>
            )}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 rounded-xl space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="font-medium text-sm">{roomName}</span>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Users className="w-3 h-3" />
          {participants.length}
        </Badge>
      </div>

      {/* Participants */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <AnimatePresence>
          {participants.map((participant) => (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`relative flex flex-col items-center p-3 rounded-lg border transition-all ${
                participant.isSpeaking
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "border-border bg-card/50"
              }`}
            >
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/20">
                    {participant.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {participant.isSpeaking && (
                  <motion.div
                    className="absolute -inset-1 rounded-full border-2 border-primary"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                )}
              </div>
              <span className="mt-2 text-xs font-medium truncate max-w-full">
                {participant.name}
              </span>
              {participant.isMuted && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                  <MicOff className="w-3 h-3 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 pt-2 border-t">
        <Button
          variant={isMuted ? "destructive" : "secondary"}
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={handleToggleMute}
        >
          {isMuted ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={handleLeave}
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>

      {/* Speaking indicator */}
      {isSpeaking && !isMuted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 text-xs text-primary"
        >
          <Volume2 className="w-4 h-4" />
          <span>You're speaking</span>
        </motion.div>
      )}
    </motion.div>
  );
};
