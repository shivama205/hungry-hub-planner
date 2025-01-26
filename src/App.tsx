import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { SEO } from "@/components/SEO";
import Index from "./pages/Index";
import { MealPlan } from "./pages/MealPlanner/MealPlan";
import HealthyAlternative from "./pages/HealthyAlternatives/HealthyAlternative";
import Profile from "./pages/Profile";
import { Pricing } from "./pages/Pricing";
import Billing from "./pages/Billing";
import MealPlanDetails from "./pages/MealPlanner/MealPlanDetails";
import SharedMealPlan from "./pages/MealPlanner/SharedMealPlan";
import Blog from "./pages/blogs/Blogs";
import BlogPost from "./pages/blogs/BlogDetails";
import RecipeFinder from "./pages/ReciperFinder/RecipeFinder";
import Privacy from "./pages/compliance/Privacy";
import Terms from "./pages/compliance/Terms";
import About from "./pages/compliance/About";
import RecipeDetail from "@/pages/ReciperFinder/RecipeDetail";
import SharedRecipe from "./pages/ReciperFinder/SharedRecipe";
import { PaymentSuccess } from "./pages/payment/success";
import { PaymentFailure } from "./pages/payment/failure";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <SEO />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/meal-plan" element={<MealPlan />} />
            <Route path="/meal-plan/:id" element={<MealPlanDetails />} />
            <Route path="/shared/meal-plan/:id" element={<SharedMealPlan />} />
            <Route path="/recipe-finder" element={<RecipeFinder />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/shared/recipe/:id" element={<SharedRecipe />} />
            <Route path="/healthy-alternative" element={<HealthyAlternative />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/about" element={<About />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;