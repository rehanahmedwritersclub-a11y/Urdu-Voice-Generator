export function base64ToBlobUrl(base64Data: string, mimeType = 'audio/wav'): string {
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function downloadWavFile(base64Data: string, filename = 'urdu_voice_script.wav') {
  const url = base64ToBlobUrl(base64Data, 'audio/wav');
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export function countWordsAndStats(text: string) {
  if (!text) return { wordCount: 0, charCount: 0, statsCount: 0, estReadingTimeSec: 0 };
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = text.length;

  // Detect stats, numbers, percentages, currency, dates
  // e.g. 2026, 85%, 10, 120 ارب, 3 منٹ, 70%
  const numberMatches = text.match(/(\d+[\d.,]*%?)|(ارب|کروڑ|لاکھ|ہزار|فیصد|گن|گنا|minutes|hours|percent)/gi) || [];
  const statsCount = numberMatches.length;

  // Standard Urdu YouTube narration speed: ~130-150 words per minute (approx 2.3 words/sec)
  const estReadingTimeSec = Math.ceil(wordCount / 2.3);

  return {
    wordCount,
    charCount,
    statsCount,
    estReadingTimeSec,
  };
}

export function splitIntoSentences(text: string): string[] {
  if (!text) return [];
  // Split by Urdu full stop (۔), exclamation (!), question mark (؟/?) or newlines
  const rawSentences = text
    .split(/([۔!?؟\n]+)/)
    .reduce((acc: string[], cur, idx, arr) => {
      if (idx % 2 === 0 && cur.trim().length > 0) {
        const punctuation = arr[idx + 1] || '';
        acc.push((cur + punctuation).trim());
      }
      return acc;
    }, []);

  return rawSentences.length > 0 ? rawSentences : [text];
}
