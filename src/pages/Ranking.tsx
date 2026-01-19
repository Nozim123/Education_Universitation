import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { 
  Trophy, 
  Medal,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  GraduationCap,
  Calendar,
  Filter,
  Loader2,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLeaderboard } from "@/hooks/useLeaderboard";

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-gold fill-gold/20" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-silver" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-bronze" />;
  return <span className="font-medium text-muted-foreground">{rank}</span>;
};

const getChangeIcon = (current: number, previous: number) => {
  const change = previous - current; // Positive if rank improved (lower number)
  if (change > 0) return <TrendingUp className="w-3 h-3 text-success" />;
  if (change < 0) return <TrendingDown className="w-3 h-3 text-destructive" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
};

const getChangeValue = (current: number, previous: number) => {
  const change = previous - current;
  return Math.abs(change) || "-";
};

const Ranking = () => {
  const { students, universities, loading, timeFilter, setTimeFilter } = useLeaderboard();

  const top3Students = students.slice(0, 3);

  const getStudentName = (student: typeof students[0]) => {
    if (student.first_name && student.last_name) {
      return `${student.first_name} ${student.last_name}`;
    }
    return student.email?.split("@")[0] || "Unknown";
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl md:text-4xl font-display font-bold">
                    <span className="text-gradient">Leaderboard</span>
                  </h1>
                  <Badge variant="outline" className="gap-1 animate-pulse">
                    <Zap className="w-3 h-3" />
                    Live
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Top performing students and universities • Updates in real-time
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={timeFilter === "month" ? "default" : "outline"} 
                  className="gap-2"
                  onClick={() => setTimeFilter("month")}
                >
                  <Calendar className="w-4 h-4" />
                  This Month
                </Button>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Top 3 Podium */}
          {top3Students.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
            >
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto items-end">
                {/* 2nd Place */}
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative"
                  >
                    <Avatar className="w-20 h-20 mx-auto mb-2 border-4 border-silver shadow-lg">
                      <AvatarImage src={top3Students[1]?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3Students[1]?.id}`} />
                      <AvatarFallback>{getStudentName(top3Students[1])[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-silver flex items-center justify-center shadow-md">
                      <span className="font-bold text-white">2</span>
                    </div>
                  </motion.div>
                  <div className="bg-gradient-to-t from-silver/20 to-transparent rounded-t-xl pt-8 pb-4 px-2 mt-4">
                    <h3 className="font-semibold text-sm mb-1 truncate">{getStudentName(top3Students[1])}</h3>
                    <p className="text-xs text-muted-foreground mb-2 truncate">{top3Students[1]?.university?.name || "—"}</p>
                    <Badge variant="secondary">{(top3Students[1]?.total_points || 0).toLocaleString()} pts</Badge>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                      <Crown className="w-10 h-10 text-gold fill-gold/20" />
                    </div>
                    <Avatar className="w-24 h-24 mx-auto mb-2 border-4 border-gold shadow-lg shadow-gold/20">
                      <AvatarImage src={top3Students[0]?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3Students[0]?.id}`} />
                      <AvatarFallback>{getStudentName(top3Students[0])[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gold flex items-center justify-center shadow-md">
                      <span className="font-bold text-white">1</span>
                    </div>
                  </motion.div>
                  <div className="bg-gradient-to-t from-gold/20 to-transparent rounded-t-xl pt-10 pb-4 px-2 mt-4">
                    <h3 className="font-semibold mb-1 truncate">{getStudentName(top3Students[0])}</h3>
                    <p className="text-xs text-muted-foreground mb-2 truncate">{top3Students[0]?.university?.name || "—"}</p>
                    <Badge className="bg-gradient-to-r from-gold to-amber-600 text-white border-0">
                      {(top3Students[0]?.total_points || 0).toLocaleString()} pts
                    </Badge>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative"
                  >
                    <Avatar className="w-20 h-20 mx-auto mb-2 border-4 border-bronze shadow-lg">
                      <AvatarImage src={top3Students[2]?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3Students[2]?.id}`} />
                      <AvatarFallback>{getStudentName(top3Students[2])[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-bronze flex items-center justify-center shadow-md">
                      <span className="font-bold text-white">3</span>
                    </div>
                  </motion.div>
                  <div className="bg-gradient-to-t from-bronze/20 to-transparent rounded-t-xl pt-8 pb-4 px-2 mt-4">
                    <h3 className="font-semibold text-sm mb-1 truncate">{getStudentName(top3Students[2])}</h3>
                    <p className="text-xs text-muted-foreground mb-2 truncate">{top3Students[2]?.university?.name || "—"}</p>
                    <Badge variant="secondary">{(top3Students[2]?.total_points || 0).toLocaleString()} pts</Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Rankings Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="students">
              <TabsList className="bg-muted/50 p-1 mb-6">
                <TabsTrigger value="students" className="gap-2">
                  <Users className="w-4 h-4" />
                  Students
                </TabsTrigger>
                <TabsTrigger value="universities" className="gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Universities
                </TabsTrigger>
              </TabsList>

              <TabsContent value="students">
                <div className="bg-card rounded-2xl border overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    {students.map((student, index) => (
                      <motion.div
                        key={student.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.03 }}
                        className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${
                          index !== students.length - 1 ? "border-b" : ""
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                          {getRankIcon(student.rank || index + 1)}
                        </div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={student.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`} />
                          <AvatarFallback>{getStudentName(student)[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{getStudentName(student)}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {student.university?.name || "No university"}
                          </div>
                        </div>
                        <div className="text-right">
                          <motion.div 
                            key={student.total_points}
                            initial={{ scale: 1.2, color: "hsl(var(--primary))" }}
                            animate={{ scale: 1, color: "inherit" }}
                            className="font-display font-bold"
                          >
                            {(student.total_points || 0).toLocaleString()}
                          </motion.div>
                          <div className={`flex items-center gap-1 text-sm justify-end ${
                            (student.previousRank || student.rank || 0) > (student.rank || 0) ? "text-success" : 
                            (student.previousRank || student.rank || 0) < (student.rank || 0) ? "text-destructive" : 
                            "text-muted-foreground"
                          }`}>
                            {getChangeIcon(student.rank || 0, student.previousRank || student.rank || 0)}
                            {getChangeValue(student.rank || 0, student.previousRank || student.rank || 0)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {students.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No students found</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="universities">
                <div className="bg-card rounded-2xl border overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    {universities.map((uni, index) => (
                      <motion.div
                        key={uni.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.03 }}
                        className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${
                          index !== universities.length - 1 ? "border-b" : ""
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                          {getRankIcon(uni.rank || index + 1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{uni.name}</div>
                          <div className="text-sm text-muted-foreground">
                            <Users className="w-3 h-3 inline mr-1" />
                            {(uni.student_count || 0).toLocaleString()} students
                          </div>
                        </div>
                        <div className="text-right">
                          <motion.div 
                            key={uni.total_points}
                            initial={{ scale: 1.2, color: "hsl(var(--primary))" }}
                            animate={{ scale: 1, color: "inherit" }}
                            className="font-display font-bold"
                          >
                            {(uni.total_points || 0).toLocaleString()}
                          </motion.div>
                          <div className={`flex items-center gap-1 text-sm justify-end ${
                            (uni.previousRank || uni.rank || 0) > (uni.rank || 0) ? "text-success" : 
                            (uni.previousRank || uni.rank || 0) < (uni.rank || 0) ? "text-destructive" : 
                            "text-muted-foreground"
                          }`}>
                            {getChangeIcon(uni.rank || 0, uni.previousRank || uni.rank || 0)}
                            {getChangeValue(uni.rank || 0, uni.previousRank || uni.rank || 0)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {universities.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No universities found</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Ranking;
