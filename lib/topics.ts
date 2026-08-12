import type { Translations } from "@/types";

export interface TopicMeta {
  key: string;
  label: string;
  translations: Translations;
  emoji: string;
}

export const TOPICS: TopicMeta[] = [
  {
    key: "daily-life",
    label: "Daily life",
    emoji: "🏠",
    translations: {
      ar: "الحياة اليومية",
      fr: "Vie quotidienne",
      tr: "Günlük yaşam",
      es: "Vida diaria",
    },
  },
  {
    key: "family",
    label: "Family",
    emoji: "👨‍👩‍👧",
    translations: {
      ar: "العائلة",
      fr: "Famille",
      tr: "Aile",
      es: "Familia",
    },
  },
  {
    key: "travel",
    label: "Travel",
    emoji: "✈️",
    translations: {
      ar: "السفر",
      fr: "Voyage",
      tr: "Seyahat",
      es: "Viajes",
    },
  },
  {
    key: "work",
    label: "Work",
    emoji: "💼",
    translations: {
      ar: "العمل",
      fr: "Travail",
      tr: "İş",
      es: "Trabajo",
    },
  },
  {
    key: "culture",
    label: "Culture",
    emoji: "🎭",
    translations: {
      ar: "الثقافة",
      fr: "Culture",
      tr: "Kültür",
      es: "Cultura",
    },
  },
  {
    key: "food",
    label: "Food",
    emoji: "🍲",
    translations: {
      ar: "الطعام",
      fr: "Nourriture",
      tr: "Yemek",
      es: "Comida",
    },
  },
  {
    key: "health",
    label: "Health",
    emoji: "🏥",
    translations: {
      ar: "الصحة",
      fr: "Santé",
      tr: "Sağlık",
      es: "Salud",
    },
  },
  {
    key: "education",
    label: "Education",
    emoji: "📚",
    translations: {
      ar: "التعليم",
      fr: "Éducation",
      tr: "Eğitim",
      es: "Educación",
    },
  },
];

export const TOPIC_KEYS = TOPICS.map((t) => t.key);

const TOPIC_MAP = new Map(TOPICS.map((t) => [t.key, t]));

const GENERAL_TRANSLATIONS: Translations = {
  ar: "عام",
  fr: "Général",
  tr: "Genel",
  es: "General",
};

export function topicMeta(key: string | null | undefined): TopicMeta {
  if (key && TOPIC_MAP.has(key)) return TOPIC_MAP.get(key)!;
  return { key: key ?? "general", label: key ?? "General", translations: GENERAL_TRANSLATIONS, emoji: "📖" };
}
