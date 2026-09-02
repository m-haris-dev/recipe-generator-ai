
export interface Recipe {
  name: string;
  time: string;
  difficulty: string;
  steps: string[];
}

export interface UserPreferences {
  spiciness: 'Normal' | 'Spicy' | 'Mild';
  isVeg: boolean;
  isQuick: boolean;
}

export interface AppState {
  ingredients: string;
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  preferences: UserPreferences;
}

export interface RecipeHistoryEntry {
  id: string;
  ingredients: string;
  preferences: UserPreferences;
  recipes: Recipe[];
  createdAt: Date | null;
}
