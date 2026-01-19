import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Calculator,
  Trophy,
  Target,
  Clock,
  ChevronRight,
  Play,
  BarChart3,
  CheckCircle2,
  Star,
  Zap,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExamPrep } from "@/hooks/useExamPrep";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const examTypes = [
  {
    id: "ielts",
    name: "IELTS",
    description: "International English Language Testing System",
    icon: "🇬🇧",
    color: "from-red-500 to-rose-600",
    sections: ["Listening", "Reading", "Writing", "Speaking"]
  },
  {
    id: "sat",
    name: "SAT",
    description: "Scholastic Assessment Test",
    icon: "🇺🇸",
    color: "from-blue-500 to-indigo-600",
    sections: ["Math", "Reading", "Writing"]
  },
  {
    id: "cefr",
    name: "CEFR",
    description: "Common European Framework of Reference",
    icon: "🇪🇺",
    color: "from-yellow-500 to-amber-600",
    sections: ["A1", "A2", "B1", "B2", "C1", "C2"]
  },
  {
    id: "toefl",
    name: "TOEFL",
    description: "Test of English as a Foreign Language",
    icon: "🌐",
    color: "from-green-500 to-emerald-600",
    sections: ["Reading", "Listening", "Speaking", "Writing"]
  }
];

const sectionIcons: Record<string, any> = {
  listening: Headphones,
  reading: BookOpen,
  writing: PenTool,
  speaking: Mic,
  math: Calculator,
  grammar: BookOpen,
  full: Trophy
};

const ExamPrep = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const { tests, progress, recentAttempts, loading, startTest } = useExamPrep(selectedExam || undefined);

  const handleStartTest = async (testId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const { data, error } = await startTest(testId);
    if (!error && data) {
      // Navigate to test page (would need to implement test taking UI)
      console.log("Starting test:", data.id);
    }
  };

  const groupedTests = tests.reduce((acc, test) => {
    const section = test.section;
    if (!acc[section]) acc[section] = [];
    acc[section].push(test);
    return acc;
  }, {} as Record<string, typeof tests>);

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="secondary">
              <GraduationCap className="w-3 h-3 mr-1" />
              Exam Preparation Hub
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Master Your <span className="text-gradient">Exams</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Prepare for IELTS, SAT, CEFR, TOEFL and more with AI-powered practice tests, 
              real-time feedback, and mock exams.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {!selectedExam ? (
              /* Exam Selection Grid */
              <motion.div
                key="exam-selection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
              >
                {examTypes.map((exam, idx) => (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card 
                      className="cursor-pointer hover:shadow-card transition-all hover:-translate-y-2 h-full group"
                      onClick={() => setSelectedExam(exam.id)}
                    >
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${exam.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                          {exam.icon}
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{exam.name}</h3>
                        <p className="text-muted-foreground text-sm mb-4 flex-grow">
                          {exam.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {exam.sections.slice(0, 3).map(section => (
                            <Badge key={section} variant="outline" className="text-xs">
                              {section}
                            </Badge>
                          ))}
                          {exam.sections.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{exam.sections.length - 3}
                            </Badge>
                          )}
                        </div>
                        <Button className="w-full group-hover:bg-primary/90">
                          Start Preparing
                          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              /* Exam Detail View */
              <motion.div
                key="exam-detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Button 
                  variant="ghost" 
                  className="mb-6"
                  onClick={() => setSelectedExam(null)}
                >
                  ← Back to Exams
                </Button>

                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Left Column - Progress & Stats */}
                  <div className="space-y-6">
                    {/* Progress Card */}
                    <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-primary" />
                          Your Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {progress ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Current Level</span>
                              <span className="text-2xl font-bold text-primary">
                                {progress.current_band?.toFixed(1) || "Not Set"}
                              </span>
                            </div>
                            <Progress 
                              value={((progress.current_band || 0) / 9) * 100} 
                              className="h-3"
                            />
                            <div className="grid grid-cols-2 gap-4 pt-4">
                              <div className="text-center p-3 rounded-lg bg-background/50">
                                <div className="text-2xl font-bold">{progress.tests_completed || 0}</div>
                                <div className="text-xs text-muted-foreground">Tests Completed</div>
                              </div>
                              <div className="text-center p-3 rounded-lg bg-background/50">
                                <div className="text-2xl font-bold">{progress.total_study_minutes || 0}m</div>
                                <div className="text-xs text-muted-foreground">Study Time</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <Star className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                            <p className="text-muted-foreground mb-4">Take a level test to start tracking</p>
                            <Button size="sm">
                              <Play className="w-4 h-4 mr-2" />
                              Take Level Test
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Recent Attempts */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {recentAttempts.length > 0 ? (
                          <div className="space-y-3">
                            {recentAttempts.slice(0, 5).map((attempt) => (
                              <div key={attempt.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                <CheckCircle2 className={`w-5 h-5 ${attempt.status === 'completed' ? 'text-success' : 'text-muted-foreground'}`} />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">
                                    {attempt.test?.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {attempt.score}/{attempt.max_score} points
                                  </div>
                                </div>
                                {attempt.band_score && (
                                  <Badge variant="secondary">{attempt.band_score}</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm text-center py-4">
                            No attempts yet. Start practicing!
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column - Tests */}
                  <div className="lg:col-span-2">
                    <Tabs defaultValue={Object.keys(groupedTests)[0] || "all"}>
                      <TabsList className="flex-wrap h-auto mb-6">
                        {Object.keys(groupedTests).map(section => {
                          const Icon = sectionIcons[section.toLowerCase()] || BookOpen;
                          return (
                            <TabsTrigger key={section} value={section} className="gap-2">
                              <Icon className="w-4 h-4" />
                              {section.charAt(0).toUpperCase() + section.slice(1)}
                            </TabsTrigger>
                          );
                        })}
                      </TabsList>

                      {Object.entries(groupedTests).map(([section, sectionTests]) => (
                        <TabsContent key={section} value={section}>
                          <div className="grid md:grid-cols-2 gap-4">
                            {sectionTests.map((test, idx) => {
                              const Icon = sectionIcons[test.section.toLowerCase()] || BookOpen;
                              return (
                                <motion.div
                                  key={test.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                >
                                  <Card className="hover:shadow-card transition-all group">
                                    <CardContent className="p-5">
                                      <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                          <Icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between gap-2">
                                            <h4 className="font-semibold truncate">{test.title}</h4>
                                            {test.is_mock_exam && (
                                              <Badge className="bg-gold text-gold-foreground shrink-0">
                                                <Zap className="w-3 h-3 mr-1" />
                                                Mock
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {test.description}
                                          </p>
                                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                              <Clock className="w-3 h-3" />
                                              {test.duration_minutes} min
                                            </span>
                                            <span className="flex items-center gap-1">
                                              <BarChart3 className="w-3 h-3" />
                                              {test.total_questions} questions
                                            </span>
                                            <span className="flex items-center gap-1">
                                              <Star className="w-3 h-3" />
                                              {test.points_value} pts
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <Button 
                                        className="w-full mt-4"
                                        onClick={() => handleStartTest(test.id)}
                                      >
                                        <Play className="w-4 h-4 mr-2" />
                                        Start Test
                                      </Button>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              );
                            })}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Features Section */}
          {!selectedExam && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16"
            >
              <h2 className="text-2xl font-bold text-center mb-8">
                Why Choose Our Exam Prep?
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Target,
                    title: "Personalized Learning",
                    description: "AI analyzes your performance and creates custom study plans"
                  },
                  {
                    icon: Clock,
                    title: "Real Exam Simulation",
                    description: "Practice with timed mock exams that mirror actual test conditions"
                  },
                  {
                    icon: BarChart3,
                    title: "Detailed Analytics",
                    description: "Track your progress with band score estimates and section breakdowns"
                  }
                ].map((feature, idx) => (
                  <Card key={idx} className="text-center p-6">
                    <feature.icon className="w-12 h-12 mx-auto text-primary mb-4" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ExamPrep;
