import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import {
  Swords,
  Users,
  Timer,
  Trophy,
  Eye,
  ThumbsUp,
  Loader2,
  Plus,
  Zap,
  Crown
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
import { useSkillDuel } from "@/hooks/useSkillDuel";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const SkillDuel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    duels,
    currentDuel,
    currentRound,
    spectators,
    votes,
    timeLeft,
    hasAnswered,
    loading,
    createDuel,
    acceptDuel,
    submitAnswer,
    joinAsSpectator,
    voteFor
  } = useSkillDuel();

  const [createOpen, setCreateOpen] = useState(false);
  const [stakePoints, setStakePoints] = useState("50");
  const [selectedDuel, setSelectedDuel] = useState<string | null>(null);
  const [answerStartTime, setAnswerStartTime] = useState<number>(0);

  const handleCreateDuel = async () => {
    const { error } = await createDuel({
      stake_points: parseInt(stakePoints) || 50,
      total_rounds: 5
    });

    if (error) {
      toast({ title: "Error", description: "Failed to create duel", variant: "destructive" });
    } else {
      toast({ title: "Challenge Created!", description: "Waiting for an opponent..." });
      setCreateOpen(false);
    }
  };

  const handleAcceptDuel = async (duelId: string) => {
    const { error } = await acceptDuel(duelId);
    if (error) {
      toast({ title: "Error", description: "Failed to accept duel", variant: "destructive" });
    } else {
      setSelectedDuel(duelId);
    }
  };

  const handleAnswer = async (optionId: string) => {
    if (!currentRound) return;
    const timeMs = Date.now() - answerStartTime;
    await submitAnswer(currentRound.id, optionId, timeMs);
  };

  const isParticipant = user && currentDuel && 
    (user.id === currentDuel.challenger_id || user.id === currentDuel.opponent_id);

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
                  <Swords className="w-8 h-8 text-red-500" />
                  Skill <span className="text-gradient">Duel</span>
                </h1>
                <p className="text-muted-foreground">
                  Challenge others to 1v1 knowledge battles
                </p>
              </div>
              {user && (
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-red-500 hover:bg-red-600">
                      <Swords className="w-4 h-4" />
                      Challenge
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a Duel Challenge</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Stake Points</Label>
                        <Input
                          type="number"
                          placeholder="50"
                          value={stakePoints}
                          onChange={(e) => setStakePoints(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Winner takes all! Both players bet this amount.
                        </p>
                      </div>
                      <Button onClick={handleCreateDuel} className="w-full bg-red-500 hover:bg-red-600">
                        Create Challenge
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

          {/* Active Duel View */}
          {selectedDuel && currentDuel ? (
            <div className="space-y-6">
              {/* Players Header */}
              <Card className="bg-gradient-to-r from-blue-500/10 via-transparent to-red-500/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Challenger */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="w-16 h-16 border-4 border-blue-500">
                          <AvatarImage src={currentDuel.challenger?.avatar_url || ""} />
                          <AvatarFallback>{currentDuel.challenger?.first_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {votes.challenger} votes
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-lg">
                          {currentDuel.challenger?.first_name} {currentDuel.challenger?.last_name}
                        </div>
                        <div className="text-2xl font-bold text-blue-500">
                          {currentDuel.challenger_score || 0}
                        </div>
                      </div>
                    </div>

                    {/* VS */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-muted-foreground">VS</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Round {(currentDuel.current_round || 0) + 1}/{currentDuel.total_rounds}
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Timer className="w-4 h-4" />
                        <span className="font-mono text-xl">{timeLeft}s</span>
                      </div>
                    </div>

                    {/* Opponent */}
                    <div className="flex items-center gap-4 flex-row-reverse">
                      <div className="relative">
                        <Avatar className="w-16 h-16 border-4 border-red-500">
                          <AvatarImage src={currentDuel.opponent?.avatar_url || ""} />
                          <AvatarFallback>{currentDuel.opponent?.first_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {votes.opponent} votes
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">
                          {currentDuel.opponent?.first_name} {currentDuel.opponent?.last_name}
                        </div>
                        <div className="text-2xl font-bold text-red-500">
                          {currentDuel.opponent_score || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Question Area */}
                <div className="lg:col-span-2">
                  {currentRound ? (
                    <Card>
                      <CardContent className="p-8">
                        <h2 className="text-2xl font-semibold mb-8 text-center">
                          {currentRound.question_text}
                        </h2>
                        {isParticipant ? (
                          <div className="grid md:grid-cols-2 gap-4">
                            {currentRound.options.map((option, idx) => (
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
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Eye className="w-12 h-12 mx-auto mb-4" />
                            <p>Spectating mode - Watch the battle unfold!</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                        <p>Waiting for the duel to start...</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Spectators & Voting */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Spectators ({spectators.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {spectators.slice(0, 5).map((spec) => (
                        <div key={spec.id} className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={spec.profile?.avatar_url || ""} />
                            <AvatarFallback>{spec.profile?.first_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate flex-1">
                            {spec.profile?.first_name}
                          </span>
                          {spec.vote_for && (
                            <ThumbsUp className="w-3 h-3 text-primary" />
                          )}
                        </div>
                      ))}
                      {spectators.length > 5 && (
                        <p className="text-sm text-muted-foreground">
                          +{spectators.length - 5} more watching
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {!isParticipant && user && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Cast Your Vote</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full justify-start border-blue-500/50 hover:bg-blue-500/10"
                          onClick={() => voteFor(currentDuel.challenger_id)}
                        >
                          <Avatar className="w-6 h-6 mr-2">
                            <AvatarImage src={currentDuel.challenger?.avatar_url || ""} />
                            <AvatarFallback>{currentDuel.challenger?.first_name?.[0]}</AvatarFallback>
                          </Avatar>
                          {currentDuel.challenger?.first_name}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start border-red-500/50 hover:bg-red-500/10"
                          onClick={() => currentDuel.opponent_id && voteFor(currentDuel.opponent_id)}
                        >
                          <Avatar className="w-6 h-6 mr-2">
                            <AvatarImage src={currentDuel.opponent?.avatar_url || ""} />
                            <AvatarFallback>{currentDuel.opponent?.first_name?.[0]}</AvatarFallback>
                          </Avatar>
                          {currentDuel.opponent?.first_name}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Duel List */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {duels.length === 0 && !loading && (
                <div className="col-span-full text-center py-20">
                  <Swords className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No active duels</h3>
                  <p className="text-muted-foreground mb-6">
                    Be the first to create a challenge!
                  </p>
                </div>
              )}
              
              <AnimatePresence>
                {duels.map((duel, idx) => (
                  <motion.div
                    key={duel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="hover:shadow-card transition-all hover:-translate-y-1">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge 
                            variant={duel.status === "active" ? "default" : "secondary"}
                            className={duel.status === "active" ? "bg-red-500" : ""}
                          >
                            {duel.status === "waiting" ? "⏳ Waiting" : 
                             duel.status === "active" ? "⚔️ Live" : duel.status}
                          </Badge>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Zap className="w-4 h-4" />
                            <span className="font-bold">{duel.stake_points}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-10 h-10 border-2 border-blue-500">
                              <AvatarImage src={duel.challenger?.avatar_url || ""} />
                              <AvatarFallback>{duel.challenger?.first_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                              <div className="font-medium">{duel.challenger?.first_name}</div>
                              <div className="text-muted-foreground">{duel.challenger?.total_points} pts</div>
                            </div>
                          </div>

                          <Swords className="w-6 h-6 text-muted-foreground" />

                          {duel.opponent ? (
                            <div className="flex items-center gap-2 flex-row-reverse">
                              <Avatar className="w-10 h-10 border-2 border-red-500">
                                <AvatarImage src={duel.opponent?.avatar_url || ""} />
                                <AvatarFallback>{duel.opponent?.first_name?.[0]}</AvatarFallback>
                              </Avatar>
                              <div className="text-sm text-right">
                                <div className="font-medium">{duel.opponent?.first_name}</div>
                                <div className="text-muted-foreground">{duel.opponent?.total_points} pts</div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
                              <span className="text-muted-foreground">?</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {duel.status === "waiting" && user && user.id !== duel.challenger_id && (
                            <Button 
                              className="flex-1 bg-red-500 hover:bg-red-600"
                              onClick={() => handleAcceptDuel(duel.id)}
                            >
                              Accept Challenge
                            </Button>
                          )}
                          {duel.status === "active" && (
                            <Button 
                              variant="secondary"
                              className="flex-1"
                              onClick={() => {
                                setSelectedDuel(duel.id);
                                if (user && user.id !== duel.challenger_id && user.id !== duel.opponent_id) {
                                  joinAsSpectator(duel.id);
                                }
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Watch
                            </Button>
                          )}
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

export default SkillDuel;
