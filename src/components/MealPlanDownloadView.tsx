import React from "react";
import { MealPlan } from "@/types/mealPlan";
import { Utensils, UtensilsCrossed } from "lucide-react";

interface MealPlanDownloadViewProps {
  mealPlan: MealPlan;
  planName: string;
}

export const MealPlanDownloadView = React.forwardRef<HTMLDivElement, MealPlanDownloadViewProps>(
  ({ mealPlan, planName }, ref) => {
    return (
      <div 
        ref={ref}
        className="bg-white p-8 rounded-lg max-w-4xl mx-auto"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Utensils className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{planName}</h1>
            <p className="text-sm text-gray-500">Generated by SousChef AI</p>
          </div>
        </div>

        {/* Meal Plan Content */}
        <div className="space-y-6">
          {mealPlan.days.map((day, dayIndex) => (
            <div key={dayIndex}>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {day.day}
              </h2>
              <div className="grid gap-3 pl-4">
                {day.meals.map((meal, mealIndex) => (
                  <div key={mealIndex} className="flex items-baseline">
                    <span className="text-gray-600 w-20 flex-shrink-0">{meal.time}</span>
                    <span className="font-medium text-gray-900">{meal.name}</span>
                    {meal.recipeLink && (
                      <a 
                        href={meal.recipeLink} 
                        className="ml-2 text-sm text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Recipe
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
          <p>Visit sous-chef.in to create your own personalized meal plan</p>
        </div>
      </div>
    );
  }
);

MealPlanDownloadView.displayName = "MealPlanDownloadView";

export default MealPlanDownloadView; 