
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  recipeId: string;
  activeTtsRecipeId: string | null;
  setActiveTtsRecipeId: (id: string | null) => void;
}

type TtsStatus = 'idle' | 'playing' | 'paused';

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  recipeId,
  activeTtsRecipeId,
  setActiveTtsRecipeId,
}) => {
  const isTtsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const isActive = activeTtsRecipeId === recipeId;

  const [ttsStatus, setTtsStatus] = useState<TtsStatus>('idle');
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const activeRef = useRef(isActive);
  useEffect(() => {
    activeRef.current = isActive;
  }, [isActive]);

  // Load speech voices (browsers often populate getVoices() asynchronously).
  useEffect(() => {
    if (!isTtsSupported) return;
    const synth = window.speechSynthesis;
    const load = () => setVoices(synth.getVoices?.() ?? []);
    load();
    synth.onvoiceschanged = load;
    return () => { try { synth.onvoiceschanged = null; } catch {} };
  }, [isTtsSupported]);

  // Prefer Urdu > Hindi > Indian English for Roman Urdu.
  const { preferredVoice, preferredLang } = useMemo(() => {
    const list = voices;
    const by = (p: (v: SpeechSynthesisVoice) => boolean) => list.find(p);
    const byLang = (lang: string) => by(v => (v.lang || '').toLowerCase().startsWith(lang));
    const ur = byLang('ur') || by(v => (v.lang || '').toLowerCase() === 'ur-pk');
    const hi = byLang('hi') || by(v => (v.lang || '').toLowerCase() === 'hi-in');
    const enIn = by(v => (v.lang || '').toLowerCase() === 'en-in');
    const v = ur || hi || enIn || list[0] || null;
    let lang = 'en-IN';
    if (v) {
      const l = (v.lang || '').toLowerCase();
      if (l.startsWith('ur')) lang = 'ur-PK';
      else if (l.startsWith('hi')) lang = 'hi-IN';
      else if (l.startsWith('en')) lang = 'en-IN';
    }
    return { preferredVoice: v, preferredLang: lang };
  }, [voices]);

  const steps = useMemo(
    () => (Array.isArray(recipe.steps) ? recipe.steps.filter(Boolean) : []),
    [recipe.steps]
  );

  const stopLocal = () => {
    // Cancels ALL current utterances (global), which is exactly what we want
    // to guarantee only one recipe plays at a time.
    window.speechSynthesis?.cancel?.();
    setTtsStatus('idle');
    setActiveStepIndex(null);
  };

  // If another card becomes active, stop + clear highlighting here.
  useEffect(() => {
    if (!isActive && ttsStatus !== 'idle') {
      stopLocal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // If speech ends via browser controls / external cancel, make sure UI resets.
  useEffect(() => {
    if (!isTtsSupported) return;

    const synth = window.speechSynthesis;
    const handleEndLike = () => {
      if (!synth.speaking && !synth.paused) {
        setTtsStatus('idle');
        setActiveStepIndex(null);
        if (activeRef.current) setActiveTtsRecipeId(null);
      }
    };

    // Not all browsers fire consistent global events; polling is safer and cheap.
    const interval = window.setInterval(handleEndLike, 250);
    return () => window.clearInterval(interval);
  }, [isTtsSupported, setActiveTtsRecipeId]);

  const speakFrom = (startIndex: number) => {
    const synth = window.speechSynthesis;
    if (!synth || !steps.length) return;

    synth.cancel();

    const speakStep = (i: number) => {
      if (!activeRef.current) return;
      if (i < 0 || i >= steps.length) return;

      const text = steps[i].trim();
      if (!text) return speakStep(i + 1);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = preferredLang;
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setTtsStatus('playing');
        setActiveStepIndex(i);
      };

      utterance.onend = () => {
        if (!activeRef.current) return;
        if (i + 1 < steps.length) {
          speakStep(i + 1);
        } else {
          setTtsStatus('idle');
          setActiveStepIndex(null);
          setActiveTtsRecipeId(null);
        }
      };

      utterance.onerror = () => {
        if (!activeRef.current) return;
        setTtsStatus('idle');
        setActiveStepIndex(null);
        setActiveTtsRecipeId(null);
      };

      synth.speak(utterance);
    };

    speakStep(startIndex);
  };

  const handlePlay = () => {
    if (!isTtsSupported || steps.length === 0) return;

    // Claim global active ownership; other cards will stop via their effect.
    setActiveTtsRecipeId(recipeId);
    // React state updates async; ensure our speak loop doesn't bail before `isActive` re-renders.
    activeRef.current = true;

    const synth = window.speechSynthesis;

    if (isActive && ttsStatus === 'paused' && synth?.paused) {
      synth.resume();
      setTtsStatus('playing');
      return;
    }

    speakFrom(0);
  };

  const handlePause = () => {
    if (!isTtsSupported) return;
    const synth = window.speechSynthesis;
    if (!isActive) return;
    if (synth?.speaking && !synth.paused) {
      synth.pause();
      setTtsStatus('paused');
    }
  };

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
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-semibold text-slate-700 flex items-center gap-2">
              <i className="fa-solid fa-list-check text-slate-400 text-sm"></i>
              Cooking Steps
            </h4>

            <div className="flex items-center gap-2 no-print">
              <button
                type="button"
                onClick={handlePlay}
                disabled={!isTtsSupported || steps.length === 0}
                className="text-slate-600 hover:text-emerald-700 font-semibold text-xs flex items-center gap-2 transition-colors py-2 px-3 rounded-lg hover:bg-emerald-50 disabled:opacity-40 disabled:hover:bg-transparent"
                title={!isTtsSupported ? 'Text-to-Speech not supported in this browser' : 'Play / Resume'}
              >
                <i className="fa-solid fa-play"></i>
                {isActive && ttsStatus === 'paused' ? 'Resume' : 'Play'}
              </button>
              <button
                type="button"
                onClick={handlePause}
                disabled={!isTtsSupported || !isActive || ttsStatus !== 'playing'}
                className="text-slate-600 hover:text-amber-700 font-semibold text-xs flex items-center gap-2 transition-colors py-2 px-3 rounded-lg hover:bg-amber-50 disabled:opacity-40 disabled:hover:bg-transparent"
                title="Pause"
              >
                <i className="fa-solid fa-pause"></i>
                Pause
              </button>
            </div>
          </div>
          <ol className="space-y-3">
            {recipe.steps.map((step, index) => (
              <li
                key={index}
                className={`flex gap-3 text-sm leading-relaxed rounded-xl p-2 -mx-2 transition-colors ${
                  isActive && activeStepIndex === index
                    ? 'bg-emerald-50 text-emerald-900'
                    : 'text-slate-600'
                }`}
              >
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    isActive && activeStepIndex === index
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
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
