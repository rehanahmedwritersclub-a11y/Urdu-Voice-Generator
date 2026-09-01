import { TonePreset, VoiceOption, ScriptSample } from '../types';

export const TONE_PRESETS: TonePreset[] = [
  {
    id: 'fast_punch',
    label: 'Fast, sharp, thora punch ke sath',
    description: 'Sabse zyada energy wala — High retention YouTube hooks & fast intros',
    tag: '⚡ Highest Energy',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    accentColor: '#f59e0b',
    iconName: 'Zap',
    suggestedSpeed: 1.20,
    suggestedPitch: 1,
    moodPrompt: 'High energy, rapid punchy pace, crisp sharp consonants, upbeat and urgent tone like a viral YouTube video hook with punch and excitement.'
  },
  {
    id: 'slow_confident_calm',
    label: 'Slow down, confident aur calm',
    description: 'Deep authority, steady pacing, measured reassurance for key insights',
    tag: '🌊 Confident & Calm',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    accentColor: '#06b6d4',
    iconName: 'Shield',
    suggestedSpeed: 0.9,
    suggestedPitch: -1,
    moodPrompt: 'Slow, confident, calm, steady and authoritative voice. Deep breath, relaxed cadence, clear poise and grounded reassurance.'
  },
  {
    id: 'direct_smile',
    label: 'Direct, halka sa smile/confidence ke sath',
    description: 'Friendly smirk, personal eye-contact feel, engaging viewer connection',
    tag: '😊 Direct & Friendly',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    accentColor: '#10b981',
    iconName: 'Smile',
    suggestedSpeed: 1.05,
    suggestedPitch: 0,
    moodPrompt: 'Direct to the audience with a subtle audible smile in the voice, confident tone, engaging warmth, friendly eye-contact connection.'
  },
  {
    id: 'teaching_pace',
    label: 'Consistent, teaching pace',
    description: 'Pedagogical cadence, spaced pauses, perfect for explanations and step-by-steps',
    tag: '📚 Teaching Pace',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    accentColor: '#3b82f6',
    iconName: 'BookOpen',
    suggestedSpeed: 0.95,
    suggestedPitch: 0,
    moodPrompt: 'Steady, consistent, clear teaching pace. Spaced micro-pauses between key concepts, highly articulate pronunciation for deep comprehension.'
  },
  {
    id: 'serious_low',
    label: 'Awaaz thori neechay, serious',
    description: 'Lower pitch, intense gravitas, dramatic weight for documentaries and mysteries',
    tag: '🎙️ Deep & Serious',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    accentColor: '#a855f7',
    iconName: 'Mic',
    suggestedSpeed: 0.9,
    suggestedPitch: -2,
    moodPrompt: 'Lower pitch, serious, grave, intense and solemn delivery. Dramatic narrative weight suitable for documentaries, warnings, or mystery storytelling.'
  },
  {
    id: 'warm_friendly_upbeat',
    label: 'Warm aur friendly, end pe upbeat',
    description: 'Welcoming start with an energetic, encouraging finish (Outros & CTAs)',
    tag: '🌟 Warm to Upbeat',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    accentColor: '#f43f5e',
    iconName: 'Sparkles',
    suggestedSpeed: 1.05,
    suggestedPitch: 1,
    moodPrompt: 'Warm, welcoming, friendly conversational tone at first, rising smoothly into an upbeat, cheerful, motivational high-energy delivery towards the ending.'
  }
];

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'my_cloned_voice',
    name: 'Meri Cloned Awaaz (ElevenLabs)',
    gender: 'Custom',
    character: 'Aapki Asli Personal Awaaz',
    description: 'Aapki apni ElevenLabs cloned voice jo aapke diye gaye Voice ID par train hui hai.',
    bestFor: 'Aapke personal YouTube videos, vlogs, commentaries aur brand voice',
    provider: 'elevenlabs',
    voiceId: '5T2fl2GVB1wv1t0Z9hEW',
    isCustomClone: true,
  },
  {
    id: 'Kore',
    name: 'Kore (کورے)',
    gender: 'Female',
    character: 'Crisp & Natural Narrator',
    description: 'Balanced, articulate, clear Urdu inflection and emotional range.',
    bestFor: 'YouTube explainer videos, educational content, modern stories',
    provider: 'gemini',
  },
  {
    id: 'Puck',
    name: 'Puck (پک)',
    gender: 'Male',
    character: 'Energetic & Punchy',
    description: 'Bright, fast-paced, youth-oriented delivery with natural enthusiasm.',
    bestFor: 'Hooks, tech reviews, viral short scripts, gaming & reaction videos',
    provider: 'gemini',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir (فینرِر)',
    gender: 'Male',
    character: 'Deep Authority & Documentary',
    description: 'Deep resonant chest tone, powerful gravitas, mysterious cadence.',
    bestFor: 'Historical documentaries, crime stories, serious analyses',
    provider: 'gemini',
  },
  {
    id: 'Aoede',
    name: 'Aoede (ایوڈی)',
    gender: 'Female',
    character: 'Warm & Expressive Host',
    description: 'Gentle warmth, friendly smile, engaging podcast host quality.',
    bestFor: 'Vlogs, motivational scripts, lifestyle & storytelling',
    provider: 'gemini',
  },
  {
    id: 'Charon',
    name: 'Charon (کیرون)',
    gender: 'Male',
    character: 'Calm & Intellectual Voice',
    description: 'Measured, thoughtful, deep baritone with steady confidence.',
    bestFor: 'Finance breakdowns, business case studies, news commentary',
    provider: 'gemini',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr (زیفر)',
    gender: 'Female',
    character: 'Dynamic & Persuasive',
    description: 'Smooth, polished commercial and modern voiceover artist tone.',
    bestFor: 'Product launches, tutorial step-by-steps, calls to action',
    provider: 'gemini',
  }
];

export const SAMPLE_SCRIPTS: ScriptSample[] = [
  {
    id: 'sample_tech',
    title: 'ٹیکنالوجی اور مصنوعی ذہانت (AI Tech Explainer)',
    genre: 'Tech & Modern AI',
    toneId: 'teaching_pace',
    text: `کیا آپ جانتے ہیں کہ 2026 میں آرٹیفیشل انٹیلیجنس نے دنیا بھر میں 85 فیصد ڈیجیٹل ورک فلوز کو تبدیل کر دیا ہے؟

آج کی ویڈیو میں ہم دیکھیں گے کہ جدید ماڈل کیسے کام کرتے ہیں، اور آپ انہیں اپنے روزمرہ کے کاموں کو 10 گنا تیز کرنے کے لیے کیسے استعمال کر سکتے ہیں۔

سب سے پہلے، بنیادی اصول کو سمجھتے ہیں۔ جب آپ سسٹم کو کوئی کمانڈ دیتے ہیں تو وہ صرف الفاظ کو نہیں پڑھتا، بلکہ آپ کے پورے مقصد اور سیاق و سباق کا سائنسی تجزیہ کرتا ہے۔

اگر آپ کو یہ تفصیلی گائیڈ پسند آئی ہو تو ویڈیو کو لائک کریں اور چینل کو ضرور سبسکرائب کریں!`
  },
  {
    id: 'sample_mystery_hook',
    title: 'پراسرار ہک اور تجسس (Viral Mystery Hook)',
    genre: 'Mystery & Thriller',
    toneId: 'fast_punch',
    text: `صرف 3 منٹ میں جو کچھ ہونے والا تھا، اس کا اندازہ اس کمرے میں موجود کسی ایک شخص کو بھی نہیں تھا!

سال 1994 کی ایک سرد رات، جب گھڑی پر ٹھیک رات کے 2 بج کر 14 منٹ ہوئے، ایک ایسی کال آئی جس نے تفتیشی ٹیم کے ہوش اڑا دیے۔

کیا یہ محض ایک اتفاق تھا یا برسوں سے سوچی سمجھی منصوبہ بندی؟ سچائی اتنی حیران کن ہے کہ آپ پلک جھپکنا بھول جائیں گے۔ ویڈیو کو آخر تک لازمی دیکھیں۔`
  },
  {
    id: 'sample_business_stats',
    title: 'کاروبار اور اعداد و شمار (Business Stats & Facts)',
    genre: 'Finance & Numbers',
    toneId: 'slow_confident_calm',
    text: `دنیا کی کل دولت کا 45 فیصد حصہ صرف ٹاپ 1 فیصد لوگوں کے ہاتھ میں ہے۔

گزشتہ سال عالمی مارکیٹ میں 120 ارب ڈالر کی زبردست سرمایہ کاری ریکارڈ کی گئی۔ لیکن تلخ حقیقت یہ ہے کہ 90 فیصد نئے اسٹارٹ اپس اپنے پہلے 3 سالوں کے اندر ہی بند ہو جاتے ہیں۔

اگر آپ مالیاتی کامیابی حاصل کرنا چاہتے ہیں تو جذبات کے بجائے ٹھوس اعداد و شمار اور مستقل حکمت عملی پر بھروسہ کریں۔`
  },
  {
    id: 'sample_roman_urdu',
    title: 'رومن اردو ویڈیو اسکرپٹ (Roman Urdu YouTube Script)',
    genre: 'Productivity & Vlog',
    toneId: 'direct_smile',
    text: `Dosto, kya aap bhi har roz subah uth kar yeh sochte hain ke aaj ka din kaise maximum productive banaya jaye?

Sach yeh hai ke hum mein se 70% log din ke pehle 30 minutes sirf mobile notification dekhne mein waste kar dete hain.

Lekin agar aap sirf 3 simple habits ko adopt kar lein, toh aapki focus aur energy 2 guna barh sakti hai. Aaj hum in 3 steps ko step-by-step detail mein dekhenge!`
  }
];
