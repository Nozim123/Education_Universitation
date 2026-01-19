import { useState, useEffect } from "react";
import { Search, User, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface UserSearchDialogProps {
  onStartConversation: (userId: string) => Promise<void>;
  children: React.ReactNode;
}

export const UserSearchDialog = ({ onStartConversation, children }: UserSearchDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !searchTerm.trim()) {
      setUsers([]);
      return;
    }

    const searchUsers = async () => {
      setLoading(true);
      try {
        const searchLower = searchTerm.toLowerCase();
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .neq("id", user?.id || "")
          .or(`first_name.ilike.%${searchLower}%,last_name.ilike.%${searchLower}%,email.ilike.%${searchLower}%`)
          .limit(20);

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, open, user?.id]);

  const handleStartConversation = async (userId: string) => {
    setStarting(userId);
    try {
      await onStartConversation(userId);
      setOpen(false);
      setSearchTerm("");
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setStarting(null);
    }
  };

  const getUserName = (profile: Profile) => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return profile.email?.split("@")[0] || "Unknown User";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-2">
                {users.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`} />
                        <AvatarFallback>{getUserName(profile)[0]}</AvatarFallback>
                      </Avatar>
                      {profile.is_online && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-card" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{getUserName(profile)}</p>
                      {profile.bio && (
                        <p className="text-sm text-muted-foreground truncate">{profile.bio}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStartConversation(profile.id)}
                      disabled={starting === profile.id}
                    >
                      {starting === profile.id ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Chat
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchTerm.trim() ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mb-2 opacity-50" />
                <p>No users found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mb-2 opacity-50" />
                <p>Search for students</p>
                <p className="text-sm">Type a name or email to find users</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
