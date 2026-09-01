import React from 'react';
import { Zap, Shield, Smile, BookOpen, Mic, Sparkles, Sliders, Info, Check } from 'lucide-react';
import { TonePreset } from '../types';

interface ToneSelectorProps {
  tones: TonePreset[];
  selectedToneId: string;
  onSelectTone: (tone: TonePreset) => void;
  customMood: string;
  onChangeCustomMood: (mood: string) => void;
  enforceStatsRule: boolean;
  onToggleStatsRule: (val: boolean) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-4 h-4" />,
  Shield: <Shield className="w-4 h-4" />,
  Smile: <Smile className="w-4 h-4" />,
  BookOpen: <BookOpen className="w-4 h-4" />,
  Mic: <Mic className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
};

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  tones,
  selectedToneId,
  onSelectTone,
  customMood,
  onChangeCustomMood,
  enforceStatsRule,
  onToggleStatsRule,
}) => {
  return (
    <div id="tone-selector-container" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            Speech Mood & Tone Presets (لہجہ اور انداز)
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Select the delivery style for your YouTube script voiceover
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-stone-800 border border-stone-700 text-stone-300 font-medium">
          6 Specialized Tones
        </span>
      </div>

      {/* Tone Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tones.map((tone) => {
          const isSelected = selectedToneId === tone.id;
          return (
            <button
              key={tone.id}
              id={`tone-btn-${tone.id}`}
              onClick={() => onSelectTone(tone)}
              type="button"
              className={`text-left p-3.5 rounded-xl border transition-all duration-200 relative group cursor-pointer ${
                isSelected
                  ? 'bg-stone-800/90 border-amber-400 ring-2 ring-amber-400/20 shadow-lg shadow-amber-950/20'
                  : 'bg-stone-850/50 hover:bg-stone-800/70 border-stone-750 hover:border-stone-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isSelected ? 'bg-amber-400/20 text-amber-300' : 'bg-stone-700/50 text-stone-400 group-hover:text-stone-200'
                    }`}
                  >
                    {iconMap[tone.iconName] || <Sparkles className="w-4 h-4" />}
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${tone.badgeColor}`}>
                    {tone.tag}
                  </span>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              <h4 className={`text-sm font-semibold mb-1 ${isSelected ? 'text-white' : 'text-stone-200'}`}>
                {tone.label}
              </h4>

              <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                {tone.description}
              </p>

              <div className="mt-2.5 pt-2 border-t border-stone-700/40 flex items-center justify-between text-[11px] text-stone-400">
                <span>Speed: {tone.suggestedSpeed}x</span>
                <span>Pitch: {tone.suggestedPitch > 0 ? `+${tone.suggestedPitch}` : tone.suggestedPitch}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* General tips rule banner */}
      <div
        id="general-tips-banner"
        className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-amber-200">
              General Tip (اعداد و شمار کا اصول):
            </div>
            <p className="text-stone-300 mt-0.5 font-medium">
              &quot;Numbers/stats hamesha thora slow aur clear bolein&quot; — Automatically paces dates, percentages, and metrics.
            </p>
          </div>
        </div>

        <button
          type="button"
          id="toggle-stats-rule-btn"
          onClick={() => onToggleStatsRule(!enforceStatsRule)}
          className={`shrink-0 px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            enforceStatsRule
              ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-sm'
              : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
          }`}
        >
          {enforceStatsRule ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
          {enforceStatsRule ? 'Pacing Active' : 'Pacing Inactive'}
        </button>
      </div>

      {/* Custom Mood Input */}
      <div className="p-3.5 rounded-xl bg-stone-850 border border-stone-750 space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="custom-mood-input" className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Custom Mood & Emotion Nuances (اضافی ہدایات):
          </label>
          <span className="text-[11px] text-stone-400">Optional director notes</span>
        </div>
        <input
          id="custom-mood-input"
          type="text"
          value={customMood}
          onChange={(e) => onChangeCustomMood(e.target.value)}
          placeholder="e.g. Add subtle suspense, cheerful podcast vibe, investigative tone, crisp Urdu accent..."
          className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
        />
      </div>
    </div>
  );
};
