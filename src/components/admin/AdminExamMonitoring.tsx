import { motion } from "framer-motion";
import {
  GraduationCap,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Loader2,
  Shield,
  Eye,
  Pause,
  Ban,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAdminExamMonitoring } from "@/hooks/useAdminExamMonitoring";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AdminExamMonitoringProps {
  isAdmin: boolean;
}

export const AdminExamMonitoring = ({ isAdmin }: AdminExamMonitoringProps) => {
  const { toast } = useToast();
  const {
    loading,
    stats,
    activeAttempts,
    recentCompleted,
    freezeAttempt,
    invalidateResult,
    refetch,
  } = useAdminExamMonitoring();

  const handleFreeze = async (attemptId: string) => {
    const { error } = await freezeAttempt(attemptId, "Suspicious activity detected");
    if (!error) {
      toast({ title: "Exam Frozen", description: "The exam attempt has been paused." });
    }
  };

  const handleInvalidate = async (attemptId: string) => {
    const { error } = await invalidateResult(attemptId, "Result invalidated by admin");
    if (!error) {
      toast({ title: "Result Invalidated", description: "The exam result has been voided." });
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.activeExams}</div>
                <div className="text-sm text-muted-foreground">Active Exams</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.completedToday}</div>
                <div className="text-sm text-muted-foreground">Completed Today</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.avgScore}%</div>
                <div className="text-sm text-muted-foreground">Avg Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${stats.flaggedAttempts > 0 ? 'from-red-500/10 to-orange-500/10 border-red-500/30' : 'from-muted/50 to-muted/30'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stats.flaggedAttempts > 0 ? 'bg-red-500/20' : 'bg-muted'}`}>
                <AlertTriangle className={`w-5 h-5 ${stats.flaggedAttempts > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.flaggedAttempts}</div>
                <div className="text-sm text-muted-foreground">Flagged</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Exams */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
                Live Exams ({activeAttempts.length})
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={refetch}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {activeAttempts.map((attempt) => (
                  <motion.div
                    key={attempt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {attempt.profile?.first_name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {attempt.profile?.first_name} {attempt.profile?.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {attempt.profile?.email}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="animate-pulse">
                        <Activity className="w-3 h-3 mr-1" />
                        In Progress
                      </Badge>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm font-medium">{attempt.test?.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="uppercase">{attempt.test?.exam_type}</span>
                        <span>•</span>
                        <span className="capitalize">{attempt.test?.section}</span>
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        <span>Started {formatDistanceToNow(new Date(attempt.started_at), { addSuffix: true })}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        Monitor
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs text-amber-600"
                        onClick={() => handleFreeze(attempt.id)}
                      >
                        <Pause className="w-3 h-3 mr-1" />
                        Freeze
                      </Button>
                    </div>
                  </motion.div>
                ))}

                {activeAttempts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No active exams</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Completed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Recent Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {recentCompleted.map((attempt) => {
                  const percentage = attempt.max_score 
                    ? Math.round((attempt.score! / attempt.max_score) * 100)
                    : 0;
                  const isSuspicious = attempt.time_spent_seconds && attempt.time_spent_seconds < 300 && percentage > 80;

                  return (
                    <div
                      key={attempt.id}
                      className={`p-4 rounded-lg border ${isSuspicious ? 'border-red-500/50 bg-red-500/5' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {attempt.profile?.first_name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">
                              {attempt.profile?.first_name} {attempt.profile?.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {attempt.test?.title}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {attempt.band_score ? (
                            <Badge>Band {attempt.band_score}</Badge>
                          ) : (
                            <Badge variant={percentage >= 70 ? "default" : percentage >= 50 ? "secondary" : "destructive"}>
                              {percentage}%
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {attempt.time_spent_seconds 
                            ? `${Math.floor(attempt.time_spent_seconds / 60)}m ${attempt.time_spent_seconds % 60}s`
                            : "N/A"
                          }
                        </span>
                        <span>
                          {attempt.completed_at && formatDistanceToNow(new Date(attempt.completed_at), { addSuffix: true })}
                        </span>
                      </div>

                      {isSuspicious && (
                        <div className="mt-3 flex items-center justify-between">
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Suspicious
                          </Badge>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => handleInvalidate(attempt.id)}
                          >
                            <Ban className="w-3 h-3 mr-1" />
                            Invalidate
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {recentCompleted.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No completed exams today</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminExamMonitoring;
