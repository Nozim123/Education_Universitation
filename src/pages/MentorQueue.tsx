import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import {
  HelpCircle,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  Loader2,
  Plus,
  Phone,
  Mic
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMentorQueue } from "@/hooks/useMentorQueue";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { VoiceChat } from "@/components/voice/VoiceChat";

const MentorQueue = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    queue,
    myRequest,
    myMentoringRequests,
    loading,
    requestHelp,
    cancelRequest,
    acceptRequest,
    startSession,
    completeSession
  } = useMentorQueue();

  const [createOpen, setCreateOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [activeVoiceSession, setActiveVoiceSession] = useState<string | null>(null);

  const handleRequestHelp = async () => {
    if (!topic.trim()) return;

    const { error } = await requestHelp({
      topic,
      description
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "Your help request has been added to the queue" });
      setCreateOpen(false);
      setTopic("");
      setDescription("");
    }
  };

  const handleCancelRequest = async () => {
    if (!myRequest) return;
    await cancelRequest(myRequest.id);
    toast({ title: "Request cancelled" });
  };

  const handleAcceptRequest = async (requestId: string) => {
    const { error } = await acceptRequest(requestId);
    if (error) {
      toast({ title: "Error", description: "Failed to accept request", variant: "destructive" });
    } else {
      toast({ title: "Request accepted!", description: "You can now start helping" });
    }
  };

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 flex items-center gap-3">
                  <HelpCircle className="w-8 h-8 text-blue-500" />
                  Mentor <span className="text-gradient">Queue</span>
                </h1>
                <p className="text-muted-foreground">
                  Get real-time help from mentors or help others
                </p>
              </div>
              {user && !myRequest && (
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Request Help
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Help from a Mentor</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Topic *</Label>
                        <Input
                          placeholder="e.g., Need help with calculus"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Describe what you need help with..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <Button onClick={handleRequestHelp} className="w-full">
                        Join Queue
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </motion.div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* My Request Status */}
            {myRequest && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="lg:col-span-3"
              >
                <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl font-bold text-blue-500">
                          #{myRequest.queue_position || "?"}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">Your Position in Queue</h3>
                          <p className="text-muted-foreground">
                            {myRequest.topic}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              ~{myRequest.estimated_wait_minutes || 5} min wait
                            </span>
                            <Badge variant="secondary">{myRequest.status}</Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="destructive" onClick={handleCancelRequest}>
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Mentoring Requests (for mentors) */}
            {myMentoringRequests.length > 0 && (
              <div className="lg:col-span-3">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-500" />
                  Your Active Sessions
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {myMentoringRequests.map((req) => (
                    <Card key={req.id} className="border-green-500/30 bg-green-500/5">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar>
                            <AvatarImage src={req.student?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.student_id}`} />
                            <AvatarFallback>{req.student?.first_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">
                              {req.student?.first_name} {req.student?.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">{req.topic}</div>
                          </div>
                          <Badge variant={req.status === "in_progress" ? "default" : "secondary"}>
                            {req.status}
                          </Badge>
                        </div>
                        
                        {/* Voice Chat for active sessions */}
                        {req.status === "in_progress" && (
                          <div className="mb-3">
                            <VoiceChat 
                              roomId={req.id} 
                              roomName={`Session: ${req.topic}`}
                              onLeave={() => setActiveVoiceSession(null)}
                            />
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          {req.status === "accepted" && (
                            <Button size="sm" onClick={() => startSession(req.id)} className="flex-1 gap-2">
                              <Mic className="w-4 h-4" />
                              Start Voice Session
                            </Button>
                          )}
                          {req.status === "in_progress" && (
                            <Button size="sm" onClick={() => completeSession(req.id)} className="flex-1">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Queue List */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Current Queue ({queue.filter(r => r.status === "waiting").length} waiting)
              </h2>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {queue.filter(r => r.status === "waiting").map((request, idx) => (
                    <motion.div
                      key={request.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                              {request.queue_position}
                            </div>
                            <Avatar>
                              <AvatarImage src={request.student?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.student_id}`} />
                              <AvatarFallback>{request.student?.first_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">
                                {request.student?.first_name} {request.student?.last_name}
                              </div>
                              <div className="text-sm font-medium text-primary truncate">
                                {request.topic}
                              </div>
                              {request.description && (
                                <div className="text-sm text-muted-foreground truncate">
                                  {request.description}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">
                                {request.created_at && formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                              </div>
                              {user && user.id !== request.student_id && (
                                <Button 
                                  size="sm" 
                                  variant="secondary"
                                  onClick={() => handleAcceptRequest(request.id)}
                                  className="mt-2"
                                >
                                  Help
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {queue.filter(r => r.status === "waiting").length === 0 && !loading && (
                  <div className="text-center py-12 text-muted-foreground">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No one is waiting for help right now</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Queue Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Waiting</span>
                    <span className="font-bold">{queue.filter(r => r.status === "waiting").length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">In Progress</span>
                    <span className="font-bold text-green-500">{queue.filter(r => r.status === "in_progress").length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Avg Wait Time</span>
                    <span className="font-bold">~5 min</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                <CardContent className="p-6 text-center">
                  <MessageCircle className="w-10 h-10 mx-auto mb-3 text-green-500" />
                  <h3 className="font-semibold mb-2">Become a Mentor</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Help others and earn points!
                  </p>
                  <Button variant="secondary" className="w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MentorQueue;
