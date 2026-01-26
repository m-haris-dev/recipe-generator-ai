
import React from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow recipe-card">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-slate-800 leading-tight">
            {recipe.name}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            recipe.difficulty.toLowerCase().includes('easy') ? 'bg-green-100 text-green-700' : 
            recipe.difficulty.toLowerCase().includes('medium') ? 'bg-amber-100 text-amber-700' : 
            'bg-rose-100 text-rose-700'
          }`}>
            {recipe.difficulty}
          </span>
        </div>

        <div className="flex gap-4 mb-6 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <i className="fa-regular fa-clock text-amber-500"></i>
            <span>{recipe.time}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <i className="fa-solid fa-utensils text-emerald-500"></i>
            <span>Pakistani / Desi</span>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-slate-700 border-b pb-2 flex items-center gap-2">
            <i className="fa-solid fa-list-check text-slate-400 text-sm"></i>
            Cooking Steps
          </h4>
          <ol className="space-y-3">
            {recipe.steps.map((step, index) => (
              <li key={index} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                  {index + 1}
                </span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="bg-slate-50 px-6 py-4 flex justify-end no-print">
        <button 
          onClick={() => window.print()}
          className="text-slate-500 hover:text-emerald-600 font-medium text-sm flex items-center gap-2 transition-colors py-2 px-4 rounded-lg hover:bg-emerald-50"
        >
          <i className="fa-solid fa-file-pdf"></i>
          Save as PDF / Print
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
