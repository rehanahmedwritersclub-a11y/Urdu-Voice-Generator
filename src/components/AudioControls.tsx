import React from 'react';
import { Volume2, Gauge, Activity, User, Sparkles } from 'lucide-react';
import { VoiceOption } from '../types';

interface AudioControlsProps {
  voices: VoiceOption[];
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string) => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  pitch: number;
  onChangePitch: (pitch: number) => void;
  elevenLabsApiKey?: string;
  onChangeElevenLabsApiKey?: (key: string) => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  voices,
  selectedVoiceId,
  onSelectVoice,
  speed,
  onChangeSpeed,
  pitch,
  onChangePitch,
  elevenLabsApiKey = '',
  onChangeElevenLabsApiKey,
}) => {
  const currentVoice = voices.find((v) => v.id === selectedVoiceId) || voices[0];
  const [showKeyInput, setShowKeyInput] = React.useState(false);

  const getPitchLabel = (p: number) => {
    if (p <= -3) return 'Very Deep & Heavy (بہت گہری آواز)';
    if (p === -2) return 'Deep Baritone (سنجیدہ / گہری)';
    if (p === -1) return 'Slightly Lower (ہلکی دھیمی)';
    if (p === 0) return 'Natural Register (قدرتی آواز)';
    if (p === 1) return 'Bright & Energetic (ہلکی بلند)';
    if (p === 2) return 'High Pitch (بلند آواز)';
    return 'Very High (زیادہ تیز)';
  };

  const getSpeedLabel = (s: number) => {
    if (s <= 0.8) return 'Slow & Deliberate (آہستہ)';
    if (s < 1.0) return 'Relaxed Paced (آرام دہ)';
    if (s === 1.0) return 'Standard Normal (معمول کی رفتار)';
    if (s <= 1.25) return 'Brisk YouTube Hook (تیز یوٹیوب رفتار)';
    return 'Very Fast & Urgent (انتہائی تیز)';
  };

  return (
    <div id="audio-controls-panel" className="bg-stone-850 border border-stone-750 rounded-2xl p-4 sm:p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-750 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-200 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-amber-400" />
          Voice, Speed & Pitch Controls (آواز اور رفتار کی ترتیبات)
        </h3>
        
        <div className="flex items-center gap-2">
          {currentVoice.isCustomClone && (
            <button
              type="button"
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-colors cursor-pointer"
            >
              🔑 {elevenLabsApiKey ? 'ElevenLabs Key Configured' : 'Enter ElevenLabs API Key'}
            </button>
          )}
          <span className="text-xs text-amber-400/90 font-medium flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
            <Sparkles className="w-3 h-3" />
            {currentVoice.isCustomClone ? 'ElevenLabs Multilingual v2' : 'Studio High-Fidelity'}
          </span>
        </div>
      </div>

      {/* ElevenLabs API Key Input Banner if needed */}
      {showKeyInput && onChangeElevenLabsApiKey && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between text-emerald-200 font-semibold">
            <span>ElevenLabs API Key for Cloned Voice:</span>
            <span className="text-[10px] text-stone-400">Voice ID: 5T2fl2GVB1wv1t0Z9hEW</span>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Paste ElevenLabs API Key (xi-...)"
              value={elevenLabsApiKey}
              onChange={(e) => onChangeElevenLabsApiKey(e.target.value)}
              className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-stone-100 text-xs focus:outline-none focus:border-emerald-400"
            />
            <button
              type="button"
              onClick={() => setShowKeyInput(false)}
              className="px-3 py-1.5 bg-emerald-500 text-stone-950 font-bold rounded-lg hover:bg-emerald-400 cursor-pointer"
            >
              Save Key
            </button>
          </div>
          <p className="text-[11px] text-stone-400">
            Aapki key browser mein secure save rahegi aur direct aapki cloned voice generate karne k liye use hogi.
          </p>
        </div>
      )}

      {/* Voice Selection Cards */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-400" />
            AI Voice Artist (صدا کار کا انتخاب):
          </span>
          <span className="text-stone-400 text-[11px]">
            Selected: <strong className="text-amber-300">{currentVoice.name}</strong>
          </span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {voices.map((voice) => {
            const isSelected = voice.id === selectedVoiceId;
            return (
              <button
                key={voice.id}
                id={`voice-btn-${voice.id}`}
                type="button"
                onClick={() => onSelectVoice(voice.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400 text-stone-100 ring-1 ring-amber-400/30 shadow-md'
                    : 'bg-stone-900/60 border-stone-700/60 text-stone-300 hover:border-stone-600 hover:bg-stone-900'
                } ${voice.isCustomClone ? 'border-emerald-500/40 sm:col-span-2 md:col-span-3 bg-gradient-to-r from-emerald-950/30 to-stone-900/80' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {voice.isCustomClone && <span className="text-base">🎙️</span>}
                    <span className="font-bold text-xs text-white">{voice.name}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      voice.isCustomClone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : voice.gender === 'Female'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {voice.isCustomClone ? '🌟 Aapki Personal Voice' : voice.gender}
                  </span>
                </div>
                <div className="text-[11px] text-amber-300/90 font-medium mt-1 truncate">
                  {voice.character}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">
                  {voice.bestFor}
                </div>
                {voice.voiceId && (
                  <div className="text-[9px] text-emerald-400/80 font-mono mt-1">
                    ID: {voice.voiceId}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Speed and Pitch Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Speed Adjustment */}
        <div className="bg-stone-900/80 border border-stone-750 p-3.5 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <label htmlFor="speed-slider" className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              Voice Speed (رفتار):
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-300 px-2 py-0.5 bg-amber-400/10 rounded-md border border-amber-400/20">
                {speed.toFixed(2)}x
              </span>
            </div>
          </div>

          <input
            id="speed-slider"
            type="range"
            min="0.7"
            max={currentVoice.isCustomClone ? '1.2' : '1.5'}
            step="0.05"
            value={Math.min(currentVoice.isCustomClone ? 1.2 : 1.5, speed)}
            onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />

          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span>0.7x (Slow)</span>
            <span className="text-amber-200/90 font-medium text-[10px]">{getSpeedLabel(speed)}</span>
            <span>{currentVoice.isCustomClone ? '1.2x (Fast)' : '1.5x (Fast)'}</span>
          </div>

          {/* Quick speed preset pills */}
          <div className="flex gap-1.5 pt-1">
            {(currentVoice.isCustomClone ? [0.8, 0.9, 1.0, 1.1, 1.2] : [0.8, 0.95, 1.0, 1.15, 1.3]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChangeSpeed(s)}
                className={`flex-1 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                  Math.abs(speed - s) < 0.02
                    ? 'bg-amber-400 text-stone-950 border-amber-300 font-bold'
                    : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                }`}
              >
                {s.toFixed(2).replace(/\.00$/, '.0')}x
              </button>
            ))}
          </div>
        </div>

        {/* Pitch Adjustment */}
        <div className="bg-stone-900/80 border border-stone-750 p-3.5 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <label htmlFor="pitch-slider" className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              Voice Pitch & Depth (آواز کا اتار چڑھاؤ):
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-purple-300 px-2 py-0.5 bg-purple-400/10 rounded-md border border-purple-400/20">
                {pitch > 0 ? `+${pitch}` : pitch} semitones
              </span>
            </div>
          </div>

          <input
            id="pitch-slider"
            type="range"
            min="-4"
            max="4"
            step="1"
            value={pitch}
            onChange={(e) => onChangePitch(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
          />

          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span>-4 (Grave/Deep)</span>
            <span className="text-purple-200/90 font-medium text-[10px]">{getPitchLabel(pitch)}</span>
            <span>+4 (High/Bright)</span>
          </div>

          {/* Quick pitch preset buttons */}
          <div className="flex gap-1.5 pt-1">
            {[
              { val: -2, label: 'Deep' },
              { val: -1, label: 'Low' },
              { val: 0, label: 'Natural' },
              { val: 1, label: 'Bright' },
              { val: 2, label: 'High' },
            ].map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => onChangePitch(p.val)}
                className={`flex-1 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                  pitch === p.val
                    ? 'bg-purple-500 text-white border-purple-400 font-bold'
                    : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
