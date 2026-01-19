import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  RotateCcw,
  Loader2,
  Volume2,
  CheckCircle,
  AlertCircle,
  Star,
  Clock,
  ChevronRight,
  Sparkles,
  Target,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSpeakingPractice, SpeakingPrompt } from "@/hooks/useSpeakingPractice";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const SpeakingPractice = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState("ielts");
  const [thinkingTime, setThinkingTime] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isRecording,
    isPaused,
    recordingTime,
    recordingSeconds,
    audioUrl,
    transcript,
    isTranscribing,
    isEvaluating,
    evaluation,
    currentPrompt,
    availablePrompts,
    startRecording,
    stopRecording,
    togglePause,
    evaluateResponse,
    getRandomPrompt,
    setCurrentPrompt,
    setTranscript,
    reset,
  } = useSpeakingPractice(selectedExam);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (thinkingTimerRef.current) {
        clearInterval(thinkingTimerRef.current);
      }
    };
  }, []);

  // Start thinking timer
  const startThinkingPhase = (prompt: SpeakingPrompt) => {
    if (prompt.thinkingTime) {
      setThinkingTime(prompt.thinkingTime);
      setIsThinking(true);
      
      thinkingTimerRef.current = setInterval(() => {
        setThinkingTime((prev) => {
          if (prev <= 1) {
            if (thinkingTimerRef.current) {
              clearInterval(thinkingTimerRef.current);
            }
            setIsThinking(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const skipThinking = () => {
    if (thinkingTimerRef.current) {
      clearInterval(thinkingTimerRef.current);
    }
    setThinkingTime(0);
    setIsThinking(false);
  };

  const handleSelectPrompt = (prompt: SpeakingPrompt) => {
    reset();
    setCurrentPrompt(prompt);
    startThinkingPhase(prompt);
  };

  const handleNewPrompt = () => {
    reset();
    const prompt = getRandomPrompt();
    if (prompt) {
      startThinkingPhase(prompt);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">Please sign in to practice speaking.</p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </Card>
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
            className="text-center mb-8"
          >
            <Badge className="mb-4" variant="secondary">
              <Mic className="w-3 h-3 mr-1" />
              Speaking Practice
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              Master Your <span className="text-gradient">Speaking</span> Skills
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Practice speaking with AI-powered feedback and band score estimation
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Prompts */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Speaking Prompts</span>
                    <Select value={selectedExam} onValueChange={setSelectedExam}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ielts">IELTS</SelectItem>
                        <SelectItem value="toefl">TOEFL</SelectItem>
                        <SelectItem value="cefr">CEFR</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {availablePrompts.map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => handleSelectPrompt(prompt)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        currentPrompt?.id === prompt.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {prompt.partType.replace(/(\d)/, " $1")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {Math.floor(prompt.duration / 60)}:{(prompt.duration % 60).toString().padStart(2, "0")}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2">{prompt.prompt}</p>
                    </button>
                  ))}
                  
                  <Button variant="outline" className="w-full" onClick={handleNewPrompt}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Random Prompt
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Center: Recording Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Prompt */}
              <AnimatePresence mode="wait">
                {currentPrompt && (
                  <motion.div
                    key={currentPrompt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge className="capitalize">
                            {currentPrompt.partType.replace(/(\d)/, " $1")}
                          </Badge>
                          {isThinking && (
                            <Badge variant="secondary" className="animate-pulse">
                              <Clock className="w-3 h-3 mr-1" />
                              Thinking: {thinkingTime}s
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg whitespace-pre-wrap mt-4">
                          {currentPrompt.prompt}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isThinking ? (
                          <div className="text-center py-4">
                            <p className="text-muted-foreground mb-4">
                              Use this time to prepare your response
                            </p>
                            <Progress value={(1 - thinkingTime / (currentPrompt.thinkingTime || 60)) * 100} className="mb-4" />
                            <Button variant="outline" onClick={skipThinking}>
                              <ChevronRight className="w-4 h-4 mr-2" />
                              Skip to Recording
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Duration: {Math.floor(currentPrompt.duration / 60)}:{(currentPrompt.duration % 60).toString().padStart(2, "0")}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Recording Time: {recordingTime}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recording Controls */}
              {!isThinking && currentPrompt && (
                <Card>
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center">
                      {/* Waveform Visualization (simplified) */}
                      <div className="w-full h-24 bg-muted/30 rounded-lg mb-6 flex items-center justify-center overflow-hidden">
                        {isRecording ? (
                          <div className="flex items-center gap-1">
                            {[...Array(20)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-1 bg-primary rounded-full"
                                animate={{
                                  height: [10, Math.random() * 60 + 20, 10],
                                }}
                                transition={{
                                  duration: 0.5,
                                  repeat: Infinity,
                                  delay: i * 0.05,
                                }}
                              />
                            ))}
                          </div>
                        ) : audioUrl ? (
                          <audio controls src={audioUrl} className="w-full max-w-sm" />
                        ) : (
                          <span className="text-muted-foreground">
                            Click record to start
                          </span>
                        )}
                      </div>

                      {/* Recording Timer */}
                      <div className="text-4xl font-mono font-bold mb-6">
                        {recordingTime}
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-4">
                        {!isRecording ? (
                          <Button
                            size="lg"
                            className="w-16 h-16 rounded-full"
                            onClick={startRecording}
                            disabled={isThinking}
                          >
                            <Mic className="w-6 h-6" />
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="lg"
                              className="w-14 h-14 rounded-full"
                              onClick={togglePause}
                            >
                              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                            </Button>
                            <Button
                              size="lg"
                              variant="destructive"
                              className="w-16 h-16 rounded-full"
                              onClick={stopRecording}
                            >
                              <Square className="w-6 h-6" />
                            </Button>
                          </>
                        )}

                        {audioUrl && !isRecording && (
                          <Button variant="outline" size="lg" className="w-14 h-14 rounded-full" onClick={reset}>
                            <RotateCcw className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Transcript & Evaluation */}
              {audioUrl && !isRecording && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Response</CardTitle>
                    <CardDescription>
                      Type or edit your transcript for evaluation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder="Type your spoken response here for AI evaluation..."
                      className="min-h-[120px]"
                    />
                    
                    <Button 
                      onClick={evaluateResponse} 
                      disabled={isEvaluating || !transcript.trim()}
                      className="w-full"
                    >
                      {isEvaluating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Get AI Evaluation
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Evaluation Results */}
              <AnimatePresence>
                {evaluation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card className="border-green-500/30">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            Evaluation Results
                          </CardTitle>
                          <Badge className="text-lg px-4 py-1">
                            {typeof evaluation.overall_score === "number" 
                              ? `Band ${evaluation.overall_score}`
                              : evaluation.overall_score
                            }
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="scores">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="scores">Scores</TabsTrigger>
                            <TabsTrigger value="feedback">Feedback</TabsTrigger>
                            <TabsTrigger value="improve">Improve</TabsTrigger>
                          </TabsList>

                          <TabsContent value="scores" className="mt-4 space-y-4">
                            {Object.entries(evaluation.criteria_scores || {}).map(([criterion, data]) => (
                              <div key={criterion}>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium capitalize">
                                    {criterion.replace(/_/g, " ")}
                                  </span>
                                  <span className="text-sm font-bold">{data.score}</span>
                                </div>
                                <Progress value={(data.score / 9) * 100} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">{data.feedback}</p>
                              </div>
                            ))}
                          </TabsContent>

                          <TabsContent value="feedback" className="mt-4 space-y-4">
                            <div>
                              <h4 className="font-semibold flex items-center gap-2 text-green-600 mb-2">
                                <Star className="w-4 h-4" />
                                Strengths
                              </h4>
                              <ul className="space-y-1">
                                {evaluation.strengths?.map((s, i) => (
                                  <li key={i} className="text-sm flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold flex items-center gap-2 text-amber-600 mb-2">
                                <Target className="w-4 h-4" />
                                Areas to Improve
                              </h4>
                              <ul className="space-y-1">
                                {evaluation.improvements?.map((s, i) => (
                                  <li key={i} className="text-sm flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </TabsContent>

                          <TabsContent value="improve" className="mt-4 space-y-4">
                            {evaluation.sample_corrections?.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">Sample Corrections</h4>
                                {evaluation.sample_corrections.map((correction, i) => (
                                  <div key={i} className="p-3 bg-muted/50 rounded-lg text-sm mb-2">
                                    {correction}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="p-4 bg-primary/5 rounded-lg">
                              <p className="text-sm">{evaluation.detailed_feedback}</p>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <TrendingUp className="w-4 h-4" />
                              <span>Estimated time to improve: {evaluation.estimated_time_to_improve}</span>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SpeakingPractice;
