import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Trophy, Medal, Crown, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const topStudents = [
  {
    rank: 1,
    name: "Alex Johnson",
    university: "MIT",
    points: 12450,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    trend: "+240",
    badge: Crown,
    badgeColor: "text-gold",
    bgGradient: "from-yellow-500/20 to-amber-500/20",
    borderColor: "border-gold/30",
  },
  {
    rank: 2,
    name: "Sarah Chen",
    university: "Stanford",
    points: 11890,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    trend: "+180",
    badge: Medal,
    badgeColor: "text-silver",
    bgGradient: "from-gray-400/20 to-slate-500/20",
    borderColor: "border-silver/30",
  },
  {
    rank: 3,
    name: "Michael Park",
    university: "Harvard",
    points: 11340,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    trend: "+156",
    badge: Medal,
    badgeColor: "text-bronze",
    bgGradient: "from-orange-600/20 to-amber-700/20",
    borderColor: "border-bronze/30",
  },
  {
    rank: 4,
    name: "Emma Wilson",
    university: "Oxford",
    points: 10890,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    trend: "+134",
  },
  {
    rank: 5,
    name: "David Kim",
    university: "Cambridge",
    points: 10560,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    trend: "+98",
  },
];

export const TopStudentsSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-transparent via-muted/50 to-transparent">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/3"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold mb-4">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">Leaderboard</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Top <span className="text-gradient">Students</span>
              <br />This Month
            </h2>
            <p className="text-muted-foreground mb-6">
              Compete with the best minds from universities worldwide. 
              Rise through the ranks and earn recognition for your achievements.
            </p>
            <Link to="/ranking">
              <Button variant="outline" className="group">
                View Full Ranking
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Right - Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-2/3"
          >
            <div className="space-y-3">
              {topStudents.map((student, index) => (
                <motion.div
                  key={student.rank}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-card ${
                    student.bgGradient
                      ? `bg-gradient-to-r ${student.bgGradient} ${student.borderColor}`
                      : "bg-card"
                  }`}
                >
                  {/* Rank */}
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-display font-bold">
                    {student.badge ? (
                      <student.badge className={`w-6 h-6 ${student.badgeColor}`} />
                    ) : (
                      <span className="text-muted-foreground">{student.rank}</span>
                    )}
                  </div>

                  {/* Avatar & Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-12 h-12 border-2 border-background">
                      <AvatarImage src={student.avatar} alt={student.name} />
                      <AvatarFallback>{student.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.university}</div>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <div className="font-display font-bold text-lg">
                      {student.points.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-success">
                      <TrendingUp className="w-3 h-3" />
                      {student.trend}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
