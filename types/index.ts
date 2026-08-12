import type { Story, Line, StoryProgress, Streak, Subscription, User, WordBankEntry, FrequencyBand, VocabWord, MasteryLevel, VocabGroup, VocabGroupWord, VocabGroupProgress } from "@prisma/client";

export type { Story, Line, StoryProgress, Streak, Subscription, User, WordBankEntry, FrequencyBand, VocabWord, MasteryLevel, VocabGroup, VocabGroupWord, VocabGroupProgress };

export type VocabGroupWithWords = VocabGroup & {
  words: VocabGroupWord[];
};

export type WordBankEntryWithStory = WordBankEntry & {
  story: { title: string; slug: string };
};

export type VocabWordWithStory = VocabWord & {
  story: { title: string; slug: string };
};

export type VocabWordWithLine = VocabWordWithStory & {
  line: { text: string };
};

export type StoryWithLines = Story & {
  lines: Line[];
  tags: { tag: string }[];
};

export type StoryWithProgress = Story & {
  progress: StoryProgress[];
};

export type ProgressWithStory = StoryProgress & {
  story: Story;
};

export type UserWithDetails = User & {
  streak: Streak | null;
  subscription: Subscription | null;
};

export type ReaderState = "idle" | "typing" | "completed";

export interface LineAttemptPayload {
  storyId: string;
  lineId: string;
  attempt: string;
  score: number;
  passed: boolean;
  timeMs: number;
}

export interface LineResult {
  lineId: string;
  position: number;
  score: number;
  passed: boolean;
  xp: number;
}

export interface GeneratedStory {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  topic: string;
  lines: { position: number; text: string; translation: string }[];
}

export type Translations = Record<string, string>;

export interface VocabTag {
  word: string;
  translations: Translations;
  example: string;
  difficulty: "new" | "review";
  frequencyRank: FrequencyBand;
}

export type Tier = "FREE" | "PRO";
