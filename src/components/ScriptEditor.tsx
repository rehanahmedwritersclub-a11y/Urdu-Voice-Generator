import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  BookOpen,
  RotateCcw,
  Copy,
  Check,
  Languages,
  Clock,
  Hash,
  Wand2,
  Play,
  Loader2,
  ListOrdered,
  Layers,
} from 'lucide-react';
import { ScriptSample } from '../types';
import { countWordsAndStats } from '../utils/audioUtils';

interface ScriptEditorProps {
  scriptText: string;
  onChangeScriptText: (text: string) => void;
  samples: ScriptSample[];
  onSelectSample: (sample: ScriptSample) => void;
  onGenerateSpeech: () => void;
  isGenerating: boolean;
  onOpenAnalysisModal?: () => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  scriptText,
  onChangeScriptText,
  samples,
  onSelectSample,
  onGenerateSpeech,
  isGenerating,
  onOpenAnalysisModal,
}) => {
  const [fontMode, setFontMode] = useState<'nastaliq' | 'clean' | 'standard'>('nastaliq');
  const [isCopied, setIsCopied] = useState(false);
  const [showSamplesDropdown, setShowSamplesDropdown] = useState(false);

  const stats = countWordsAndStats(scriptText);

  const handleCopy = () => {
    if (!scriptText) return;
    navigator.clipboard.writeText(scriptText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getEditorFontClass = () => {
    if (fontMode === 'nastaliq') return 'font-urdu text-lg leading-[2.4] text-right';
    if (fontMode === 'clean') return 'font-arabic-clean text-base leading-[2.0] text-right';
    return 'font-sans text-sm leading-relaxed text-left';
  };

  return (
    <div id="script-editor-container" className="bg-stone-850 border border-stone-750 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Editor Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-750 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-200">
            YouTube Urdu Script (اسکرپٹ ایڈیٹر)
          </h3>
        </div>

        {/* Script Toolbar Options */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sample Scripts Selector */}
          <div className="relative">
            <button
              id="samples-dropdown-btn"
              type="button"
              onClick={() => setShowSamplesDropdown(!showSamplesDropdown)}
              className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              Sample Scripts (نمونہ اسکرپٹ)
            </button>

            {showSamplesDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl z-30 p-2 space-y-1">
                <div className="text-[11px] font-semibold text-stone-400 px-2 py-1 uppercase tracking-wider">
                  Select YouTube Genre:
                </div>
                {samples.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      onSelectSample(sample);
                      setShowSamplesDropdown(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-stone-800 text-xs text-stone-200 hover:text-white transition-colors cursor-pointer block"
                  >
                    <div className="font-semibold text-amber-300">{sample.title}</div>
                    <div className="text-[10px] text-stone-400">{sample.genre}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AI Script Section Analyzer */}
          {onOpenAnalysisModal && (
            <button
              id="open-analyzer-btn"
              type="button"
              onClick={onOpenAnalysisModal}
              disabled={!scriptText.trim()}
              className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
            >
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
              Auto Breakdown
            </button>
          )}

          {/* Typography View Toggle */}
          <div className="flex bg-stone-900 p-0.5 rounded-lg border border-stone-750">
            <button
              type="button"
              onClick={() => setFontMode('nastaliq')}
              className={`px-2 py-1 text-[11px] rounded-md font-medium transition-colors cursor-pointer ${
                fontMode === 'nastaliq' ? 'bg-amber-400 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Urdu Nastaliq Calligraphy"
            >
              نستعلیق
            </button>
            <button
              type="button"
              onClick={() => setFontMode('clean')}
              className={`px-2 py-1 text-[11px] rounded-md font-medium transition-colors cursor-pointer ${
                fontMode === 'clean' ? 'bg-amber-400 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Clean Arabic/Urdu Sans"
            >
              عربی فونٹس
            </button>
            <button
              type="button"
              onClick={() => setFontMode('standard')}
              className={`px-2 py-1 text-[11px] rounded-md font-medium transition-colors cursor-pointer ${
                fontMode === 'standard' ? 'bg-amber-400 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Roman Urdu / English Font"
            >
              Roman / En
            </button>
          </div>

          {/* Copy Script */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!scriptText}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
            title="Copy script text"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear button */}
          <button
            type="button"
            onClick={() => onChangeScriptText('')}
            disabled={!scriptText}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-300 hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-40"
            title="Clear editor"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          id="urdu-script-input"
          value={scriptText}
          onChange={(e) => onChangeScriptText(e.target.value)}
          placeholder="یہاں اپنا یوٹیوب ویڈیو اسکرپٹ لکھیں یا پیسٹ کریں (Urdu Nastaliq or Roman Urdu)..."
          dir={fontMode === 'standard' ? 'ltr' : 'rtl'}
          className={`w-full min-h-[260px] bg-stone-900/90 border border-stone-700 rounded-xl p-4 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all ${getEditorFontClass()}`}
        />
      </div>

      {/* Script Metrics & Generate CTA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-stone-750/70">
        {/* Statistics and Duration pill */}
        <div className="flex items-center gap-4 text-xs text-stone-400 flex-wrap">
          <span className="flex items-center gap-1">
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <strong className="text-stone-200">{stats.wordCount}</strong> words
          </span>

          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Est. Narration: <strong className="text-stone-200">~{stats.estReadingTimeSec}s</strong>
          </span>

          {stats.statsCount > 0 && (
            <span className="flex items-center gap-1 text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
              <Hash className="w-3.5 h-3.5" />
              <strong>{stats.statsCount}</strong> numbers/stats (slow pacing applied)
            </span>
          )}
        </div>

        {/* Primary Speech Generation Button */}
        <button
          id="generate-speech-btn"
          type="button"
          onClick={onGenerateSpeech}
          disabled={isGenerating || !scriptText.trim()}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Urdu Voiceover... (صدا کاری جاری ہے)</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Audio Voiceover (آواز تیار کریں)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
