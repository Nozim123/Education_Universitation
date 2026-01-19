import { motion } from "framer-motion";
import { 
  Video, 
  FileText, 
  Briefcase, 
  Trophy, 
  MessageCircle, 
  GraduationCap,
  Target,
  Users,
  Award,
  BarChart3,
  HelpCircle,
  Compass
} from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Video Textbook",
    description: "Learn from curated video lessons across Economics, Medicine, Languages, and more.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: FileText,
    title: "Articles & Research",
    description: "Publish your scientific works and articles to boost your academic ranking.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Briefcase,
    title: "Projects & Practice",
    description: "Join real projects, get admin approval, and earn points for your contributions.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Trophy,
    title: "Challenges & Ranking",
    description: "Compete in monthly challenges and see your university climb the rankings.",
    color: "from-purple-500 to-pink-600",
  },
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    description: "Connect with fellow students and peers through instant messaging.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: GraduationCap,
    title: "Learning Paths",
    description: "Follow structured paths from beginner to professional with progress tracking.",
    color: "from-rose-500 to-red-600",
  },
  {
    icon: HelpCircle,
    title: "Q&A Forum",
    description: "Ask questions, share answers, and help the community while earning points.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Users,
    title: "Teams & Mentors",
    description: "Form teams for hackathons and connect with experienced mentors.",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: Award,
    title: "Badges & Achievements",
    description: "Earn badges for your accomplishments and showcase them on your profile.",
    color: "from-yellow-500 to-amber-600",
  },
  {
    icon: BarChart3,
    title: "Personal Analytics",
    description: "Track your weekly activity, lessons learned, and rating changes.",
    color: "from-indigo-500 to-blue-600",
  },
  {
    icon: Target,
    title: "Goal Setting",
    description: "Set monthly goals like completing videos or projects and track progress.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Compass,
    title: "Career Section",
    description: "Find internships, vacancies, and connect your CV to opportunities.",
    color: "from-teal-500 to-cyan-600",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Everything You Need to{" "}
            <span className="text-gradient">Excel</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete platform for learning, competing, and building your academic career
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group bg-card rounded-2xl p-6 border hover:shadow-card transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
