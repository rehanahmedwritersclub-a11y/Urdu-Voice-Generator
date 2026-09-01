import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Sparkles,
  Repeat,
  FastForward,
} from 'lucide-react';
import { AudioTake } from '../types';
import { formatTime, downloadWavFile } from '../utils/audioUtils';

interface PlayerBarProps {
  currentTake: AudioTake | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
  playbackRate: number;
  onChangePlaybackRate: (rate: number) => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentTake,
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onSeek,
  volume,
  onChangeVolume,
  playbackRate,
  onChangePlaybackRate,
}) => {
  const [isLooping, setIsLooping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const prevVolumeRef = useRef(volume);

  if (!currentTake) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleMuteToggle = () => {
    if (isMuted) {
      onChangeVolume(prevVolumeRef.current || 0.8);
      setIsMuted(false);
    } else {
      prevVolumeRef.current = volume;
      onChangeVolume(0);
      setIsMuted(true);
    }
  };

  const handleDownload = () => {
    if (currentTake) {
      const filename = `Urdu_YouTube_Take_${currentTake.tone.id}_${Date.now()}.wav`;
      downloadWavFile(currentTake.audioBase64, filename);
    }
  };

  return (
    <div
      id="player-bar-container"
      className="sticky bottom-4 z-40 bg-stone-900/95 backdrop-blur-md border border-amber-500/30 shadow-2xl shadow-black/80 rounded-2xl p-4 transition-all"
    >
      <div className="flex flex-col gap-3">
        {/* Top Info row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <div className="truncate font-semibold text-stone-200">
              {currentTake.title}
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${currentTake.tone.badgeColor}`}>
              {currentTake.tone.label}
            </span>
            <span className="text-[10px] text-stone-400 shrink-0">
              Voice: {currentTake.voiceName} • {currentTake.speed}x • Pitch: {currentTake.pitch > 0 ? `+${currentTake.pitch}` : currentTake.pitch}
            </span>
          </div>

          <button
            id="download-wav-btn"
            type="button"
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Download studio WAV file for Premiere Pro / DaVinci Resolve / CapCut"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download WAV</span>
          </button>
        </div>

        {/* Scrub Bar & Waveform Simulation */}
        <div className="space-y-1">
          <div
            className="relative w-full h-3 bg-stone-800 rounded-full overflow-hidden cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const newTime = (clickX / rect.width) * duration;
              onSeek(Math.max(0, Math.min(newTime, duration)));
            }}
          >
            {/* Background animated audio bar bars */}
            <div className="absolute inset-0 flex items-center justify-between px-1 opacity-25">
              {Array.from({ length: 48 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-amber-400 rounded-full transition-all duration-150"
                  style={{
                    height: isPlaying ? `${15 + (Math.sin(i * 0.4 + currentTime * 5) + 1) * 35}%` : '20%',
                  }}
                />
              ))}
            </div>

            {/* Filled Progress */}
            <div
              className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Bottom Playback Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Main Play / Pause Controls */}
          <div className="flex items-center gap-2">
            <button
              id="player-restart-btn"
              type="button"
              onClick={() => onSeek(0)}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="Restart from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              id="player-toggle-btn"
              type="button"
              onClick={onTogglePlay}
              className="w-11 h-11 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-950/40 transition-transform active:scale-95 cursor-pointer font-bold"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-stone-950" /> : <Play className="w-5 h-5 fill-stone-950 ml-0.5" />}
            </button>

            <button
              id="player-loop-btn"
              type="button"
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isLooping
                  ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                  : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
              }`}
              title={isLooping ? 'Loop is On' : 'Loop is Off'}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Rate and Volume adjustments */}
          <div className="flex items-center gap-4">
            {/* Playback speed selector */}
            <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-lg border border-stone-700 text-xs">
              <FastForward className="w-3.5 h-3.5 text-stone-400 ml-1" />
              {[0.8, 1.0, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => onChangePlaybackRate(rate)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    playbackRate === rate
                      ? 'bg-amber-400 text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Volume control */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMuteToggle}
                className="text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              >
                {volume === 0 || isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  onChangeVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-20 h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
