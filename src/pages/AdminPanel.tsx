import { useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import {
  Users,
  Activity,
  Trophy,
  Swords,
  HelpCircle,
  Video,
  FileText,
  Bell,
  Shield,
  AlertTriangle,
  Send,
  Loader2,
  Eye,
  Clock,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const AdminPanel = () => {
  const { toast } = useToast();
  const {
    onlineUsers,
    stats,
    activityLogs,
    loading,
    isAdmin,
    sendWarning,
    broadcastMessage
  } = useAdminDashboard();

  const [broadcastText, setBroadcastText] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [warningText, setWarningText] = useState("");

  const handleBroadcast = async () => {
    if (!broadcastText.trim()) return;
    await broadcastMessage(broadcastText, "announcement");
    toast({ title: "Broadcast sent!", description: `Sent to ${stats.onlineUsers} online users` });
    setBroadcastText("");
  };

  const handleSendWarning = async () => {
    if (!selectedUser || !warningText.trim()) return;
    await sendWarning(selectedUser, warningText);
    toast({ title: "Warning sent" });
    setWarningText("");
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Shield className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Admin <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">
              Real-time monitoring and moderation controls
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.onlineUsers}</div>
                    <div className="text-sm text-muted-foreground">Online Now</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.activeArenas}</div>
                    <div className="text-sm text-muted-foreground">Active Arenas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <Swords className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.activeDuels}</div>
                    <div className="text-sm text-muted-foreground">Active Duels</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.queuedRequests}</div>
                    <div className="text-sm text-muted-foreground">Queue Requests</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Secondary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-xl font-bold">{stats.totalUsers}</div>
                  <div className="text-xs text-muted-foreground">Total Users</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-xl font-bold">+{stats.todayNewUsers}</div>
                  <div className="text-xs text-muted-foreground">Today</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Video className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-xl font-bold">{stats.totalVideos}</div>
                  <div className="text-xs text-muted-foreground">Videos</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-xl font-bold">{stats.totalArticles}</div>
                  <div className="text-xs text-muted-foreground">Articles</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Online Users */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-green-500" />
                    Online Users ({onlineUsers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {onlineUsers.map((presence) => (
                        <div
                          key={presence.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedUser === presence.user_id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedUser(
                            selectedUser === presence.user_id ? null : presence.user_id
                          )}
                        >
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={presence.profile?.avatar_url || ""} />
                              <AvatarFallback>{presence.profile?.first_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {presence.profile?.first_name} {presence.profile?.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {presence.profile?.email}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="mb-1">
                              {presence.current_page || "Home"}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {presence.last_seen && formatDistanceToNow(new Date(presence.last_seen), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      ))}

                      {onlineUsers.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p>No users online</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {selectedUser && (
                    <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                      <h4 className="font-medium mb-3">Quick Actions</h4>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Warning message..."
                          value={warningText}
                          onChange={(e) => setWarningText(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleSendWarning}
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Warn
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Broadcast */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Broadcast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Input
                      placeholder="Message to all online users..."
                      value={broadcastText}
                      onChange={(e) => setBroadcastText(e.target.value)}
                    />
                    <Button onClick={handleBroadcast} className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Send to {stats.onlineUsers} Users
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Log */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Activity Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {activityLogs.slice(0, 10).map((log) => (
                        <div key={log.id} className="text-sm border-b pb-2">
                          <div className="font-medium">{log.action}</div>
                          {log.target_type && (
                            <div className="text-muted-foreground">
                              {log.target_type}: {log.target_id?.slice(0, 8)}...
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {log.created_at && formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      ))}

                      {activityLogs.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No activity yet</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPanel;
