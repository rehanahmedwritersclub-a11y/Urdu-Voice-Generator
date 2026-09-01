import React, { useState } from 'react';
import { X, Wand2, Sparkles, Check, ArrowRight, Play, Loader2, Volume2 } from 'lucide-react';
import { TonePreset } from '../types';

interface ScriptAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptText: string;
  tones: TonePreset[];
  onApplySectionTone: (text: string, toneId: string) => void;
}

interface ScriptSectionAnalysis {
  sectionName: string;
  text: string;
  recommendedToneId: string;
  hasStats: boolean;
  directorNote: string;
}

export const ScriptAnalysisModal: React.FC<ScriptAnalysisModalProps> = ({
  isOpen,
  onClose,
  scriptText,
  tones,
  onApplySectionTone,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    sections: ScriptSectionAnalysis[];
    statsCount: number;
    tips: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAnalysis = async () => {
    try {
      setAnalyzing(true);
      setError(null);

      const res = await fetch('/api/script/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: scriptText }),
      });

      if (!res.ok) {
        throw new Error('Analysis failed');
      }

      const data = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze script');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-750 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Urdu YouTube Script Breakdown & Tone Director
              </h3>
              <p className="text-xs text-stone-400">
                Segment your script by YouTube engagement points with recommended tones
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {!analysisResult && !analyzing && (
            <div className="text-center py-8 space-y-4">
              <p className="text-xs text-stone-300 max-w-md mx-auto leading-relaxed">
                Our AI Director analyzes your Urdu script, detects viral hooks, key explanations, stats sections, and calls to action, mapping each chunk to the optimal tone preset.
              </p>
              <button
                type="button"
                onClick={handleRunAnalysis}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 mx-auto shadow-lg shadow-purple-950/50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Analyze YouTube Script
              </button>
            </div>
          )}

          {analyzing && (
            <div className="text-center py-12 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400 mx-auto" />
              <div className="text-xs font-semibold text-stone-200">
                Analyzing Urdu pacing, stats, and sections...
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4">
              {analysisResult.tips && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/25 text-xs text-purple-200">
                  <strong>Director Advice:</strong> {analysisResult.tips}
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Detected Sections ({analysisResult.sections?.length || 0})
                </h4>

                {analysisResult.sections?.map((sec, idx) => {
                  const tone = tones.find((t) => t.id === sec.recommendedToneId) || tones[0];
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-stone-850 border border-stone-750 space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-stone-200 bg-stone-800 px-2 py-0.5 rounded">
                          {sec.sectionName}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md border font-medium ${tone.badgeColor}`}>
                          Recommended: {tone.label}
                        </span>
                      </div>

                      <p className="text-stone-300 text-right font-urdu text-sm leading-relaxed p-2 bg-stone-900/60 rounded-lg">
                        {sec.text}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                        <span>💡 {sec.directorNote}</span>
                        <button
                          type="button"
                          onClick={() => {
                            onApplySectionTone(sec.text, sec.recommendedToneId);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Load Section</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
