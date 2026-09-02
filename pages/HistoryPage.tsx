import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { useAuth } from "../src/context/AuthContext";
import {
  getRecipeHistory,
  RecipeHistory,
} from "../services/recipeHistory";

const HistoryPage: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState<RecipeHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      if (loading) return;

      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const userHistory = await getRecipeHistory(currentUser.uid);

        setHistory(userHistory);
      } catch (err) {
        console.error("Error loading history:", err);
        setError("Recipe history load nahi ho saki. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [currentUser, loading, navigate]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) {
      return "Just now";
    }

    try {
      const date = timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp);

      return date.toLocaleString("en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "Unknown date";
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <i className="fa-solid fa-spinner animate-spin text-4xl text-emerald-600 mb-4"></i>

            <p className="text-slate-500">
              Loading your recipe history...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold uppercase tracking-wider mb-4">
            Your Kitchen
          </span>

          <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            My Recipe History
          </h1>

          <p className="text-slate-500 text-lg">
            Aap ne pehle kin ingredients se recipes generate ki thin,
            sab yahan milengi.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700">
            <i className="fa-solid fa-triangle-exclamation mr-2"></i>
            {error}
          </div>
        )}

        {/* Empty State */}
        {!error && history.length === 0 && (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-emerald-50 flex items-center justify-center">
              <i className="fa-solid fa-clock-rotate-left text-3xl text-emerald-600"></i>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              No Recipe History Yet
            </h2>

            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Jab aap recipes generate karein ge, unki history automatically
              yahan save ho jayegi.
            </p>

            <button
              onClick={() => navigate("/")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3 rounded-2xl font-bold transition-all"
            >
              <i className="fa-solid fa-fire-burner mr-2"></i>
              Generate Recipes
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-6">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8"
              >
                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">
                  <i className="fa-regular fa-clock"></i>
                  <span>{formatDate(item.createdAt)}</span>
                </div>

                {/* Ingredients */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg text-slate-900 mb-2">
                    Ingredients
                  </h3>

                  <div className="bg-emerald-50 text-emerald-800 rounded-2xl px-5 py-4">
                    {item.ingredients}
                  </div>
                </div>

                {/* Preferences */}
                {item.preferences && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium">
                      🌶️ {item.preferences.spiciness}
                    </span>

                    {item.preferences.isVeg && (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium">
                        🌱 Vegetarian
                      </span>
                    )}

                    {item.preferences.isQuick && (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-sm font-medium">
                        ⚡ Quick Recipes
                      </span>
                    )}
                  </div>
                )}

                {/* Recipes */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-slate-900">
                      Generated Recipes
                    </h3>

                    <span className="text-sm text-slate-400">
                      {item.recipes?.length || 0} Recipes
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.recipes?.map((recipe, index) => (
                      <div
                        key={`${item.id}-${index}`}
                        className="border border-slate-100 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h4 className="font-bold text-slate-900 text-lg">
                            {recipe.name}
                          </h4>

                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 whitespace-nowrap">
                            {recipe.difficulty}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <i className="fa-regular fa-clock"></i>
                          {recipe.time}
                        </div>

                        <div className="mt-4">
                        <h5 className="font-semibold text-slate-700 mb-2">
                            Cooking Steps
                        </h5>

                        <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
                            {recipe.steps?.map((step, stepIndex) => (
                            <li key={stepIndex}>
                                {step}
                            </li>
                            ))}
                        </ol>
                        </div>
                        
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;