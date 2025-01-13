// Define the Cuisine enum
export enum Cuisine {
  Italian = 'Italian',
  Chinese = 'Chinese',
  Indian = 'Indian',
  Mexican = 'Mexican',
  French = 'French',
  Japanese = 'Japanese',
  Korean = 'Korean',
  Thai = 'Thai',
  Vietnamese = 'Vietnamese',
  Greek = 'Greek',
  Mediterranean = 'Mediterranean',
  American = 'American'
}

// Update the Preferences interface to use the Cuisine enum
export interface Preferences {
  days?: string;
  dietaryRestrictions?: string;
  proteinGoal?: string;
  calorieIntakeGoal?: string;
  cuisinePreferences?: Cuisine[]; // Use the Cuisine enum here
}