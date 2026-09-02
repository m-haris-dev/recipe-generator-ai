import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, } from "firebase/firestore";
import { db } from "../src/firebase/config";
import { Recipe } from "../types";

interface RecipePreferences {
  spiciness: string;
  isVeg: boolean;
  isQuick: boolean;
}

export interface RecipeHistory {
  id: string;
  ingredients: string;
  preferences: RecipePreferences;
  recipes: Recipe[];
  createdAt: any;
}

// Save recipe history
export const saveRecipeHistory = async (
  userId: string,
  ingredients: string,
  preferences: RecipePreferences,
  recipes: Recipe[]
) => {
  try {
    const historyRef = collection(
      db,
      "users",
      userId,
      "recipeHistory"
    );

    await addDoc(historyRef, {
      ingredients,
      preferences,
      recipes,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving recipe history:", error);
  }
};

// Get recipe history
export const getRecipeHistory = async (
  userId: string
): Promise<RecipeHistory[]> => {
  try {
    const historyRef = collection(
      db,
      "users",
      userId,
      "recipeHistory"
    );

    const historyQuery = query(
      historyRef,
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(historyQuery);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as RecipeHistory[];

  } catch (error) {
    console.error("Error fetching recipe history:", error);
    throw error;
  }
};