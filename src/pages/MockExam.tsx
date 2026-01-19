import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import {
  Play,
  Pause,
  SkipForward,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Target,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Calculator,
  ArrowLeft,
  ArrowRight,
  Loader2,
  RefreshCw,
  BarChart3,
  Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMockExam } from "@/hooks/useMockExam";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const sectionIcons: Record<string, any> = {
  listening: Headphones,
  reading: BookOpen,
  writing: PenTool,
  speaking: Mic,
  math: Calculator,
};

const MockExam = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedExamType, setSelectedExamType] = useState("ielts");
  const [difficulty, setDifficulty] = useState("intermediate");
  
  const {
    generating,
    sections,
    examState,
    results,
    currentQuestion,
    currentSectionConfig,
    timeRemaining,
    sectionProgress,
    overallProgress,
    answeredCount,
    generateExam,
    startExam,
    continueToNextSection,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    submitAnswer,
    finishSection,
    resetExam,
  } = useMockExam(selectedExamType);

  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">Please sign in to take mock exams.</p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  // Results view
  if (examState.status === "completed" && results) {
    const percentage = results.maxScore > 0 ? (results.score / results.maxScore) * 100 : 0;
    
    return (
      <Layout>
        <div className="min-h-screen bg-background py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center mb-6">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              
              <h1 className="text-4xl font-bold mb-2">Exam Complete!</h1>
              <p className="text-muted-foreground mb-8">
                Here's how you performed
              </p>

              {/* Score Card */}
              <Card className="mb-8 bg-gradient-to-br from-primary/10 to-accent/10">
                <CardContent className="p-8">
                  <div className="text-6xl font-bold mb-2">
                    {results.bandScore 
                      ? `Band ${results.bandScore}`
                      : results.cefrLevel
                      ? results.cefrLevel
                      : `${Math.round(percentage)}%`
                    }
                  </div>
                  <div className="text-lg text-muted-foreground">
                    {results.score} / {results.maxScore} points
                  </div>
                </CardContent>
              </Card>

              {/* Section Breakdown */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Section Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {Object.entries(results.sectionScores).map(([section, data]) => {
                      const Icon = sectionIcons[section.toLowerCase()] || BookOpen;
                      const sectionPercentage = data.max > 0 ? (data.score / data.max) * 100 : 0;
                      
                      return (
                        <div key={section} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium capitalize">{section}</span>
                              <span className="text-muted-foreground">
                                {data.score}/{data.max}
                              </span>
                            </div>
                            <Progress value={sectionPercentage} className="h-2" />
                          </div>
                          <Badge variant={sectionPercentage >= 70 ? "default" : sectionPercentage >= 50 ? "secondary" : "destructive"}>
                            {Math.round(sectionPercentage)}%
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={resetExam}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Take Another Exam
                </Button>
                <Button onClick={() => navigate("/exam-prep")}>
                  <Target className="w-4 h-4 mr-2" />
                  Back to Exam Prep
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  // Section break view
  if (examState.status === "section_break") {
    const nextSectionConfig = sections[examState.currentSection];
    const NextIcon = nextSectionConfig ? sectionIcons[nextSectionConfig.name.toLowerCase()] || BookOpen : BookOpen;

    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Section Complete!</h2>
            <p className="text-muted-foreground mb-6">
              Take a short break before the next section.
            </p>
            
            {nextSectionConfig && (
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <NextIcon className="w-5 h-5" />
                  <span className="font-semibold capitalize">{nextSectionConfig.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {nextSectionConfig.questions.length} questions • 
                  {Math.floor(nextSectionConfig.duration / 60)} minutes
                </p>
              </div>
            )}

            <Button onClick={continueToNextSection} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              Start Next Section
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  // Exam in progress
  if (examState.status === "in_progress" && currentQuestion) {
    const SectionIcon = currentSectionConfig ? sectionIcons[currentSectionConfig.name.toLowerCase()] || BookOpen : BookOpen;
    const currentQuestionIndex = examState.currentQuestion;
    const totalQuestions = currentSectionConfig?.questions.length || 0;
    const isCurrentFlagged = flaggedQuestions.has(currentQuestion.id);
    const userAnswer = examState.answers[currentQuestion.id] || "";

    return (
      <Layout>
        <div className="min-h-screen bg-background">
          {/* Top Bar */}
          <div className="sticky top-0 z-50 bg-background border-b">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Section Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <SectionIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold capitalize">{currentSectionConfig?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                    </p>
                  </div>
                </div>

                {/* Timer */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  examState.timeRemaining < 300 ? "bg-red-500/10 text-red-500" : "bg-muted"
                }`}>
                  <Clock className="w-5 h-5" />
                  <span className="text-xl font-mono font-bold">{timeRemaining}</span>
                </div>

                {/* Progress */}
                <div className="hidden md:flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Answered: {answeredCount}/{sections.reduce((acc, s) => acc + s.questions.length, 0)}
                  </div>
                  <Button variant="outline" size="sm" onClick={finishSection}>
                    <SkipForward className="w-4 h-4 mr-2" />
                    End Section
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <Progress value={sectionProgress} className="h-1" />
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2">
                          {currentQuestion.points} points
                        </Badge>
                        {currentQuestion.passage && (
                          <div className="mb-4 p-4 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap">
                            {currentQuestion.passage}
                          </div>
                        )}
                        <CardTitle className="text-lg leading-relaxed">
                          {currentQuestion.question_text}
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFlag(currentQuestion.id)}
                        className={isCurrentFlagged ? "text-yellow-500" : ""}
                      >
                        <Flag className="w-5 h-5" fill={isCurrentFlagged ? "currentColor" : "none"} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Multiple Choice */}
                    {currentQuestion.question_type === "multiple_choice" && currentQuestion.options && (
                      <RadioGroup
                        value={userAnswer}
                        onValueChange={(value) => submitAnswer(currentQuestion.id, value)}
                      >
                        <div className="space-y-3">
                          {currentQuestion.options.map((option) => (
                            <div
                              key={option.id}
                              className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                                userAnswer === option.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                              }`}
                              onClick={() => submitAnswer(currentQuestion.id, option.id)}
                            >
                              <RadioGroupItem value={option.id} id={option.id} />
                              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                                <span className="font-medium mr-2">{option.id.toUpperCase()}.</span>
                                {option.text}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    )}

                    {/* True/False */}
                    {currentQuestion.question_type === "true_false" && (
                      <RadioGroup
                        value={userAnswer}
                        onValueChange={(value) => submitAnswer(currentQuestion.id, value)}
                      >
                        <div className="flex gap-4">
                          {["true", "false", "not_given"].map((option) => (
                            <div
                              key={option}
                              className={`flex-1 flex items-center justify-center p-4 rounded-lg border cursor-pointer transition-colors ${
                                userAnswer === option ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                              }`}
                              onClick={() => submitAnswer(currentQuestion.id, option)}
                            >
                              <RadioGroupItem value={option} id={option} className="mr-2" />
                              <Label htmlFor={option} className="cursor-pointer capitalize">
                                {option.replace("_", " ")}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    )}

                    {/* Fill in the blank */}
                    {currentQuestion.question_type === "fill_blank" && (
                      <Input
                        value={userAnswer}
                        onChange={(e) => submitAnswer(currentQuestion.id, e.target.value)}
                        placeholder="Type your answer..."
                        className="text-lg"
                      />
                    )}

                    {/* Essay/Speaking */}
                    {(currentQuestion.question_type === "essay" || currentQuestion.question_type === "speaking") && (
                      <Textarea
                        value={userAnswer}
                        onChange={(e) => submitAnswer(currentQuestion.id, e.target.value)}
                        placeholder={currentQuestion.question_type === "speaking" 
                          ? "Type your spoken response here..." 
                          : "Write your essay here..."
                        }
                        className="min-h-[200px]"
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {/* Question Navigator */}
                  <div className="hidden md:flex gap-1 flex-wrap justify-center max-w-md">
                    {currentSectionConfig?.questions.slice(0, 10).map((q, idx) => (
                      <button
                        key={q.id}
                        onClick={() => goToQuestion(idx)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                          idx === currentQuestionIndex
                            ? "bg-primary text-primary-foreground"
                            : examState.answers[q.id]
                            ? "bg-green-500/20 text-green-700"
                            : flaggedQuestions.has(q.id)
                            ? "bg-yellow-500/20 text-yellow-700"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    {(currentSectionConfig?.questions.length || 0) > 10 && (
                      <span className="text-muted-foreground text-sm self-center">...</span>
                    )}
                  </div>

                  <Button
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Layout>
    );
  }

  // Exam setup / not started
  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center mb-4">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Mock Exam</h1>
              <p className="text-muted-foreground">
                Simulate real test conditions with timed sections
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Exam Setup</CardTitle>
                <CardDescription>
                  Configure your mock exam settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Exam Type */}
                <div className="space-y-2">
                  <Label>Exam Type</Label>
                  <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ielts">IELTS</SelectItem>
                      <SelectItem value="sat">SAT</SelectItem>
                      <SelectItem value="toefl">TOEFL</SelectItem>
                      <SelectItem value="cefr">CEFR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sections Preview */}
                {sections.length > 0 && (
                  <div className="space-y-2">
                    <Label>Sections</Label>
                    <div className="grid gap-2">
                      {sections.map((section, idx) => {
                        const Icon = sectionIcons[section.name.toLowerCase()] || BookOpen;
                        return (
                          <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Icon className="w-4 h-4" />
                              <span className="capitalize">{section.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {section.questions.length} questions • {Math.floor(section.duration / 60)} min
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  {sections.length === 0 ? (
                    <Button 
                      className="w-full" 
                      onClick={() => generateExam(difficulty)}
                      disabled={generating}
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Exam...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Generate Exam
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => generateExam(difficulty)}
                        disabled={generating}
                        className="flex-1"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                      <Button className="flex-1" onClick={startExam}>
                        <Play className="w-4 h-4 mr-2" />
                        Start Exam
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default MockExam;
