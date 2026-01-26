
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `You are a world-class Pakistani home chef AI for the web tool 'Aj Kya Pakayen?'.
The user will provide a list of ingredients they have at home and possibly some preferences (Spicy, Veg, Quick).
Your task is to suggest ONLY Pakistani / desi recipes that can be made with those ingredients.

Rules:
1. Use Roman Urdu with simple English mix (easy for general Pakistani users).
2. Keep recipes home-style, simple, and practical.
3. Use common desi measurements (chamcha, cup, andaza).
4. Suggest exactly 2–3 recipes per input.
5. If ingredients are very limited, suggest simple dishes like anda, daal, sabzi, or quick curry.
6. Strictly avoid foreign dishes (No Pasta, No Burgers, No Sushi). Stick to Pakistani taste.
7. Return the data in a clean JSON format.

Response Format (JSON):
{
  "recipes": [
    {
      "name": "Dish Name",
      "time": "30 min",
      "difficulty": "Easy",
      "steps": ["Step 1...", "Step 2..."]
    }
  ]
}`;

export const generateRecipes = async (ingredients: string): Promise<Recipe[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Ingredients and Preferences: ${ingredients}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  time: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  steps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["name", "time", "difficulty", "steps"]
              }
            }
          },
          required: ["recipes"]
        }
      }
    });

    const result = JSON.parse(response.text || '{"recipes": []}');
    return result.recipes;
  } catch (error) {
    console.error("Error generating recipes:", error);
    throw new Error("Kitchen mein shayad gas khatam ho gayi hai! Please try again in a moment.");
  }
};
