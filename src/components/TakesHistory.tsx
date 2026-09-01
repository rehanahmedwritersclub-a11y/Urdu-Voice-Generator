import React from 'react';
import { History, Play, Pause, Download, Trash2, Clock, Check, Sparkles } from 'lucide-react';
import { AudioTake } from '../types';
import { formatTime, downloadWavFile } from '../utils/audioUtils';

interface TakesHistoryProps {
  takes: AudioTake[];
  currentTakeId: string | null;
  isPlaying: boolean;
  onSelectTake: (take: AudioTake) => void;
  onDeleteTake: (id: string) => void;
}

export const TakesHistory: React.FC<TakesHistoryProps> = ({
  takes,
  currentTakeId,
  isPlaying,
  onSelectTake,
  onDeleteTake,
}) => {
  if (takes.length === 0) {
    return (
      <div id="takes-history-empty" className="bg-stone-850 border border-stone-750 rounded-2xl p-6 text-center space-y-2">
        <div className="w-10 h-10 mx-auto rounded-full bg-stone-800 text-stone-400 flex items-center justify-center">
          <History className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-stone-200">No Audio Takes Yet</h4>
        <p className="text-xs text-stone-400 max-w-sm mx-auto">
          Generated Urdu script audio recordings will be archived here with tone and speed tags so you can compare multiple takes.
        </p>
      </div>
    );
  }

  return (
    <div id="takes-history-panel" className="bg-stone-850 border border-stone-750 rounded-2xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between border-b border-stone-750 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-200">
            Recorded Takes History (ریکارڈ شدہ آڈیوز)
          </h3>
        </div>
        <span className="text-xs text-stone-400">
          {takes.length} {takes.length === 1 ? 'Take' : 'Takes'} Saved
        </span>
      </div>

      <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
        {takes.map((take) => {
          const isSelected = currentTakeId === take.id;
          return (
            <div
              key={take.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-400/80 ring-1 ring-amber-400/20'
                  : 'bg-stone-900/70 border-stone-750 hover:border-stone-650'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onSelectTake(take)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer ${
                    isSelected && isPlaying
                      ? 'bg-amber-400 text-stone-950 shadow-md'
                      : 'bg-stone-800 hover:bg-stone-750 text-stone-200'
                  }`}
                  title={isSelected && isPlaying ? 'Pause Take' : 'Play Take'}
                >
                  {isSelected && isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold text-stone-100 truncate">
                      {take.title}
                    </span>
                    <span className={`text-[10px] px-2 py-0.2 rounded-full border font-medium ${take.tone.badgeColor}`}>
                      {take.tone.label}
                    </span>
                  </div>

                  <p className="text-xs text-stone-400 truncate line-clamp-1">
                    {take.textSnippet}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-stone-500 mt-1 flex-wrap font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(take.durationSeconds)}
                    </span>
                    <span>Voice: {take.voiceName}</span>
                    <span>Speed: {take.speed}x</span>
                    <span>Pitch: {take.pitch > 0 ? `+${take.pitch}` : take.pitch}</span>
                    <span>{new Date(take.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => downloadWavFile(take.audioBase64, `Urdu_${take.tone.id}_take.wav`)}
                  className="p-2 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-amber-300 transition-colors cursor-pointer"
                  title="Download WAV"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteTake(take.id)}
                  className="p-2 rounded-lg bg-stone-800 hover:bg-rose-950/40 text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete take"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
