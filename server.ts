import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function pcmToWav(pcmData: Buffer, sampleRate: number = 24000, numChannels: number = 1, bitsPerSample: number = 16): Buffer {
  // If already a RIFF/WAV file, return directly
  if (pcmData.length >= 4 && pcmData.subarray(0, 4).toString('ascii') === 'RIFF') {
    return pcmData;
  }

  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const subChunk2Size = pcmData.length;
  const chunkSize = 36 + subChunk2Size;

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(subChunk2Size, 40);

  return Buffer.concat([header, pcmData]);
}

// Tone system instructions
export interface TonePreset {
  id: string;
  label: string;
  description: string;
  moodPrompt: string;
  tag: string;
  badgeColor: string;
  suggestedSpeed: number;
  suggestedPitch: number;
}

export const TONE_PRESETS: TonePreset[] = [
  {
    id: 'fast_punch',
    label: 'Fast, sharp, thora punch ke sath',
    description: 'Sabse zyada energy wala - Great for high-retention YouTube hooks & teasers',
    tag: '⚡ High Energy',
    badgeColor: 'amber',
    suggestedSpeed: 1.25,
    suggestedPitch: 1,
    moodPrompt: 'High energy, rapid punchy pace, crisp sharp consonants, upbeat and urgent tone like a viral YouTube video hook with punch and excitement.'
  },
  {
    id: 'slow_confident_calm',
    label: 'Slow down, confident aur calm',
    description: 'Deep authority, steady pacing, measured reassurance for key insights',
    tag: '🌊 Calm & Poised',
    badgeColor: 'cyan',
    suggestedSpeed: 0.9,
    suggestedPitch: -1,
    moodPrompt: 'Slow, confident, calm, steady and authoritative voice. Deep breath, relaxed cadence, clear poise and grounded reassurance.'
  },
  {
    id: 'direct_smile',
    label: 'Direct, halka sa smile/confidence ke sath',
    description: 'Engaging, conversational, friendly smirk and eye-contact connection',
    tag: '😊 Direct & Smiling',
    badgeColor: 'emerald',
    suggestedSpeed: 1.05,
    suggestedPitch: 0,
    moodPrompt: 'Direct to the audience with a subtle audible smile in the voice, confident tone, engaging warmth, friendly eye-contact connection.'
  },
  {
    id: 'teaching_pace',
    label: 'Consistent, teaching pace',
    description: 'Pedagogical cadence, spaced pauses, perfect for explanations and step-by-steps',
    tag: '📚 Teacher / Explainer',
    badgeColor: 'blue',
    suggestedSpeed: 0.95,
    suggestedPitch: 0,
    moodPrompt: 'Steady, consistent, clear teaching pace. Spaced micro-pauses between key concepts, highly articulate pronunciation for deep comprehension.'
  },
  {
    id: 'serious_low',
    label: 'Awaaz thori neechay, serious',
    description: 'Lower pitch, intense gravitas, dramatic weight for documentaries and mysteries',
    tag: '🎙️ Serious & Deep',
    badgeColor: 'purple',
    suggestedSpeed: 0.9,
    suggestedPitch: -2,
    moodPrompt: 'Lower pitch, serious, grave, intense and solemn delivery. Dramatic narrative weight suitable for documentaries, warnings, or mystery storytelling.'
  },
  {
    id: 'warm_friendly_upbeat',
    label: 'Warm aur friendly, end pe upbeat',
    description: 'Welcoming start with an energetic, encouraging finish (ideal for Outros & CTAs)',
    tag: '🌟 Warm to Upbeat',
    badgeColor: 'rose',
    suggestedSpeed: 1.05,
    suggestedPitch: 1,
    moodPrompt: 'Warm, welcoming, friendly conversational tone at first, rising smoothly into an upbeat, cheerful, motivational high-energy delivery towards the ending.'
  }
];

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get available tones
  app.get('/api/tts/tones', (req, res) => {
    res.json({ tones: TONE_PRESETS });
  });

  // Text-To-Speech generation endpoint
  app.post('/api/tts/generate', async (req, res) => {
    try {
      const {
        text,
        toneId = 'fast_punch',
        customMood = '',
        speed = 1.0,
        pitch = 0,
        voiceName = 'my_cloned_voice',
        voiceId = '5T2fl2GVB1wv1t0Z9hEW',
        provider = 'elevenlabs',
        enforceStatsRule = true,
        elevenLabsApiKey = '',
      } = req.body;

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'Text is required for speech generation.' });
      }

      const selectedTone = TONE_PRESETS.find((t) => t.id === toneId) || TONE_PRESETS[0];

      // --- ElevenLabs Cloned Voice Engine ---
      if (provider === 'elevenlabs' || voiceName === 'my_cloned_voice') {
        const targetVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || '5T2fl2GVB1wv1t0Z9hEW';
        const apiKey = elevenLabsApiKey || process.env.ELEVENLABS_API_KEY;

        if (!apiKey) {
          return res.status(400).json({
            error: 'ElevenLabs API Key required. Please set ELEVENLABS_API_KEY in the environment or provide it to speak in your cloned voice.',
            requiresApiKey: true,
            provider: 'elevenlabs',
          });
        }

        // Map Urdu tones to ElevenLabs voice_settings
        let stability = 0.50;
        let similarityBoost = 0.85;
        let style = 0.40;

        switch (toneId) {
          case 'fast_punch':
            stability = 0.35;
            similarityBoost = 0.85;
            style = 0.65;
            break;
          case 'slow_confident_calm':
            stability = 0.75;
            similarityBoost = 0.90;
            style = 0.20;
            break;
          case 'direct_smile':
            stability = 0.50;
            similarityBoost = 0.85;
            style = 0.45;
            break;
          case 'teaching_pace':
            stability = 0.65;
            similarityBoost = 0.85;
            style = 0.25;
            break;
          case 'serious_low':
            stability = 0.70;
            similarityBoost = 0.90;
            style = 0.55;
            break;
          case 'warm_friendly_upbeat':
            stability = 0.45;
            similarityBoost = 0.85;
            style = 0.50;
            break;
        }

        const clampedSpeed = Math.min(1.20, Math.max(0.70, Number(speed) || 1.0));

        const elevenPayload = {
          text: text.trim(),
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: true,
            speed: clampedSpeed,
          },
        };

        const elevenRes = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}?output_format=mp3_44100_128`,
          {
            method: 'POST',
            headers: {
              'xi-api-key': apiKey,
              'Content-Type': 'application/json',
              'Accept': 'audio/mpeg',
            },
            body: JSON.stringify(elevenPayload),
          }
        );

        if (!elevenRes.ok) {
          const errText = await elevenRes.text();
          let parsedError = errText;
          try {
            const errJson = JSON.parse(errText);
            parsedError = errJson.detail?.message || errJson.message || errText;
          } catch {
            // ignore
          }
          throw new Error(`ElevenLabs error (${elevenRes.status}): ${parsedError}`);
        }

        const arrayBuffer = await elevenRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Audio = buffer.toString('base64');
        const estimatedDurationSeconds = Math.max(1, (text.trim().split(/\s+/).length / (2.3 * speed)));

        return res.json({
          success: true,
          audioBase64: base64Audio,
          mimeType: 'audio/mpeg',
          durationSeconds: estimatedDurationSeconds,
          tone: selectedTone,
          voiceName: 'Meri Cloned Awaaz (5T2fl2GVB1wv1t0Z9hEW)',
          provider: 'elevenlabs',
          speed,
          pitch,
        });
      }

      // --- Gemini High-Fidelity TTS Engine ---
      const toneInstruction = selectedTone.moodPrompt;
      const speedInstruction = speed > 1.15
        ? 'Speak at a noticeably brisk, fast YouTube narration pace.'
        : speed < 0.9
        ? 'Speak at an unhurried, measured, slower pace.'
        : 'Speak at a natural, standard narration pace.';

      const pitchInstruction = pitch < -1
        ? 'Use a noticeably deeper, lower-pitched resonant voice.'
        : pitch > 1
        ? 'Use a lighter, slightly higher, brighter vocal register.'
        : 'Use a natural, balanced voice pitch.';

      const statsRuleText = enforceStatsRule
        ? '\nCRITICAL GENERAL RULE FOR URDU NARRATION: Whenever numbers, statistics, percentages, currency, dates, or factual figures occur (e.g. 50%, 10 million, 2024), slow down slightly for that specific figure and articulate the numbers exceptionally clearly and distinctly, then resume.'
        : '';

      const customMoodText = customMood && customMood.trim().length > 0
        ? `\nAdditional mood note: ${customMood.trim()}`
        : '';

      const promptDirective = `You are a professional Urdu voice artist and YouTube script narrator. Read the following script aloud in natural, authentic Urdu / Roman Urdu with expressive human emotion, clear diction, and flawless pacing.

DIRECTIVE:
- Tone Style: ${toneInstruction}
- Speed Style: ${speedInstruction}
- Pitch Register: ${pitchInstruction}${statsRuleText}${customMoodText}

SCRIPT TO READ ALOUD:
"""
${text.trim()}
"""`;

      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: promptDirective }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      const mimeType = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/pcm;rate=24000';

      if (!base64Audio) {
        throw new Error('No audio data received from Gemini TTS service.');
      }

      // Convert PCM to standard playable WAV buffer
      const rawBuffer = Buffer.from(base64Audio, 'base64');
      const wavBuffer = pcmToWav(rawBuffer, 24000, 1, 16);
      const wavBase64 = wavBuffer.toString('base64');

      // Estimate duration (24000 samples/sec * 2 bytes/sample = 48000 bytes/sec for 16-bit mono)
      const estimatedDurationSeconds = Math.max(0.5, (rawBuffer.length / 48000));

      return res.json({
        success: true,
        audioBase64: wavBase64,
        mimeType: 'audio/wav',
        durationSeconds: estimatedDurationSeconds,
        tone: selectedTone,
        voiceName,
        provider: 'gemini',
        speed,
        pitch,
      });
    } catch (err: any) {
      console.error('TTS Generation error:', err);
      return res.status(500).json({
        error: err.message || 'Failed to generate speech audio. Please verify your GEMINI_API_KEY or ELEVENLABS_API_KEY.',
      });
    }
  });

  // Script enhancer and section analyzer
  app.post('/api/script/analyze', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text is required.' });
      }

      const ai = getGeminiClient();
      const prompt = `You are an expert Urdu YouTube script coach. Analyze this script and break it down into logical YouTube video sections (e.g. Hook, Problem/Intro, Core Concept, Key Stats/Facts, Climax, Call To Action/Outro). For each section, recommend one of these tone IDs:
- "fast_punch" (Fast, sharp, thora punch ke sath)
- "slow_confident_calm" (Slow down, confident aur calm)
- "direct_smile" (Direct, halka sa smile/confidence ke sath)
- "teaching_pace" (Consistent, teaching pace)
- "serious_low" (Awaaz thori neechay, serious)
- "warm_friendly_upbeat" (Warm aur friendly, end pe upbeat)

Also identify if the section contains numbers/stats requiring the slow-number rule.

Script:
"""
${text}
"""

Return JSON format with schema:
{
  "sections": [
    {
      "sectionName": "Hook / Intro",
      "text": "section text here",
      "recommendedToneId": "fast_punch",
      "hasStats": false,
      "directorNote": "Deliver with punch to grab attention in first 5 seconds"
    }
  ],
  "statsCount": 2,
  "estimatedReadingTimeSec": 60,
  "tips": "Urdu advice for recording this script"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('Script analyze error:', err);
      return res.status(500).json({ error: err.message || 'Script analysis failed.' });
    }
  });

  // Sample scripts endpoint
  app.get('/api/script/samples', (req, res) => {
    const samples = [
      {
        id: 'sample_tech',
        title: 'Tech & AI Explainer (ٹیکنالوجی اور مصنوعی ذہانت)',
        genre: 'Tech / Innovation',
        toneId: 'teaching_pace',
        text: `کیا آپ جانتے ہیں کہ 2026 میں آرٹیفیشل انٹیلیجنس نے دنیا بھر میں 85 فیصد ڈیجیٹل ورک فلوز کو تبدیل کر دیا ہے؟

آج کی ویڈیو میں ہم دیکھیں گے کہ نیا ماڈل کیسے کام کرتا ہے، اور آپ اسے اپنے روزمرہ کے کاموں کو 10 گنا تیز کرنے کے لیے کیسے استعمال کر سکتے ہیں۔

سب سے پہلے، آئیے بنیادی کنسیپٹ کو سمجھتے ہیں۔ جب آپ کوئی کمانڈ دیتے ہیں تو سسٹم صرف الفاظ کو نہیں سمجھتا، بلکہ آپ کے سیاق و سباق کا مکمل تجزیہ کرتا ہے۔

اگر آپ کو یہ معلومات فائدہ مند لگیں تو ویڈیو کو لائک کریں اور چینل کو ضرور سبسکرائب کریں!`
      },
      {
        id: 'sample_hook_viral',
        title: 'High-Retention Mystery Hook (پراسرار کہانی کا ہک)',
        genre: 'Mystery / Storytelling',
        toneId: 'fast_punch',
        text: `صرف 3 منٹ میں جو کچھ ہونے والا تھا، اس کا اندازہ اس کمرے میں موجود کسی ایک شخص کو بھی نہیں تھا!

سال 1994 کی ایک سرد رات، جب گھڑی پر رات کے 2 بج کر 14 منٹ ہوئے، ایک ایسی کال آئی جس نے پورے تفتیشی ادارے کو ہلا کر رکھ دیا۔

کیا یہ کوئی عام حادثہ تھا یا برسوں سے سوچی سمجھی منصوبہ بندی؟ سچائی آپ کے ہوش اڑا دے گی۔ آخر تک جڑے رہیں۔`
      },
      {
        id: 'sample_stats_finance',
        title: 'Business & Finance with Stats (کاروبار اور اعداد و شمار)',
        genre: 'Finance & Numbers',
        toneId: 'slow_confident_calm',
        text: `دنیا کی کل دولت کا 45 فیصد حصہ صرف ٹاپ 1 فیصد لوگوں کے پاس ہے۔

گزشتہ سال مارکیٹ میں 120 ارب ڈالر کی زبردست سرمایہ کاری ریکارڈ کی گئی۔ لیکن حیران کن بات یہ ہے کہ 90 فیصد نئے اسٹارٹ اپس اپنے پہلے 3 سالوں میں ہی بند ہو جاتے ہیں۔

اگر آپ مالیاتی آزادی چاہتے ہیں تو جذباتی فیصلوں کے بجائے ٹھوس ڈیٹا اور حقیقت پسندانہ منصوبے پر عمل کریں۔`
      },
      {
        id: 'sample_roman_urdu',
        title: 'Roman Urdu YouTube Script (یوٹیوب اسکرپٹ رومن اردو میں)',
        genre: 'Vlog / Lifestyle',
        toneId: 'direct_smile',
        text: `Dosto, kya aap bhi har roz subah uth kar yeh sochte hain ke aaj ka din kaise productive banaya jaye?

Sach yeh hai ke hum mein se 70% log pehle 30 minutes sirf phone scroll karne mein zaya kar dete hain. 

Lekin agar aap sirf 3 aasan aadatein apna lein, toh aapki focus aur energy 2 guna barh sakti hai. Chaliye shuru karte hain!`
      }
    ];

    res.json({ samples });
  });

  // Catch-all for undefined /api routes so they always return JSON, not HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const candidatePaths = [
      path.join(process.cwd(), 'dist'),
      path.join(__dirname, '..', 'dist'),
      path.join(__dirname),
      process.cwd(),
    ];
    const distPath = candidatePaths.find((p) => fs.existsSync(path.join(p, 'index.html'))) || path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Application build (dist/index.html) not found. Please run npm run build.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Urdu Script Voice Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
