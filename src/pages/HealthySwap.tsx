import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import NavigationBar from "@/components/NavigationBar";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { HealthySwapRequest, HealthySwapResponse, Recipe } from "@/types/healthySwap";

const HealthySwap = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [alternatives, setAlternatives] = useState<Recipe[]>([]);
  const [request, setRequest] = useState<HealthySwapRequest>({
    mealName: "",
    description: "",
  });

  const generatePrompt = (request: HealthySwapRequest): string => {
    return `Suggest 3 healthy alternatives for this meal:
    Meal: ${request.mealName}
    Description: ${request.description}
    
    For each alternative, provide:
    - Name of the meal
    - Time to cook
    - List of ingredients
    - Step by step instructions
    - Nutritional value per serving (calories, protein, carbs, fat, fiber)
    
    Format the response as a JSON object with this structure:
    {
      "alternatives": [
        {
          "name": "Meal name",
          "cookingTime": "30 minutes",
          "ingredients": ["ingredient 1", "ingredient 2"],
          "instructions": ["step 1", "step 2"],
          "nutritionalValue": {
            "calories": 300,
            "protein": 20,
            "carbs": 30,
            "fat": 10,
            "fiber": 5
          }
        }
      ]
    }`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(generatePrompt(request));
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON content from the response
      const jsonMatch = text.match(/```json([\s\S]*?)```/);
      if (!jsonMatch) {
        throw new Error("Invalid response format");
      }
      const jsonString = jsonMatch[1].trim();
      
      const data = JSON.parse(jsonString) as HealthySwapResponse;
      setAlternatives(data.alternatives);
      
      toast({
        title: "Success",
        description: "Found healthy alternatives for your meal!",
      });
    } catch (error) {
      console.error("Error generating alternatives:", error);
      toast({
        title: "Error",
        description: "Failed to generate alternatives. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/30 to-accent/10">
      <NavigationBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Find Healthy Alternatives</h1>
        
        <Card className="w-full max-w-2xl mx-auto backdrop-blur-sm bg-white/80 border-0 shadow-xl rounded-2xl p-8 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mealName">Meal Name</Label>
              <Input
                id="mealName"
                value={request.mealName}
                onChange={(e) => setRequest({ ...request, mealName: e.target.value })}
                placeholder="e.g., Chicken Alfredo"
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={request.description}
                onChange={(e) => setRequest({ ...request, description: e.target.value })}
                placeholder="Describe the meal and any specific concerns..."
                className="min-h-[100px] resize-none"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Finding Alternatives..." : "Find Healthy Alternatives"}
            </Button>
          </form>
        </Card>

        {alternatives.length > 0 && (
          <div className="mt-12 space-y-8">
            <h2 className="text-2xl font-bold text-primary">Healthy Alternatives</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {alternatives.map((recipe, index) => (
                <Card key={index} className="backdrop-blur-sm bg-white/80 border-0 shadow-xl rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4">{recipe.name}</h3>
                  <p className="text-gray-600 mb-4">Cooking Time: {recipe.cookingTime}</p>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Ingredients:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {recipe.ingredients.map((ingredient, i) => (
                        <li key={i} className="text-gray-600">{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      {recipe.instructions.map((step, i) => (
                        <li key={i} className="text-gray-600">{step}</li>
                      ))}
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Nutritional Value (per serving):</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>Calories: {recipe.nutritionalValue.calories}</p>
                      <p>Protein: {recipe.nutritionalValue.protein}g</p>
                      <p>Carbs: {recipe.nutritionalValue.carbs}g</p>
                      <p>Fat: {recipe.nutritionalValue.fat}g</p>
                      <p>Fiber: {recipe.nutritionalValue.fiber}g</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthySwap;