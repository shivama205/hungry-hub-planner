import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { BaseLayout } from "@/components/layouts/BaseLayout";
import { Recipe } from "@/types/recipeFinder";
import { 
  ChefHat, 
  Timer, 
  UtensilsCrossed, 
  ListChecks, 
  Dumbbell, 
  ArrowLeft,
  RefreshCw,
  Share2,
  Download,
  Trash2,
  X,
  Save
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { MealPlanLoadingOverlay } from "@/components/MealPlanLoadingOverlay";
import html2canvas from "html2canvas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginDialog } from "@/components/LoginDialog";
import { saveRecipe } from "@/services/recipeFinder";
import type { SuggestedMeal } from "@/services/mealSuggestions";

export default function RecipeDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [suggestedMeal, setSuggestedMeal] = useState<SuggestedMeal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Check if it's a new recipe based on URL or state
  const isNewRecipe = id === 'new' || Boolean(location.state?.meal);

  const loadRecipe = async () => {
    // For new recipes
    if (isNewRecipe) {
      // Handle new recipe from state
      const stateMeal = location.state?.meal;
      if (stateMeal) {
        setSuggestedMeal(stateMeal);
        setIsLoading(false);
        return;
      }

      // Try to get recipe from sessionStorage
      const storedRecipe = sessionStorage.getItem('pendingRecipe');
      if (storedRecipe) {
        setSuggestedMeal(JSON.parse(storedRecipe));
        sessionStorage.removeItem('pendingRecipe');
        setIsLoading(false);
        return;
      }

      // No recipe data found, redirect to meal suggestions
      toast({
        title: "No recipe found",
        description: "Please select a recipe from meal suggestions.",
        variant: "destructive",
      });
      navigate("/meal-suggestions");
      return;
    }

    // Handle existing recipe
    if (!id) {
      navigate("/recipe-finder");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("saved_recipes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {  // Row level security violation
          setLoginDialogOpen(true);
          return;
        }
        throw error;
      }

      if (!data) {
        toast({
          title: "Recipe not found",
          description: "The recipe you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate("/recipe-finder");
        return;
      }

      setRecipe({
        id: data.id,
        meal_name: data.meal_name,
        cooking_time: data.cooking_time,
        ingredients: data.ingredients,
        instructions: data.instructions,
        nutritional_value: data.nutritional_value,
        created_at: data.created_at,
      });
    } catch (error) {
      console.error("Error fetching recipe:", error);
      toast({
        title: "Error",
        description: "Failed to load recipe details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecipe();
  }, [id, user, location.state]);

  const handleLoginDialogChange = (open: boolean) => {
    setLoginDialogOpen(open);
  };

  const handleSave = async () => {
    if (!user) {
      setLoginDialogOpen(true);
      return;
    }

    if (!suggestedMeal) {
      toast({
        title: "Error",
        description: "No recipe data found to save.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const savedRecipe = await saveRecipe(user.id, {
        meal_name: suggestedMeal.name,
        cooking_time: suggestedMeal.cookingTime,
        ingredients: suggestedMeal.ingredients,
        instructions: suggestedMeal.instructions,
        nutritional_value: suggestedMeal.nutritionalValue
      });
      
      toast({
        title: "Recipe saved!",
        description: "Recipe has been added to your collection.",
      });

      // Navigate to the saved recipe
      navigate(`/recipe/${savedRecipe.id}`, { replace: true });
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (!isNewRecipe) {
      navigate('/');
    } else {
      navigate('/recipe-finder');
    }
  };

  const handleShare = async () => {
    if (!user) {
      setLoginDialogOpen(true);
      return;
    }

    if (!recipe?.id) {
      toast({
        title: "Error",
        description: "Cannot share an unsaved recipe. Please save the recipe first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // check if share url already exists
      const { data: existingShare, error: existingShareError } = await supabase
        .from("shared_recipes")
        .select("id")
        .eq("recipe_id", recipe.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingShareError) throw existingShareError;

      if (existingShare) {
        const shareUrl = `${window.location.origin}/shared/recipe/${existingShare.id}`;
        await copyToClipboard(shareUrl);
        return;
      }

      // Since share url doesn't exist, save the recipe reference to shared_recipes table
      const { data: newShare, error } = await supabase
        .from("shared_recipes")
        .insert({
          recipe_id: recipe.id,
          user_id: user.id,
          is_public: true,
          views: 0,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days expiry
        })
        .select()
        .single();
  
      if (error) throw error;

      const shareUrl = `${window.location.origin}/shared/recipe/${newShare.id}`;
      await copyToClipboard(shareUrl);
    } catch (error) {
      console.error('Error sharing recipe:', error);
      toast({
        title: "Error",
        description: "Failed to create share link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Link copied!",
        description: "Share the link with your friends and family.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy link",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const generatePreview = async () => {
    if (!downloadRef.current) return;
    setIsGeneratingPreview(true);

    try {
      const canvas = await html2canvas(downloadRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const image = canvas.toDataURL('image/png');
      setPreviewImage(image);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: "Error",
        description: "Failed to generate preview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleDownload = async () => {
    if (window.innerWidth >= 768) { // Non-mobile view
      // Always generate new preview when clicking download
      await generatePreview();
    } else { // Mobile view - direct download
      if (!downloadRef.current) return;
      try {
        const canvas = await html2canvas(downloadRef.current, {
          scale: 2,
          backgroundColor: '#ffffff',
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `${recipe?.meal_name || 'recipe'}.png`;
        link.click();
      } catch (error) {
        console.error('Error downloading recipe:', error);
        toast({
          title: "Error",
          description: "Failed to download recipe. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!user) {
      setLoginDialogOpen(true);
      return;
    }

    if (isNewRecipe || !id) {
      toast({
        title: "Error",
        description: "Cannot delete an unsaved recipe.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("saved_recipes")
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Recipe deleted",
        description: "Your recipe has been deleted successfully.",
      });
      navigate('/profile');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: "Error",
        description: "Failed to delete recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return <MealPlanLoadingOverlay isLoading={true} />;
  }

  if (!recipe && !suggestedMeal) {
    return null;
  }

  const recipeData = isNewRecipe ? suggestedMeal : recipe;
  if (!recipeData) return null;

  return (
    <BaseLayout>
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {isNewRecipe ? (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Recipe"}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Recipe Content */}
        <div ref={downloadRef} className="space-y-6 bg-white p-6 rounded-lg">
          {/* Recipe Header */}
          <Card className="p-6 bg-gradient-to-r from-primary to-primary/80 text-white">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">
                {isNewRecipe ? suggestedMeal?.name : recipe?.meal_name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  <span>
                    {isNewRecipe ? suggestedMeal?.cookingTime : recipe?.cooking_time} mins
                  </span>
                </div>
                {!isNewRecipe && recipe?.created_at && (
                  <div className="text-sm text-white/80">
                    Saved on {new Date(recipe.created_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Recipe Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ingredients Card */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Ingredients</h2>
              </div>
              <ul className="space-y-2">
                {(isNewRecipe ? suggestedMeal?.ingredients : recipe?.ingredients)?.map((ingredient, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0 mt-2" />
                    <span className="text-gray-600">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Instructions Card */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ListChecks className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Instructions</h2>
              </div>
              <ol className="space-y-4">
                {(isNewRecipe ? suggestedMeal?.instructions : recipe?.instructions)?.map((instruction, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="font-medium text-primary/60 flex-shrink-0">
                      {i + 1}.
                    </span>
                    <span className="text-gray-600">{instruction}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          {/* Nutritional Info */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Nutritional Information</h2>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-sm font-medium text-primary">Calories</div>
                <div className="text-2xl font-bold">
                  {isNewRecipe ? suggestedMeal?.nutritionalValue.calories : recipe?.nutritional_value.calories}
                </div>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-sm font-medium text-primary">Protein</div>
                <div className="text-2xl font-bold">
                  {isNewRecipe ? suggestedMeal?.nutritionalValue.protein : recipe?.nutritional_value.protein}g
                </div>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-sm font-medium text-primary">Carbs</div>
                <div className="text-2xl font-bold">
                  {isNewRecipe ? suggestedMeal?.nutritionalValue.carbs : recipe?.nutritional_value.carbs}g
                </div>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-sm font-medium text-primary">Fat</div>
                <div className="text-2xl font-bold">
                  {isNewRecipe ? suggestedMeal?.nutritionalValue.fat : recipe?.nutritional_value.fat}g
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Recipe</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this recipe? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Recipe Preview</DialogTitle>
            </DialogHeader>
            {previewImage && (
              <div className="space-y-4">
                <img
                  src={previewImage}
                  alt="Recipe preview"
                  className="w-full rounded-lg"
                />
                <div className="flex justify-end gap-2 sticky bottom-0 bg-white p-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPreview(false);
                      setPreviewImage(""); // Clear the preview image
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = previewImage;
                      link.download = `${recipe?.meal_name || 'recipe'}.png`;
                      link.click();
                      setShowPreview(false);
                      setPreviewImage(""); // Clear the preview image
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Login Dialog */}
        <LoginDialog
          open={loginDialogOpen}
          onOpenChange={handleLoginDialogChange}
          redirectPath={location.pathname}
          state={location.state}
        />
      </div>
    </BaseLayout>
  );
} 