export interface TonePreset {
  id: string;
  label: string;
  description: string;
  tag: string;
  badgeColor: string;
  suggestedSpeed: number;
  suggestedPitch: number;
  moodPrompt: string;
  accentColor: string;
  iconName: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'Female' | 'Male' | 'Custom';
  character: string;
  description: string;
  bestFor: string;
  provider?: 'elevenlabs' | 'gemini';
  voiceId?: string;
  isCustomClone?: boolean;
}

export interface ScriptSection {
  id: string;
  title: string;
  text: string;
  toneId: string;
  customMood?: string;
  speed: number;
  pitch: number;
  hasStats?: boolean;
  directorNote?: string;
}

export interface AudioTake {
  id: string;
  title: string;
  textSnippet: string;
  audioBase64: string;
  audioUrl?: string;
  durationSeconds: number;
  createdAt: string;
  tone: TonePreset;
  voiceName: string;
  provider?: 'elevenlabs' | 'gemini';
  speed: number;
  pitch: number;
  enforceStatsRule: boolean;
}

export interface ScriptSample {
  id: string;
  title: string;
  genre: string;
  toneId: string;
  text: string;
}
