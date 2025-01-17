import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BaseLayout } from "@/components/layouts/BaseLayout";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ComingSoon } from "@/components/dashboard/ComingSoon";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { PageHeader } from "@/components/ui/PageHeader";
import { Sparkles } from "lucide-react";
import { useUser } from "@/hooks/useUser";

function Index() {
  const navigate = useNavigate();
  const { user } = useUser();

  const LoggedInView = () => (
    <div className="container mx-auto py-8 sm:py-10">
      <div className="space-y-8 px-4 sm:px-6">
        <div className="pt-4">
          <PageHeader
            icon={Sparkles}
            title={`Welcome back, ${user?.user_metadata.full_name || 'User'}!`}
            description="Your personal AI-powered meal planning assistant"
            className="text-left"
          />
        </div>

        {/* Quick Actions */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <QuickActions />
        </section>

        {/* Stats Grid */}
        <DashboardStats />

        {/* Recent Activity */}
        <RecentActivity />

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
              className="bg-white rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
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

      {/* CTA Section */}
      <section className="text-center space-y-6">
        <h2 className="text-3xl font-bold">Ready to Start Your Journey?</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Join thousands of users who have transformed their eating habits with SousChef.
        </p>
        <Button 
          size="lg" 
          onClick={() => navigate('/meal-plan')}
          className="w-full sm:w-auto"
        >
          Get Started Now
        </Button>
      </section>
    </div>
  );

  return (
    <BaseLayout>
      {user ? <LoggedInView /> : <LoggedOutView />}
    </BaseLayout>
  );
}

export default Index;
