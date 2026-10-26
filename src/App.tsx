import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Sliders,
  Volume2,
  FileText,
  Sparkles,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Video,
  Layers,
  History,
  Info,
} from 'lucide-react';
import { TONE_PRESETS, VOICE_OPTIONS, SAMPLE_SCRIPTS } from './data/constants';
import { TonePreset, VoiceOption, AudioTake, ScriptSample } from './types';
import { ToneSelector } from './components/ToneSelector';
import { AudioControls } from './components/AudioControls';
import { ScriptEditor } from './components/ScriptEditor';
import { PlayerBar } from './components/PlayerBar';
import { TakesHistory } from './components/TakesHistory';
import { ScriptAnalysisModal } from './components/ScriptAnalysisModal';
import { base64ToBlobUrl } from './utils/audioUtils';

export default function App() {
  // Core configuration states
  const [scriptText, setScriptText] = useState<string>(SAMPLE_SCRIPTS[0].text);
  const [selectedTone, setSelectedTone] = useState<TonePreset>(TONE_PRESETS[0]);
  const [customMood, setCustomMood] = useState<string>('');
  const [speed, setSpeed] = useState<number>(TONE_PRESETS[0].suggestedSpeed);
  const [pitch, setPitch] = useState<number>(TONE_PRESETS[0].suggestedPitch);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('my_cloned_voice');
  const [enforceStatsRule, setEnforceStatsRule] = useState<boolean>(true);
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('elevenlabs_api_key') || '';
    } catch {
      return '';
    }
  });

  // Audio takes and playback states
  const [takes, setTakes] = useState<AudioTake[]>(() => {
    try {
      const saved = localStorage.getItem('urdu_voice_takes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentTake, setCurrentTake] = useState<AudioTake | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1.0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Modals and tabs
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'takes'>('editor');

  // Audio DOM element reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Save takes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('urdu_voice_takes', JSON.stringify(takes));
    } catch (e) {
      console.warn('LocalStorage full or unavailable', e);
    }
  }, [takes]);

  const handleUpdateElevenLabsKey = (key: string) => {
    setElevenLabsApiKey(key);
    try {
      localStorage.setItem('elevenlabs_api_key', key);
    } catch {
      // ignore
    }
    showToast('success', 'ElevenLabs API Key saved!');
  };

  // Handle tone selection with auto-applied suggested speed/pitch
  const handleSelectTone = (tone: TonePreset) => {
    setSelectedTone(tone);
    setSpeed(tone.suggestedSpeed);
    setPitch(tone.suggestedPitch);
    showToast('info', `Switched to "${tone.label}" tone`);
  };

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Generate Audio via Server API
  const handleGenerateSpeech = async () => {
    if (!scriptText.trim()) {
      showToast('error', 'Please enter some Urdu script text before generating.');
      return;
    }

    const currentVoice = VOICE_OPTIONS.find((v) => v.id === selectedVoiceId) || VOICE_OPTIONS[0];

    try {
      setIsGenerating(true);

      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scriptText,
          toneId: selectedTone.id,
          customMood,
          speed,
          pitch,
          voiceName: selectedVoiceId,
          voiceId: currentVoice.voiceId || '5T2fl2GVB1wv1t0Z9hEW',
          provider: currentVoice.provider || 'gemini',
          enforceStatsRule,
          elevenLabsApiKey: elevenLabsApiKey.trim(),
        }),
      });

      if (!response.ok) {
        let errorMsg = `Server error (${response.status})`;
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const errData = await response.json();
            if (errData.requiresApiKey) {
              throw new Error('ElevenLabs API Key required! "Enter ElevenLabs API Key" button par click kar ke apni key paste karein.');
            }
            errorMsg = errData.error || errorMsg;
          } else {
            const rawText = await response.text();
            if (rawText.includes('<!DOCTYPE') || rawText.includes('<html')) {
              errorMsg = `Server returned an HTML page (${response.status}) instead of JSON. The Node.js server might not be running or the /api endpoint is not routed.`;
            } else if (rawText) {
              errorMsg = rawText.slice(0, 150);
            }
          }
        } catch (subErr: any) {
          if (subErr.message && subErr.message.includes('ElevenLabs')) {
            throw subErr;
          }
          // fallback to errorMsg
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate Urdu audio voiceover.');
      }

      const snippet = scriptText.trim().slice(0, 75) + (scriptText.length > 75 ? '...' : '');
      const newTake: AudioTake = {
        id: `take_${Date.now()}`,
        title: `Take ${takes.length + 1} (${currentVoice.isCustomClone ? '🎙️ My Voice' : currentVoice.name} - ${selectedTone.tag})`,
        textSnippet: snippet,
        audioBase64: data.audioBase64,
        durationSeconds: data.durationSeconds || 10,
        createdAt: new Date().toISOString(),
        tone: selectedTone,
        voiceName: currentVoice.name,
        provider: data.provider,
        speed,
        pitch,
        enforceStatsRule,
      };

      setTakes((prev) => [newTake, ...prev]);
      setCurrentTake(newTake);
      showToast('success', `${currentVoice.isCustomClone ? 'Aapki Cloned Awaz' : 'Urdu Voice'} tayar hai! Ready to play.`);

      // Auto load and play
      loadAndPlayAudio(newTake.audioBase64, data.mimeType);
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Speech generation encountered an error.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Audio Engine Loader
  const loadAndPlayAudio = (base64Data: string, mimeType: string = 'audio/wav') => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    const blobUrl = base64ToBlobUrl(base64Data, mimeType || 'audio/wav');

    audio.src = blobUrl;
    audio.playbackRate = playbackRate;
    audio.volume = volume;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration || 0);
      audio.play().then(() => setIsPlaying(true)).catch((e) => console.warn('Auto-play blocked', e));
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.onerror = (e) => {
      console.error('Audio playback error', e);
      setIsPlaying(false);
    };
  };

  const handleTogglePlay = () => {
    if (!audioRef.current && currentTake) {
      loadAndPlayAudio(currentTake.audioBase64);
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleChangeVolume = (vol: number) => {
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const handleChangePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleSelectTake = (take: AudioTake) => {
    setCurrentTake(take);
    loadAndPlayAudio(take.audioBase64);
  };

  const handleDeleteTake = (id: string) => {
    setTakes((prev) => prev.filter((t) => t.id !== id));
    if (currentTake?.id === id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setCurrentTake(null);
      setIsPlaying(false);
    }
    showToast('info', 'Take removed from archive.');
  };

  const handleSelectSample = (sample: ScriptSample) => {
    setScriptText(sample.text);
    const matchingTone = TONE_PRESETS.find((t) => t.id === sample.toneId);
    if (matchingTone) {
      handleSelectTone(matchingTone);
    }
    showToast('info', `Loaded "${sample.title}" template.`);
  };

  const handleApplySectionTone = (text: string, toneId: string) => {
    setScriptText(text);
    const t = TONE_PRESETS.find((tone) => tone.id === toneId);
    if (t) handleSelectTone(t);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce-short">
          <div
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
                : toastMessage.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/40'
                : 'bg-stone-900/90 text-amber-300 border-amber-500/40'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {toastMessage.type === 'info' && <Info className="w-4 h-4 text-amber-400" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="border-b border-stone-800 bg-stone-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-950/50">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  Urdu Script Voice Studio
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 font-bold uppercase tracking-wider">
                  YouTube TTS
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Text-to-speech for Urdu scripts with customizable moods, tone styles, speed & pitch
              </p>
            </div>
          </div>

          {/* Quick Nav Switcher */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-amber-400 text-stone-950 shadow-sm'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-750'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Studio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('takes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'takes'
                  ? 'bg-amber-400 text-stone-950 shadow-sm'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-750'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Takes ({takes.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {activeTab === 'editor' && (
          <div className="space-y-6">
            {/* Tone Selector with the 6 Requested Tones */}
            <ToneSelector
              tones={TONE_PRESETS}
              selectedToneId={selectedTone.id}
              onSelectTone={handleSelectTone}
              customMood={customMood}
              onChangeCustomMood={setCustomMood}
              enforceStatsRule={enforceStatsRule}
              onToggleStatsRule={setEnforceStatsRule}
            />

            {/* Voice, Speed & Pitch Controls */}
            <AudioControls
              voices={VOICE_OPTIONS}
              selectedVoiceId={selectedVoiceId}
              onSelectVoice={setSelectedVoiceId}
              speed={speed}
              onChangeSpeed={setSpeed}
              pitch={pitch}
              onChangePitch={setPitch}
              elevenLabsApiKey={elevenLabsApiKey}
              onChangeElevenLabsApiKey={handleUpdateElevenLabsKey}
            />

            {/* Urdu Script Editor */}
            <ScriptEditor
              scriptText={scriptText}
              onChangeScriptText={setScriptText}
              samples={SAMPLE_SCRIPTS}
              onSelectSample={handleSelectSample}
              onGenerateSpeech={handleGenerateSpeech}
              isGenerating={isGenerating}
              onOpenAnalysisModal={() => setIsAnalysisModalOpen(true)}
            />

            {/* Audio Takes Archive if any exist */}
            {takes.length > 0 && (
              <TakesHistory
                takes={takes}
                currentTakeId={currentTake?.id || null}
                isPlaying={isPlaying}
                onSelectTake={handleSelectTake}
                onDeleteTake={handleDeleteTake}
              />
            )}
          </div>
        )}

        {activeTab === 'takes' && (
          <div className="space-y-6">
            <TakesHistory
              takes={takes}
              currentTakeId={currentTake?.id || null}
              isPlaying={isPlaying}
              onSelectTake={handleSelectTake}
              onDeleteTake={handleDeleteTake}
            />
          </div>
        )}
      </main>

      {/* Persistent Audio Player Bar */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6">
        <PlayerBar
          currentTake={currentTake}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          volume={volume}
          onChangeVolume={handleChangeVolume}
          playbackRate={playbackRate}
          onChangePlaybackRate={handleChangePlaybackRate}
        />
      </div>

      {/* Script Analysis Modal */}
      <ScriptAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        scriptText={scriptText}
        tones={TONE_PRESETS}
        onApplySectionTone={handleApplySectionTone}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-stone-850 py-4 mt-8 text-center text-xs text-stone-500">
        Urdu Script Voice Studio • Powered by Gemini AI Text-to-Speech & Tone Modulation
      </footer>
    </div>
  );
}
