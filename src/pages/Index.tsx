import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BaseLayout } from "@/components/layouts/BaseLayout";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ComingSoon } from "@/components/dashboard/ComingSoon";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { Sparkles, Star, ChefHat, Brain, Carrot } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Activity } from "@/types/activity";

// Feature highlights data
const featureHighlights = [
  {
    icon: ChefHat,
    title: "AI Meal Planning",
    description: "Get personalized meal plans tailored to your preferences and goals",
    path: "/meal-plan"
  },
  {
    icon: Brain,
    title: "Smart Alternatives",
    description: "Discover healthy alternatives to your favorite dishes",
    path: "/healthy-alternative"
  },
  {
    icon: Carrot,
    title: "Nutrition Tracking",
    description: "Track your nutrition goals with our smart macro calculator",
    path: "/meal-plan"
  }
];

// Testimonials data
const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Fitness Enthusiast",
    content: "SousChef has transformed how I plan my meals. The AI suggestions are spot-on!"
  },
  {
    name: "Mike Chen",
    role: "Busy Professional",
    content: "Finally, a meal planning app that understands my dietary restrictions and schedule."
  },
  {
    name: "Emma Davis",
    role: "Health Coach",
    content: "I recommend SousChef to all my clients. The healthy alternatives feature is amazing!"
  }
];

export default function Index() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    savedPlansCount: 0,
    savedRecipesCount: 0,
    totalActivities: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Handle user authentication
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user stats and activities when user is available
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch saved plans in last week
        const { data: plans, error: plansError } = await supabase
          .from('saved_meal_plans')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false });

        if (plansError) throw plansError;

        // Fetch saved recipes in last week
        const { data: recipes, error: recipesError } = await supabase
          .from('saved_recipes')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false });

        if (recipesError) throw recipesError;

        // Fetch feature uses in last week
        const { data: activities, error: activitiesError } = await supabase
          .from('user_activity')
          .select('*')
          .eq('user_id', user.id)
          .eq('activity_type', 'feature_use')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false });

        if (activitiesError) throw activitiesError;

        // Fetch recent activities
        const { data: recentActivities, error: recentError } = await supabase
          .from('user_activity')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentError) throw recentError;

        setStats({
          savedPlansCount: plans?.length || 0,
          savedRecipesCount: recipes?.length || 0,
          totalActivities: activities?.length || 0
        });
        setActivities(recentActivities || []);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Reset stats and activities on error
        setStats({
          savedPlansCount: 0,
          savedRecipesCount: 0,
          totalActivities: 0
        });
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const LoggedInView = () => (
    <div className="container mx-auto py-8 sm:py-10">
      <div className="space-y-8 px-4 sm:px-6">
        <div className="pt-4">
          <PageHeader
            icon={Sparkles}
            title={`Welcome back, ${user?.user_metadata?.full_name || 'User'}!`}
            description="Your personal AI-powered meal planning assistant"
            className="text-left"
          />
        </div>

        {/* Quick Actions */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Quick Actions</h2>act
          <QuickActions />
        </section>

        {/* Stats Grid */}
        <DashboardStats
          savedPlansCount={stats.savedPlansCount}
          savedRecipesCount={stats.savedRecipesCount}
          totalActivities={stats.totalActivities}
        />

        {/* Recent Activity */}
        <RecentActivity activities={activities} />

        {/* Coming Soon */}
        <ComingSoon />
      </div>
    </div>
  );

  const LoggedOutView = () => (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Your Personal AI Chef
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
            Create personalized meal plans, discover healthy alternatives, and achieve your nutritional goals with AI-powered assistance.
          </p>
        </motion.div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            size="lg" 
            onClick={() => navigate('/meal-plan')}
            className="w-full sm:w-auto"
          >
            Create Your Meal Plan
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigate('/healthy-alternative')}
            className="w-full sm:w-auto"
          >
            Try Healthy Alternatives
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">Discover Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureHighlights.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                onClick={() => navigate(feature.path)}
                className="h-full cursor-pointer hover:shadow-lg transition-shadow duration-200"
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-400" />
                <Star className="w-5 h-5 text-yellow-400" />
                <Star className="w-5 h-5 text-yellow-400" />
                <Star className="w-5 h-5 text-yellow-400" />
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-gray-600 mb-4">{testimonial.content}</p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <BaseLayout>
      {user ? <LoggedInView /> : <LoggedOutView />}
    </BaseLayout>
  );
}
