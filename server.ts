import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy load Gemini AI Client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Fallback Heuristic Code-Mixed NLP Lexicon
interface LexiconEntry {
  polarity: 'positive' | 'negative' | 'neutral';
  score: number;
  lang: 'EN' | 'KA' | 'HI' | 'TA' | 'TE' | 'ML' | 'MR' | 'O';
  gloss: string;
}

const CODE_MIXED_LEXICON: Record<string, LexiconEntry> = {
  // Kannada
  tumba: { polarity: 'neutral', score: 0.1, lang: 'KA', gloss: 'Very / A lot (amplifier)' },
  super: { polarity: 'positive', score: 0.85, lang: 'EN', gloss: 'Superb / Excellent' },
  agittu: { polarity: 'neutral', score: 0.0, lang: 'KA', gloss: 'Was / Happened' },
  chennagide: { polarity: 'positive', score: 0.8, lang: 'KA', gloss: 'Is good / Nice' },
  chennagilla: { polarity: 'negative', score: -0.85, lang: 'KA', gloss: 'Not good / Bad' },
  waste: { polarity: 'negative', score: -0.75, lang: 'EN', gloss: 'Waste / Useless' },
  beku: { polarity: 'neutral', score: 0.1, lang: 'KA', gloss: 'Want / Need' },
  bedi: { polarity: 'negative', score: -0.2, lang: 'KA', gloss: 'Do not want / Avoid' },
  ivattu: { polarity: 'neutral', score: 0.0, lang: 'KA', gloss: 'Today' },
  sakath: { polarity: 'positive', score: 0.9, lang: 'KA', gloss: 'Awesome / Terrific' },
  khushi: { polarity: 'positive', score: 0.75, lang: 'KA', gloss: 'Happiness' },
  thumba: { polarity: 'neutral', score: 0.1, lang: 'KA', gloss: 'Very / Much' },
  bekaar: { polarity: 'negative', score: -0.8, lang: 'KA', gloss: 'Useless' },
  bore: { polarity: 'negative', score: -0.5, lang: 'EN', gloss: 'Boring' },
  okay: { polarity: 'neutral', score: 0.1, lang: 'EN', gloss: 'Okay / Acceptable' },
  ide: { polarity: 'neutral', score: 0.0, lang: 'KA', gloss: 'Is there / Exists' },

  // Hindi
  bahut: { polarity: 'neutral', score: 0.1, lang: 'HI', gloss: 'Very (amplifier)' },
  accha: { polarity: 'positive', score: 0.8, lang: 'HI', gloss: 'Good / Nice' },
  achha: { polarity: 'positive', score: 0.8, lang: 'HI', gloss: 'Good / Nice' },
  badhiya: { polarity: 'positive', score: 0.85, lang: 'HI', gloss: 'Great / Fine' },
  shandar: { polarity: 'positive', score: 0.9, lang: 'HI', gloss: 'Splendid / Fantastic' },
  kharab: { polarity: 'negative', score: -0.8, lang: 'HI', gloss: 'Bad / Broken' },
  bura: { polarity: 'negative', score: -0.75, lang: 'HI', gloss: 'Bad' },
  bakwas: { polarity: 'negative', score: -0.9, lang: 'HI', gloss: 'Nonsense / Rubbish' },
  laga: { polarity: 'neutral', score: 0.0, lang: 'HI', gloss: 'Felt / Seemed' },
  nahi: { polarity: 'negative', score: -0.4, lang: 'HI', gloss: 'No / Not (negation)' },
  mast: { polarity: 'positive', score: 0.9, lang: 'HI', gloss: 'Cool / Superb' },
  pyaar: { polarity: 'positive', score: 0.85, lang: 'HI', gloss: 'Love / Adore' },

  // Tamil
  romba: { polarity: 'neutral', score: 0.1, lang: 'TA', gloss: 'Very (amplifier)' },
  semma: { polarity: 'positive', score: 0.9, lang: 'TA', gloss: 'Awesome / Terrific' },
  nalla: { polarity: 'positive', score: 0.75, lang: 'TA', gloss: 'Good / Fine' },
  nalladhu: { polarity: 'positive', score: 0.75, lang: 'TA', gloss: 'Good thing' },
  kashtam: { polarity: 'negative', score: -0.7, lang: 'TA', gloss: 'Difficult / Sad' },
  kevalam: { polarity: 'negative', score: -0.9, lang: 'TA', gloss: 'Disgusting / Horrible' },
  illa: { polarity: 'negative', score: -0.3, lang: 'TA', gloss: 'No / Not (negation)' },
  irukku: { polarity: 'neutral', score: 0.0, lang: 'TA', gloss: 'Is / Exists' },
  padam: { polarity: 'neutral', score: 0.0, lang: 'TA', gloss: 'Movie / Film' },
  verum: { polarity: 'neutral', score: -0.1, lang: 'TA', gloss: 'Just / Mere' },

  // Telugu
  chala: { polarity: 'neutral', score: 0.1, lang: 'TE', gloss: 'Very / A lot (amplifier)' },
  bagundi: { polarity: 'positive', score: 0.85, lang: 'TE', gloss: 'Is very good / Nice' },
  bavundi: { polarity: 'positive', score: 0.85, lang: 'TE', gloss: 'Is very good' },
  nachindi: { polarity: 'positive', score: 0.8, lang: 'TE', gloss: 'Liked it' },
  nachaledu: { polarity: 'negative', score: -0.85, lang: 'TE', gloss: 'Did not like / Disliked' },
  worst: { polarity: 'negative', score: -0.9, lang: 'EN', gloss: 'Worst' },
  daridram: { polarity: 'negative', score: -0.9, lang: 'TE', gloss: 'Pathetic / Worst' },
  cinema: { polarity: 'neutral', score: 0.0, lang: 'TE', gloss: 'Cinema / Movie' },
  asalu: { polarity: 'neutral', score: 0.0, lang: 'TE', gloss: 'At all / Actually' },

  // Malayalam
  adipoli: { polarity: 'positive', score: 0.95, lang: 'ML', gloss: 'Awesome / Fantastic' },
  polichu: { polarity: 'positive', score: 0.9, lang: 'ML', gloss: 'Rocked it / Terrific' },
  nannayi: { polarity: 'positive', score: 0.75, lang: 'ML', gloss: 'Done well / Good' },
  mosham: { polarity: 'negative', score: -0.8, lang: 'ML', gloss: 'Bad / Poor' },
  valare: { polarity: 'neutral', score: 0.1, lang: 'ML', gloss: 'Very (amplifier)' },
  theere: { polarity: 'neutral', score: -0.1, lang: 'ML', gloss: 'Not at all' },
  kollaam: { polarity: 'positive', score: 0.7, lang: 'ML', gloss: 'Good / Fine' },
  kollilla: { polarity: 'negative', score: -0.8, lang: 'ML', gloss: 'Not good / Useless' },

  // Marathi
  khup: { polarity: 'neutral', score: 0.1, lang: 'MR', gloss: 'Very / A lot (amplifier)' },
  changla: { polarity: 'positive', score: 0.8, lang: 'MR', gloss: 'Good / Well' },
  sundar: { polarity: 'positive', score: 0.85, lang: 'MR', gloss: 'Beautiful / Lovely' },
  chhan: { polarity: 'positive', score: 0.8, lang: 'MR', gloss: 'Nice / Sweet' },
  vaait: { polarity: 'negative', score: -0.8, lang: 'MR', gloss: 'Bad / Poor' },
  faltu: { polarity: 'negative', score: -0.85, lang: 'MR', gloss: 'Worthless / Trash' },
  ahe: { polarity: 'neutral', score: 0.0, lang: 'MR', gloss: 'Is' },
  nahit: { polarity: 'negative', score: -0.3, lang: 'MR', gloss: 'Not / No' },
  kahi: { polarity: 'neutral', score: 0.0, lang: 'MR', gloss: 'Anything / Something' },
  lay: { polarity: 'neutral', score: 0.1, lang: 'MR', gloss: 'Very much / Extreme' },
};

function fallbackHeuristicAnalysis(text: string, requestedLang: string) {
  const clean = text.trim();
  const rawWords = clean.split(/\s+/).filter(Boolean);

  let totalScore = 0;
  let wordHits = 0;
  const tokens: any[] = [];
  const importantWords: string[] = [];
  const positiveWords: string[] = [];
  const negativeWords: string[] = [];
  const neutralWords: string[] = [];

  const langCount: Record<string, number> = { EN: 0, KA: 0, HI: 0, TA: 0, TE: 0, ML: 0, MR: 0, O: 0 };

  for (let i = 0; i < rawWords.length; i++) {
    const rawWord = rawWords[i];
    const stripped = rawWord.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    const entry = CODE_MIXED_LEXICON[stripped];

    if (entry) {
      langCount[entry.lang] = (langCount[entry.lang] || 0) + 1;
      let effectiveScore = entry.score;

      // check if previous word was an amplifier
      if (i > 0) {
        const prev = rawWords[i - 1].toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
        if (['bahut', 'tumba', 'romba', 'chala', 'khup', 'very', 'valare', 'lay', 'too'].includes(prev)) {
          effectiveScore = effectiveScore * 1.3;
        }
      }

      totalScore += effectiveScore;
      wordHits++;

      tokens.push({
        word: rawWord,
        detectedLang: entry.lang,
        polarity: entry.polarity,
        score: Number(Math.max(-1, Math.min(1, effectiveScore)).toFixed(2)),
        gloss: entry.gloss,
        isModifier: ['bahut', 'tumba', 'romba', 'chala', 'khup', 'valare'].includes(stripped),
        isNegation: ['nahi', 'illa', 'chennagilla', 'nachaledu', 'kollilla', 'not'].includes(stripped),
      });

      if (entry.polarity === 'positive') {
        positiveWords.push(rawWord);
        importantWords.push(rawWord);
      } else if (entry.polarity === 'negative') {
        negativeWords.push(rawWord);
        importantWords.push(rawWord);
      } else {
        neutralWords.push(rawWord);
      }
    } else {
      // Default guess
      const isEnglish = /^[a-zA-Z]+$/.test(rawWord);
      const langTag = isEnglish ? 'EN' : 'O';
      langCount[langTag] = (langCount[langTag] || 0) + 1;

      tokens.push({
        word: rawWord,
        detectedLang: langTag,
        polarity: 'neutral',
        score: 0,
        gloss: isEnglish ? 'Standard English token' : 'Code-mixed phonetic token',
      });
      neutralWords.push(rawWord);
    }
  }

  // Determine top Indian language detected
  let topIndianLang = 'Kannada';
  let maxCount = 0;
  const langMapping: Record<string, string> = {
    KA: 'Kannada',
    HI: 'Hindi',
    TA: 'Tamil',
    TE: 'Telugu',
    ML: 'Malayalam',
    MR: 'Marathi',
  };

  Object.entries(langCount).forEach(([code, count]) => {
    if (code !== 'EN' && code !== 'O' && count > maxCount) {
      maxCount = count;
      topIndianLang = langMapping[code] || 'Hindi';
    }
  });

  if (requestedLang && requestedLang !== 'auto') {
    const parts = requestedLang.split('-');
    topIndianLang = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  }

  // Calculate sentiment classification
  let normalizedScore = wordHits > 0 ? totalScore / Math.max(1, wordHits) : 0;
  normalizedScore = Number(Math.max(-1, Math.min(1, normalizedScore)).toFixed(2));

  let sentiment: 'Positive' | 'Negative' | 'Neutral' = 'Neutral';
  let confidence = 0.85;

  if (normalizedScore > 0.15) {
    sentiment = 'Positive';
    confidence = Math.min(0.98, 0.75 + normalizedScore * 0.22);
  } else if (normalizedScore < -0.15) {
    sentiment = 'Negative';
    confidence = Math.min(0.98, 0.75 + Math.abs(normalizedScore) * 0.22);
  } else {
    sentiment = 'Neutral';
    confidence = 0.82;
  }

  // Code switching index (transitions between distinct language tags)
  let transitions = 0;
  for (let i = 1; i < tokens.length; i++) {
    if (tokens[i].detectedLang !== tokens[i - 1].detectedLang) {
      transitions++;
    }
  }
  const codeSwitchingIndex = tokens.length > 1 ? Number((transitions / (tokens.length - 1)).toFixed(2)) : 0.0;

  return {
    sentiment,
    confidence: Number(confidence.toFixed(2)),
    language: `${topIndianLang} + English (${topIndianLang.slice(0, 3)}lish)`,
    primaryLanguage: topIndianLang,
    codeMixedType: `${topIndianLang}-English`,
    score: normalizedScore,
    importantWords: Array.from(new Set(importantWords)),
    positiveWords: Array.from(new Set(positiveWords)),
    negativeWords: Array.from(new Set(negativeWords)),
    neutralWords: Array.from(new Set(neutralWords)),
    tokens,
    explanation: `Heuristic rule-based NLP detected ${topIndianLang}-English code-mixing with ${positiveWords.length} positive and ${negativeWords.length} negative sentiment indicators.`,
    linguisticBreakdown: {
      codeSwitchingIndex,
      subwordNegationDetected: negativeWords.some((w) => /illa|nahi|ledu|chennagilla/i.test(w)),
      sarcasmProbability: 0.05,
      transliterationConfidence: 0.92,
      sourceScript: 'Latin/Romanized',
    },
  };
}

// ---------------- API ENDPOINTS ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Analyze Sentiment Endpoint
app.post('/api/analyze-sentiment', async (req, res) => {
  try {
    const { text, language = 'auto' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Please provide valid text for sentiment analysis.' });
      return;
    }

    const ai = getAiClient();

    if (!ai) {
      // Fallback heuristic model
      console.log('Gemini API key not found in env, using fallback NLP analyzer');
      const fallback = fallbackHeuristicAnalysis(text, language);
      res.json(fallback);
      return;
    }

    const systemPrompt = `You are a world-class Computational Linguist and AI Specialist in Indian Code-Mixed NLP (covering Romanized/Latin-script transliterated Indic languages mixed with English, such as Kanglish (Kannada+English), Hinglish (Hindi+English), Tanglish (Tamil+English), Tenglish (Telugu+English), Manglish (Malayalam+English), and Marathlish (Marathi+English)).

Analyze the given code-mixed sentence with high precision:
1. Determine the overall sentiment: 'Positive', 'Negative', or 'Neutral'.
2. Compute sentiment score between -1.00 (strongly negative) and +1.00 (strongly positive). 0.0 is completely neutral.
3. Compute confidence percentage between 0.50 and 0.99.
4. Detect the exact language mix (e.g. "Kannada + English (Kanglish)", "Hindi + English (Hinglish)", "Tamil + English (Tanglish)", "Telugu + English (Tenglish)", "Malayalam + English (Manglish)", "Marathi + English (Marathlish)").
5. Identify each token with:
   - detectedLang: 'EN' | 'KA' | 'HI' | 'TA' | 'TE' | 'ML' | 'MR' | 'O'
   - polarity: 'positive' | 'negative' | 'neutral'
   - score: number between -1.0 and 1.0
   - gloss: brief English meaning / grammatical tag (e.g. "is good", "waste / useless", "superb", "very (amplifier)")
   - isModifier: boolean (if word is an amplifier or downtoner)
   - isNegation: boolean (if word flips polarity, e.g. "illa", "chennagilla", "nahi", "nachaledu")
6. Extract key important words, positive words, and negative words.
7. Provide an insightful, crisp 1-2 sentence linguistic explanation of why this sentiment was assigned, explaining code-switching points, negation attachment, or colloquial nuances.
8. Provide linguistic breakdown: codeSwitchingIndex (0.0 to 1.0), subwordNegationDetected (boolean), sarcasmProbability (0.0 to 1.0), transliterationConfidence (0.0 to 1.0), and sourceScript.`;

    const userPrompt = `Input Text: "${text}"
Target Language Mode: ${language}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] },
            confidence: { type: Type.NUMBER },
            language: { type: Type.STRING },
            primaryLanguage: { type: Type.STRING },
            codeMixedType: { type: Type.STRING },
            score: { type: Type.NUMBER },
            importantWords: { type: Type.ARRAY, items: { type: Type.STRING } },
            positiveWords: { type: Type.ARRAY, items: { type: Type.STRING } },
            negativeWords: { type: Type.ARRAY, items: { type: Type.STRING } },
            neutralWords: { type: Type.ARRAY, items: { type: Type.STRING } },
            explanation: { type: Type.STRING },
            tokens: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  detectedLang: { type: Type.STRING },
                  polarity: { type: Type.STRING, enum: ['positive', 'negative', 'neutral'] },
                  score: { type: Type.NUMBER },
                  gloss: { type: Type.STRING },
                  isModifier: { type: Type.BOOLEAN },
                  isNegation: { type: Type.BOOLEAN },
                },
                required: ['word', 'detectedLang', 'polarity', 'score', 'gloss'],
              },
            },
            linguisticBreakdown: {
              type: Type.OBJECT,
              properties: {
                codeSwitchingIndex: { type: Type.NUMBER },
                subwordNegationDetected: { type: Type.BOOLEAN },
                sarcasmProbability: { type: Type.NUMBER },
                transliterationConfidence: { type: Type.NUMBER },
                sourceScript: { type: Type.STRING, enum: ['Latin/Romanized', 'Native', 'Mixed'] },
              },
              required: ['codeSwitchingIndex', 'subwordNegationDetected', 'sarcasmProbability', 'transliterationConfidence', 'sourceScript'],
            },
          },
          required: [
            'sentiment',
            'confidence',
            'language',
            'primaryLanguage',
            'codeMixedType',
            'score',
            'importantWords',
            'tokens',
            'explanation',
            'linguisticBreakdown',
          ],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');
    res.json(parsedJson);
  } catch (error: any) {
    console.error('API Error in /api/analyze-sentiment:', error);
    // Graceful fallback to heuristic if Gemini rate-limited or transient error
    const fallback = fallbackHeuristicAnalysis(req.body.text || '', req.body.language || 'auto');
    res.json(fallback);
  }
});

// Pre-curated Academic Benchmark Dataset for College Presentation & Evaluation
app.get('/api/benchmarks', (req, res) => {
  const benchmarks = [
    {
      id: 'bench-1',
      text: 'Ivattu movie tumba super agittu!',
      language: 'Kannada-English',
      expectedSentiment: 'Positive',
    },
    {
      id: 'bench-2',
      text: 'This product chennagilla, waste.',
      language: 'Kannada-English',
      expectedSentiment: 'Negative',
    },
    {
      id: 'bench-3',
      text: 'Mujhe ye phone bahut accha laga',
      language: 'Hindi-English',
      expectedSentiment: 'Positive',
    },
    {
      id: 'bench-4',
      text: 'Service is bahut bad yaar, completely disappointed',
      language: 'Hindi-English',
      expectedSentiment: 'Negative',
    },
    {
      id: 'bench-5',
      text: 'Food okay ide, nothing special.',
      language: 'Kannada-English',
      expectedSentiment: 'Neutral',
    },
    {
      id: 'bench-6',
      text: 'Indha padam romba semma ah irukku, must watch!',
      language: 'Tamil-English',
      expectedSentiment: 'Positive',
    },
    {
      id: 'bench-7',
      text: 'Waste product, call center la yarum answer pannala, kashtam.',
      language: 'Tamil-English',
      expectedSentiment: 'Negative',
    },
    {
      id: 'bench-8',
      text: 'Ee cinema chala bagundi, actors performance next level!',
      language: 'Telugu-English',
      expectedSentiment: 'Positive',
    },
    {
      id: 'bench-9',
      text: 'Worst experience asalu nachaledu, waste of ticket money.',
      language: 'Telugu-English',
      expectedSentiment: 'Negative',
    },
    {
      id: 'bench-10',
      text: 'Ee film adipoli aayirunnu, cinematography super!',
      language: 'Malayalam-English',
      expectedSentiment: 'Positive',
    },
    {
      id: 'bench-11',
      text: 'Valare mosham service, delivery time il vannilla.',
      language: 'Malayalam-English',
      expectedSentiment: 'Negative',
    },
    {
      id: 'bench-12',
      text: 'Ha picture khup sundar ahe, story lay bhari hoti!',
      language: 'Marathi-English',
      expectedSentiment: 'Positive',
    },
    {
      id: 'bench-13',
      text: 'Kahi pan kartat company wale, totally waste of money ahe.',
      language: 'Marathi-English',
      expectedSentiment: 'Negative',
    },
    {
      id: 'bench-14',
      text: 'Meeting kal 4 PM ko scheduled ahe.',
      language: 'Marathi-English',
      expectedSentiment: 'Neutral',
    },
  ];

  res.json(benchmarks);
});

// Setup Vite development middleware or static production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Code-Mixed Sentiment Analysis Server active on port ${PORT}`);
  });
}

startServer();
