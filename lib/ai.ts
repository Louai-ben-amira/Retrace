import OpenAI from "openai";
import { z } from "zod";
import type { GeneratedStory, VocabTag } from "@/types";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODEL = "gpt-4o-mini";

// ── Story generation ───────────────────────────────────────────────────────

const GeneratedStorySchema = z.object({
  title: z.string(),
  titleAr: z.string(),
  description: z.string(),
  descriptionAr: z.string(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  topic: z.string(),
  lines: z.array(z.object({
    position: z.number(),
    text: z.string(),
    translation: z.string(),
  })),
});

export async function generateStory(
  difficulty: string,
  topic: string,
  customPrompt?: string
): Promise<GeneratedStory> {
  const systemPrompt = `You are a content creator for a language-learning app for Arabic speakers learning English.
Generate short English stories with Arabic translations.

Rules:
- Split into 8–15 lines (complete sentences)
- BEGINNER: simple vocabulary, short sentences, A1–A2 level
- INTERMEDIATE: moderate vocabulary, some idioms, B1–B2 level
- ADVANCED: complex vocabulary, varied sentence structures, C1–C2 level
- Culturally neutral, appropriate for all ages
- No politics, violence, or adult themes

Respond ONLY with valid JSON. No markdown. No explanation. Exact shape:
{
  "title": "...",
  "titleAr": "...",
  "description": "...",
  "descriptionAr": "...",
  "difficulty": "BEGINNER|INTERMEDIATE|ADVANCED",
  "topic": "...",
  "lines": [{ "position": 1, "text": "...", "translation": "..." }]
}`;

  const userPrompt = customPrompt
    ?? `Generate a ${difficulty} level English story about the topic: ${topic}. Include Arabic translations for every line.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  return GeneratedStorySchema.parse(JSON.parse(raw));
}

// ── Vocab tagging ─────────────────────────────────────────────────────────

const VocabTagsSchema = z.array(z.object({
  word: z.string(),
  translation: z.string(),
  example: z.string(),
  difficulty: z.enum(["new", "review"]),
  frequencyRank: z.enum(["TOP_500", "TOP_1000", "TOP_2000", "TOP_5000", "BEYOND_5000"]),
}));

export async function tagLineVocab(
  lineText: string,
  difficulty: string
): Promise<VocabTag[]> {
  const prompt = `Given this English sentence for a ${difficulty} level learner, identify key vocabulary words with Arabic translations and a short usage example.
Only include words that are genuinely useful to highlight — not every word.
The example must be a different sentence from the one given, showing the word used naturally.
For each word, also classify how common it is in everyday spoken English using your knowledge of English word frequency — one of: "TOP_500" (one of the ~500 most common English words, e.g. "go", "time"), "TOP_1000", "TOP_2000", "TOP_5000", or "BEYOND_5000" (rarer, specialized, or literary words).
Respond with JSON only, in this exact shape:
{"tags": [{"word":"string","translation":"string","example":"string","difficulty":"new"|"review","frequencyRank":"TOP_500"|"TOP_1000"|"TOP_2000"|"TOP_5000"|"BEYOND_5000"}]}

Sentence: "${lineText}"`;

  const response = await client.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.choices[0]?.message?.content ?? '{"tags":[]}';
  const parsed = JSON.parse(raw);
  const tags = VocabTagsSchema.parse(parsed.tags ?? []);

  // The AI only ever seeds the Arabic translation directly; other languages are filled
  // in later via translateWords(), keyed onto the same tag by `word`.
  return tags.map(({ translation, ...tag }) => ({ ...tag, translations: { ar: translation } }));
}

// ── Vocab group generation (admin-curated word lists) ──────────────────────

const VocabGroupWordsSchema = z.array(z.object({
  word: z.string(),
  translation: z.string(),
  example: z.string(),
}));

export interface GeneratedVocabGroupWord {
  word: string;
  translation: string;
  example: string;
}

export async function generateVocabGroupWords(
  groupName: string,
  difficulty: string,
  wordCount: number
): Promise<GeneratedVocabGroupWord[]> {
  const prompt = `You are building a curated English vocabulary list for Arabic-speaking learners, for a study group called "${groupName}" at a ${difficulty} level.
Generate exactly ${wordCount} useful, common English words or short phrases that genuinely belong under this topic — no duplicates, no filler.
For each word, give an accurate Arabic translation and one natural example sentence that uses the word in context (a different sentence each time, showing real usage).
Respond with JSON only, in this exact shape:
{"words": [{"word":"string","translation":"string","example":"string"}]}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.choices[0]?.message?.content ?? '{"words":[]}';
  const parsed = JSON.parse(raw);
  return VocabGroupWordsSchema.parse(parsed.words ?? []);
}

// ── Translation QA ────────────────────────────────────────────────────────

const TranslationIssuesSchema = z.array(z.object({
  position: z.number(),
  issue: z.string(),
}));

export interface TranslationIssue {
  position: number;
  issue: string;
}

export async function checkTranslations(
  lines: { position: number; text: string; translation: string }[]
): Promise<TranslationIssue[]> {
  const prompt = `You are reviewing Arabic translations for an English-learning app aimed at Arabic speakers.
For each numbered line below, check whether the Arabic translation is accurate, natural, and idiomatic — not awkward, robotic, or mistranslated.
Only include lines with a genuine problem; omit lines that are fine.
Respond with JSON only, in this exact shape:
{"issues": [{"position": number, "issue": "short description of the problem, in English"}]}
Empty array if every line is fine.

Lines:
${lines.map((l) => `${l.position}. EN: "${l.text}"\n   AR: "${l.translation}"`).join("\n")}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.choices[0]?.message?.content ?? '{"issues":[]}';
  const parsed = JSON.parse(raw);
  return TranslationIssuesSchema.parse(parsed.issues ?? []);
}

// ── Grammar explainer ────────────────────────────────────────────────────

export async function explainGrammar(
  text: string,
  translation: string,
  languageName: string
): Promise<string> {
  const prompt = `You are an English grammar tutor for ${languageName}-speaking learners.
Explain, entirely in ${languageName}, the key grammar point in this English sentence — verb tense, sentence structure, or word order that a learner might find tricky. 2–4 short sentences. Clear and encouraging, not academic.

Sentence: "${text}"
${languageName} translation: "${translation}"

Respond with JSON only, in this exact shape:
{"explanation": "..."}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.choices[0]?.message?.content ?? '{"explanation":""}';
  const parsed = JSON.parse(raw);
  return z.string().parse(parsed.explanation);
}

// ── Story line translation (multi-language) ─────────────────────────────────

const TranslatedSentencesSchema = z.array(z.string());

/**
 * Translates a batch of English sentences into the target language.
 * Used by the admin "AI translate" action to fill in Line.translations[locale]
 * for every line in a story, in one request per language.
 */
export async function translateStoryLines(
  sentences: string[],
  languageName: string
): Promise<string[]> {
  const prompt = `Translate these English sentences into ${languageName} for a language learning app.
Learners are ${languageName} speakers learning English.
Keep translations natural and clear — not overly literal.
Return ONLY a JSON array of translated strings in the same order as input.
No markdown, no explanation.

Sentences: ${JSON.stringify(sentences)}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: `${prompt}\n\nRespond with JSON only, in this exact shape: {"translations": ["...", "..."]}`,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? '{"translations":[]}';
  const parsed = JSON.parse(raw);
  return TranslatedSentencesSchema.parse(parsed.translations ?? []);
}

/**
 * Translates a batch of individual English words/short phrases into the target
 * language — used for vocabulary (Line.vocabTags and VocabGroupWord translations)
 * rather than full sentences, so the prompt is tuned for single-word accuracy.
 */
export async function translateWords(
  words: string[],
  languageName: string
): Promise<string[]> {
  const prompt = `Translate these English vocabulary words into ${languageName} for a language learning app.
Learners are ${languageName} speakers learning English.
Give the single most natural, common translation for each word — the one a learner would actually use, not a literal dictionary gloss.
Return ONLY a JSON array of translated strings in the same order as input.
No markdown, no explanation.

Words: ${JSON.stringify(words)}

Respond with JSON only, in this exact shape: {"translations": ["...", "..."]}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.choices[0]?.message?.content ?? '{"translations":[]}';
  const parsed = JSON.parse(raw);
  return TranslatedSentencesSchema.parse(parsed.translations ?? []);
}
