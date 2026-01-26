
import React, { useState, useRef } from 'react';
import { AppState, Recipe } from './types';
import { generateRecipes } from './services/geminiService';
import RecipeCard from './components/RecipeCard';
import { Analytics } from '@vercel/analytics/react';

const SUGGESTED_TAGS = [
  "Chicken", "Aloo", "Tamatar", "Pyaaz", "Dahi", "Palak", "Anda", "Daal", "Keema", "Bhindi"
];

const SURPRISE_SETS = [
  "Chicken, Tamatar, Dahi, Hari Mirch",
  "Aloo, Matar, Gajar, Masala",
  "Daal Mash, Lehsun, Pyaaz, Makhan",
  "Anda, Pyaaz, Hari Mirch, Bread",
  "Mutton, Dahi, Pyaaz, Garam Masala"
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    ingredients: '',
    recipes: [],
    isLoading: false,
    error: null,
    preferences: {
      spiciness: 'Normal',
      isVeg: false,
      isQuick: false,
    }
  });

  const toolRef = useRef<HTMLDivElement>(null);

  const scrollToTool = () => {
    toolRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(prev => ({ ...prev, ingredients: e.target.value }));
  };

  const addTag = (tag: string) => {
    setState(prev => {
      const current = prev.ingredients.trim();
      const separator = current ? ', ' : '';
      if (current.toLowerCase().includes(tag.toLowerCase())) return prev;
      return { ...prev, ingredients: `${current}${separator}${tag}` };
    });
  };

  const handleSurprise = () => {
    const randomSet = SURPRISE_SETS[Math.floor(Math.random() * SURPRISE_SETS.length)];
    setState(prev => ({ ...prev, ingredients: randomSet }));
  };

  const handleFormSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!state.ingredients.trim()) return;

    setState(prev => ({ ...prev, isLoading: true, error: null, recipes: [] }));
    
    // Add preferences to the prompt internally
    const preferenceString = ` Preferences: Spiciness: ${state.preferences.spiciness}, ${state.preferences.isVeg ? 'Vegetarian only,' : ''} ${state.preferences.isQuick ? 'Quick recipes preferred.' : ''}`;
    
    try {
      const suggestedRecipes = await generateRecipes(state.ingredients + preferenceString);
      setState(prev => ({
        ...prev,
        recipes: suggestedRecipes,
        isLoading: false,
      }));
      // Scroll to results if not already in view
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || "Something went wrong.",
      }));
    }
  };

  const togglePref = (key: keyof AppState['preferences']) => {
    setState(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: typeof prev.preferences[key] === 'boolean' ? !prev.preferences[key] : prev.preferences[key]
      }
    }));
  };

  return (
    <div className="relative overflow-hidden">
      <div className="fixed inset-0 bg-pattern no-print -z-10"></div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 no-print">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
              <i className="fa-solid fa-fire-burner"></i>
            </div>
            <span className="font-serif text-2xl font-bold text-slate-900">Aj Kya Pakayen?</span>
          </div>
          <button 
            onClick={scrollToTool}
            className="hidden md:block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-emerald-100"
          >
            Start Cooking
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 px-6 no-print">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-bold mb-6 uppercase tracking-wider">
            100% Free Pakistani Recipe AI
          </span>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Kitchen mein jo bhi hai,<br/>
            <span className="text-emerald-600">Mazaydar Desi Recipes</span> payein!
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Don't know what to cook today? Just tell us what ingredients you have, and our AI Chef will suggest the perfect Pakistani meal for you.
          </p>
        </div>

        {/* Main Tool Container */}
        <div ref={toolRef} className="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 border border-slate-100 p-8 md:p-12 relative z-10">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center text-white shadow-xl rotate-12 hidden md:flex">
            <i className="fa-solid fa-utensils text-2xl"></i>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-8">
            <div className="relative">
              <label className="block text-slate-800 font-bold text-xl mb-4 flex items-center justify-between">
                What's in your fridge?
                <button 
                  type="button" 
                  onClick={handleSurprise}
                  className="text-sm font-medium text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  Surprise Me
                </button>
              </label>
              <textarea
                className="w-full px-6 py-5 rounded-3xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-lg min-h-[140px] resize-none"
                placeholder="Chicken, Pyaaz, Tamatar, Dahi, Palak..."
                value={state.ingredients}
                onChange={handleInputChange}
              ></textarea>
              <div className="flex flex-wrap gap-2 mt-4">
                {SUGGESTED_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="px-4 py-2 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 rounded-xl text-sm font-medium transition-all"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-50 pt-8">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                <i className="fa-solid fa-pepper-hot text-rose-500"></i>
                <select 
                  className="bg-transparent font-semibold outline-none w-full"
                  value={state.preferences.spiciness}
                  onChange={(e) => setState(prev => ({ ...prev, preferences: { ...prev.preferences, spiciness: e.target.value as any }}))}
                >
                  <option>Normal</option>
                  <option>Spicy</option>
                  <option>Mild</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => togglePref('isVeg')}
                className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all font-semibold ${state.preferences.isVeg ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-transparent'}`}
              >
                <i className="fa-solid fa-leaf text-emerald-500"></i>
                Veg Only
              </button>
              <button
                type="button"
                onClick={() => togglePref('isQuick')}
                className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all font-semibold ${state.preferences.isQuick ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-slate-50 border-transparent'}`}
              >
                <i className="fa-solid fa-bolt text-amber-500"></i>
                Quick Recipes
              </button>
            </div>

            <button
              disabled={state.isLoading || !state.ingredients.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-5 rounded-[1.5rem] font-bold text-xl shadow-xl shadow-emerald-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-4"
            >
              {state.isLoading ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin"></i>
                  Abhi batatay hain...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-fire-burner"></i>
                  Suggest Recipes!
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-emerald-900 py-12 text-white no-print">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-1">50k+</div>
            <div className="text-emerald-200/60 text-sm uppercase tracking-widest">Recipes Generated</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">98%</div>
            <div className="text-emerald-200/60 text-sm uppercase tracking-widest">Desi Tarka</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">120+</div>
            <div className="text-emerald-200/60 text-sm uppercase tracking-widest">Common Ingredients</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">24/7</div>
            <div className="text-emerald-200/60 text-sm uppercase tracking-widest">Chef Assistance</div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 px-6 no-print">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-4">How it Works</h2>
            <div className="w-24 h-1.5 bg-emerald-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: 'fa-basket-shopping', title: 'Add Ingredients', text: 'Just type what you have in your kitchen.' },
              { icon: 'fa-brain', title: 'AI Magic', text: 'Our Pakistani Chef AI scans traditional recipes for the best match.' },
              { icon: 'fa-plate-wheat', title: 'Enjoy Your Meal', text: 'Get step-by-step instructions in Roman Urdu/English.' }
            ].map((step, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 bg-white shadow-xl rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all text-emerald-600">
                  <i className={`fa-solid ${step.icon} text-3xl`}></i>
                </div>
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50 px-6 no-print">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif text-4xl font-bold mb-8">Why use Aj Kya Pakayen?</h2>
              <div className="space-y-6">
                {[
                  { icon: 'fa-language', color: 'text-blue-500', bg: 'bg-blue-50', title: 'Roman Urdu Support', text: 'Easy to read and understand for everyone.' },
                  { icon: 'fa-heart-pulse', color: 'text-rose-500', bg: 'bg-rose-50', title: 'Home-style Cooking', text: 'No fancy techniques, just pure desi taste.' },
                  { icon: 'fa-scale-balanced', color: 'text-amber-500', bg: 'bg-amber-50', title: 'Accurate Portions', text: 'Measurements you actually use in your kitchen.' },
                  { icon: 'fa-mobile-screen-button', color: 'text-emerald-500', bg: 'bg-emerald-50', title: 'Mobile First', text: 'Works perfectly on your phone while cooking.' }
                ].map((f, i) => (
                  <div key={i} className="flex gap-6">
                    <div className={`w-12 h-12 rounded-xl flex-shrink-0 ${f.bg} ${f.color} flex items-center justify-center`}>
                      <i className={`fa-solid ${f.icon} text-xl`}></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{f.title}</h4>
                      <p className="text-slate-500">{f.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-4 rounded-[2rem] shadow-2xl rotate-2">
              <img 
                src="upload/about-img.jpg"
                alt="Pakistani Food" 
                className="rounded-[1.5rem] w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Results Section */}
      <section id="results-section" className="py-24 max-w-6xl mx-auto px-6">
        {state.error && (
          <div className="p-8 bg-rose-50 border border-rose-200 text-rose-700 rounded-3xl flex items-center gap-6 mb-12">
            <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
            <div>
              <h4 className="font-bold text-lg">Haye Allah! Error agaya.</h4>
              <p>{state.error}</p>
            </div>
          </div>
        )}

        {state.recipes.length > 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="font-serif text-4xl font-bold mb-2">Aaj ke Special Recipes</h2>
                <p className="text-slate-500 italic">"Ghar ka khana, sabse achha!"</p>
              </div>
              <button onClick={() => window.print()} className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2 no-print shadow-sm">
                <i className="fa-solid fa-print"></i>
                Save All as PDF
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-1">
              {state.recipes.map((recipe, index) => (
                <RecipeCard key={index} recipe={recipe} />
              ))}
            </div>
          </div>
        ) : (
          !state.isLoading && (
            <div className="text-center py-20 bg-emerald-50 rounded-[3rem] no-print">
              <i className="fa-solid fa-cookie-bite text-6xl text-emerald-200 mb-6 block"></i>
              <h3 className="text-2xl font-bold text-emerald-900 mb-2">Ready to Cook?</h3>
              <p className="text-emerald-700/60 max-w-sm mx-auto">Ingredients upar box mein likhein aur "Suggest Recipes" button dabayein!</p>
            </div>
          )
        )}
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 no-print">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold mb-4">Ghar ki Chef kya kehti hain?</h2>
            <p className="text-slate-500 italic">Join thousands of happy home cooks</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Fatima B.", text: "Pehli baar Chicken Karahi itni perfect bani! Steps bohot simple hain." },
              { name: "Sajid Khan", text: "Office se thaka hua aya tha, tool ne bataya Aloo ki Bhujia kaise jaldi ban sakti hai. Genius!" },
              { name: "Amina R.", text: "Surprise Me feature is my favorite. Jab kuch samajh na aye, bas click karein." }
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-lg border border-slate-50">
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, j) => <i key={j} className="fa-solid fa-star text-xs"></i>)}
                </div>
                <p className="text-slate-600 mb-6 italic">"{t.text}"</p>
                <div className="font-bold text-slate-900">— {t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 no-print">
        <div className="max-w-4xl mx-auto bg-emerald-600 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <i className="fa-solid fa-bowl-food text-9xl"></i>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">Toh phir, Aaj kya paka rahi hain?</h2>
          <p className="text-xl text-emerald-100 mb-10 max-w-xl mx-auto">
            Don't waste time thinking. Let AI decide your menu today.
          </p>
          <button 
            onClick={scrollToTool}
            className="bg-white text-emerald-600 px-10 py-4 rounded-2xl font-bold text-xl hover:bg-emerald-50 transition-all shadow-2xl shadow-emerald-900/20"
          >
            Go to Tool
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-20 px-6 no-print">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-800 pb-16 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-white mb-6">
              <i className="fa-solid fa-fire-burner text-2xl text-emerald-500"></i>
              <span className="font-serif text-2xl font-bold">Aj Kya Pakayen?</span>
            </div>
            <p className="max-w-sm mb-8">
              The world's first AI-powered Pakistani Home Chef designed to make your daily cooking decisions stress-free and delicious.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <i className="fa-brands fa-instagram text-white"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <i className="fa-brands fa-facebook-f text-white"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <i className="fa-brands fa-tiktok text-white"></i>
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><button onClick={scrollToTool} className="hover:text-emerald-500 transition-colors">Generate Recipes</button></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Popular Dishes</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Spices Guide</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Cooking Tips</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Aj Kya Pakayen? - 
            <a target="_blank" href="https://webbyharis.com/"> Web By Haris</a>
          </p>
          <p className="mt-2 italic opacity-50">Note: AI can make mistakes, please use your common sense while cooking!</p>
        </div>
      </footer>
      <Analytics />
    </div>
  );
};

export default App;
