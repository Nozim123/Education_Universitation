import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { 
  Briefcase, 
  Search,
  Filter,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Star,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const projects = [
  {
    id: 1,
    title: "EcoTrack - Environmental Monitoring App",
    description: "Build a mobile-first application to track and visualize environmental data in real-time.",
    category: "Technology",
    difficulty: "Advanced",
    participants: 24,
    maxParticipants: 30,
    points: 500,
    deadline: "2 weeks left",
    status: "open",
    tags: ["React Native", "Node.js", "Data Visualization"],
  },
  {
    id: 2,
    title: "AI-Powered Study Assistant",
    description: "Create an intelligent study companion that helps students with personalized learning paths.",
    category: "AI/ML",
    difficulty: "Expert",
    participants: 18,
    maxParticipants: 20,
    points: 750,
    deadline: "3 weeks left",
    status: "open",
    tags: ["Python", "Machine Learning", "NLP"],
  },
  {
    id: 3,
    title: "Campus Event Management System",
    description: "Develop a comprehensive platform for organizing and managing university events.",
    category: "Web Development",
    difficulty: "Intermediate",
    participants: 30,
    maxParticipants: 30,
    points: 350,
    deadline: "Completed",
    status: "completed",
    tags: ["React", "PostgreSQL", "TypeScript"],
  },
  {
    id: 4,
    title: "Research Paper Analysis Tool",
    description: "Build a tool that summarizes and extracts key insights from academic papers.",
    category: "AI/ML",
    difficulty: "Advanced",
    participants: 12,
    maxParticipants: 25,
    points: 600,
    deadline: "1 month left",
    status: "open",
    tags: ["Python", "NLP", "FastAPI"],
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner": return "bg-success/10 text-success border-success/20";
    case "Intermediate": return "bg-info/10 text-info border-info/20";
    case "Advanced": return "bg-warning/10 text-warning border-warning/20";
    case "Expert": return "bg-destructive/10 text-destructive border-destructive/20";
    default: return "bg-muted text-muted-foreground";
  }
};

const Projects = () => {
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
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              Projects & <span className="text-gradient">Practice</span>
            </h1>
            <p className="text-muted-foreground">
              Join real projects, earn points, and build your portfolio
            </p>
          </motion.div>

          {/* Search & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search projects..." className="pl-10" />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <Button className="gap-2">
              <Briefcase className="w-4 h-4" />
              Create Project
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: "Active Projects", value: "42", icon: Briefcase },
              { label: "Participants", value: "1.2K", icon: Users },
              { label: "Completed", value: "156", icon: CheckCircle2 },
              { label: "Total Points Awarded", value: "89K", icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="bg-card rounded-xl border p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-xl">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Projects Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid md:grid-cols-2 gap-6">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className={`bg-card rounded-2xl border p-6 hover:shadow-card transition-all group ${
                    project.status === "completed" ? "opacity-75" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{project.category}</Badge>
                      <Badge className={getDifficultyColor(project.difficulty)}>
                        {project.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-primary font-display font-bold">
                      <Star className="w-4 h-4" />
                      {project.points}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-muted rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {project.participants}/{project.maxParticipants} participants
                      </span>
                      <span className={`flex items-center gap-1 ${
                        project.status === "completed" ? "text-success" : "text-muted-foreground"
                      }`}>
                        {project.status === "completed" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            {project.deadline}
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            {project.deadline}
                          </>
                        )}
                      </span>
                    </div>
                    <Progress 
                      value={(project.participants / project.maxParticipants) * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Action */}
                  <Button 
                    className="w-full gap-2 group/btn" 
                    variant={project.status === "completed" ? "secondary" : "default"}
                    disabled={project.status === "completed"}
                  >
                    {project.status === "completed" ? "View Results" : "Join Project"}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Projects;
