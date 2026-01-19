import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import {
  Trophy,
  Users,
  Timer,
  Zap,
  Play,
  Crown,
  Medal,
  Target,
  Loader2,
  Plus,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { Label } from "@/components/ui/label";
import { useLiveArena } from "@/hooks/useLiveArena";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const LiveArena = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    sessions,
    currentSession,
    currentQuestion,
    leaderboard,
    participants,
    timeLeft,
    hasAnswered,
    loading,
    joinSession,
    submitAnswer,
    createSession,
    generateQuestions
  } = useLiveArena();

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [answerStartTime, setAnswerStartTime] = useState<number>(0);

  const handleCreateSession = async () => {
    if (!newTitle.trim()) return;

    setIsGenerating(true);
    try {
      const { error } = await createSession({
        title: newTitle,
        total_questions: questionCount,
        question_time_seconds: 30,
        generateAI: true,
        category: category || newTitle,
        difficulty
      });

      if (error) {
        toast({ title: "Error", description: "Failed to create session", variant: "destructive" });
      } else {
        toast({ title: "Success!", description: "Arena created with AI-generated questions!" });
        setCreateOpen(false);
        setNewTitle("");
        setCategory("");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    const { error } = await joinSession(sessionId);
    if (error) {
      toast({ title: "Error", description: "Failed to join session", variant: "destructive" });
    } else {
      setSelectedSession(sessionId);
    }
  };

  const handleAnswer = async (optionId: string) => {
    if (!currentQuestion) return;
    const timeMs = Date.now() - answerStartTime;
    await submitAnswer(currentQuestion.id, optionId, timeMs);
  };

  // When question changes, reset timer start
  if (currentQuestion && answerStartTime === 0) {
    setAnswerStartTime(Date.now());
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 flex items-center gap-3">
                  <Zap className="w-8 h-8 text-yellow-500" />
                  Live <span className="text-gradient">Arena</span>
                </h1>
                <p className="text-muted-foreground">
                  Compete in real-time quiz battles with students worldwide
                </p>
              </div>
              {user && (
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Arena
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Arena Session</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Session Title *</Label>
                        <Input
                          placeholder="e.g., Science Quiz Battle"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category/Topic</Label>
                        <Input
                          placeholder="e.g., Physics, History, Programming"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Difficulty</Label>
                          <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border bg-background"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Questions</Label>
                          <Input
                            type="number"
                            min={5}
                            max={20}
                            value={questionCount}
                            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <Sparkles className="w-4 h-4" />
                          <span>AI will generate quiz questions automatically!</span>
                        </div>
                      </div>
                      <Button 
                        onClick={handleCreateSession} 
                        className="w-full gap-2"
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating Questions...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Create with AI Questions
                          </>
                        )}
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

          {/* Active Game View */}
          {selectedSession && currentSession ? (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Game Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Timer & Progress */}
                <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <Timer className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{timeLeft}s</div>
                          <div className="text-sm text-muted-foreground">Time Left</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          Question {(currentSession.current_question || 0) + 1}/{currentSession.total_questions}
                        </div>
                        <Badge variant="secondary">
                          <Users className="w-3 h-3 mr-1" />
                          {participants.length} Players
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={(timeLeft / (currentSession.question_time_seconds || 30)) * 100} 
                      className="h-3"
                    />
                  </CardContent>
                </Card>

                {/* Question Card */}
                {currentQuestion ? (
                  <Card>
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-semibold mb-8 text-center">
                        {currentQuestion.question_text}
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, idx) => (
                          <motion.button
                            key={option.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => handleAnswer(option.id)}
                            disabled={hasAnswered}
                            className={`p-6 rounded-xl border-2 text-left transition-all hover:border-primary hover:shadow-lg ${
                              hasAnswered ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                {String.fromCharCode(65 + idx)}
                              </div>
                              <span className="text-lg">{option.text}</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                      {hasAnswered && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-6 text-center text-muted-foreground"
                        >
                          Waiting for other players...
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                      <p>Waiting for the game to start...</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Leaderboard */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Live Leaderboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {leaderboard.map((player, idx) => (
                        <motion.div
                          key={player.user_id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            idx === 0 ? "bg-yellow-500/10 border border-yellow-500/30" :
                            idx === 1 ? "bg-gray-400/10 border border-gray-400/30" :
                            idx === 2 ? "bg-amber-600/10 border border-amber-600/30" :
                            "bg-muted/50"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold">
                            {idx === 0 ? <Crown className="w-5 h-5 text-yellow-500" /> :
                             idx === 1 ? <Medal className="w-5 h-5 text-gray-400" /> :
                             idx === 2 ? <Medal className="w-5 h-5 text-amber-600" /> :
                             <span className="text-muted-foreground">{idx + 1}</span>}
                          </div>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={player.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.user_id}`} />
                            <AvatarFallback>{player.profile?.first_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {player.profile?.first_name} {player.profile?.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              🔥 {player.current_streak || 0} streak
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{player.score}</div>
                            <div className="text-xs text-muted-foreground">pts</div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* Session List */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.length === 0 && !loading && (
                <div className="col-span-full text-center py-20">
                  <Trophy className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No active arenas</h3>
                  <p className="text-muted-foreground mb-6">
                    Be the first to create an arena session!
                  </p>
                </div>
              )}
              
              <AnimatePresence>
                {sessions.map((session, idx) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="hover:shadow-card transition-all hover:-translate-y-1 cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Target className="w-6 h-6 text-white" />
                          </div>
                          <Badge 
                            variant={session.status === "active" ? "default" : "secondary"}
                            className={session.status === "active" ? "bg-green-500" : ""}
                          >
                            {session.status === "waiting" ? "Waiting" : 
                             session.status === "active" ? "🔴 Live" : session.status}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                          {session.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {session.description || "Join this quiz battle and compete!"}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {session.max_participants || 100} max
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              {session.total_questions} Q's
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleJoinSession(session.id)}
                            className="gap-1"
                          >
                            <Play className="w-3 h-3" />
                            Join
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LiveArena;
