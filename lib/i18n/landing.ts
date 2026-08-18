import type { LanguageCode } from "@/lib/languages";

export type LandingLangCode = LanguageCode | "en";

export interface LandingStoryItem {
  title: string;
  overlay: string;
  level: string;
  lines: number;
  minutes: number;
}

export interface LandingCopy {
  nav: {
    howItWorks: string;
    stories: string;
    pricing: string;
    startForFree: string;
    goToLibrary: string;
  };
  hero: {
    eyebrow: string;
    line1: string;
    line2Pre: string;
    line2Emphasis: string;
    line2Post: string;
    subPre: string;
    subStrong: string;
    subLine2: string;
    ctaBegin: string;
    ctaLibrary: string;
    ctaHow: string;
  };
  demo: {
    header: string;
    chapter: string;
    translation: string;
    wpm: string;
    accuracy: string;
    streak: string;
  };
  how: {
    eyebrow: string;
    line1: string;
    line2: string;
    paragraph: string;
    steps: { title: string; body: string }[];
  };
  storiesSection: {
    eyebrow: string;
    heading: string;
    linesUnit: string;
    minUnit: string;
    items: LandingStoryItem[];
  };
  stats: [string, string, string, string];
  pricing: {
    eyebrow: string;
    line1: string;
    line2: string;
    free: { name: string; priceSuffix: string; features: string[]; muted: string[]; cta: string };
    pro: { badge: string; name: string; priceSuffix: string; features: string[]; cta: string };
  };
  ctaBand: {
    line1: string;
    line2Emphasis: string;
    paragraph: string;
    cta: string;
  };
  footer: {
    about: string;
    stories: string;
    pricing: string;
    privacy: string;
    terms: string;
  };
}

const STORY_NUMBERS = [
  { lines: 18, minutes: 6 },
  { lines: 24, minutes: 9 },
  { lines: 14, minutes: 5 },
  { lines: 32, minutes: 12 },
  { lines: 20, minutes: 8 },
];

function items(titles: string[], overlays: string[], levels: [string, string, string]): LandingStoryItem[] {
  // level order per story: beginner, intermediate, beginner, advanced, intermediate
  const order = [levels[0], levels[1], levels[0], levels[2], levels[1]];
  return titles.map((title, i) => ({
    title,
    overlay: overlays[i],
    level: order[i],
    lines: STORY_NUMBERS[i].lines,
    minutes: STORY_NUMBERS[i].minutes,
  }));
}

export const LANDING_COPY: Record<LandingLangCode, LandingCopy> = {
  en: {
    nav: { howItWorks: "How it works", stories: "Stories", pricing: "Pricing", startForFree: "Start for free", goToLibrary: "Go to library" },
    hero: {
      eyebrow: "English through stories — for language learners",
      line1: "Learn English",
      line2Pre: "by ",
      line2Emphasis: "retracing",
      line2Post: " it.",
      subPre: "Read a line. Hear it spoken. ",
      subStrong: "Type it from memory.",
      subLine2: "Real stories, not flashcards — fluency built one sentence at a time.",
      ctaBegin: "Begin your first story →",
      ctaLibrary: "Go to library →",
      ctaHow: "See how it works",
    },
    demo: {
      header: "The Old Lighthouse — Line 3 of 18",
      chapter: "Chapter 1 · Beginner",
      translation: "The keeper climbed the spiral stairs every night without fail.",
      wpm: "WPM",
      accuracy: "accuracy",
      streak: "day streak",
    },
    how: {
      eyebrow: "The method",
      line1: "Three steps.",
      line2: "One deep habit.",
      paragraph: "Rote drilling doesn't stick. Retrace builds fluency through the natural rhythm of reading, listening, and recall — the same way children learn.",
      steps: [
        { title: "Read the line", body: "A single sentence appears in full — level-appropriate, from a real story. You read it, absorb it, feel the rhythm." },
        { title: "Hear it spoken", body: "Audio narration plays automatically. Natural pacing, native accent. Hear how it sounds before you have to produce it." },
        { title: "Type it back", body: "Type the line from memory, character by character. Each correct keystroke lights up. Wrong keys don't advance — accuracy is the only way through." },
      ],
    },
    storiesSection: {
      eyebrow: "The library",
      heading: "Stories worth retracing.",
      linesUnit: "lines",
      minUnit: "min",
      items: items(
        ["The Old Lighthouse", "A Letter Never Sent", "Market Morning", "The Last Train North", "Two Cities, One Map"],
        ["beacon", "journey", "life", "travel", "memory"],
        ["Beginner", "Intermediate", "Advanced"]
      ),
    },
    stats: ["Languages supported", "Difficulty levels", "Topics covered", "Ads, ever"],
    pricing: {
      eyebrow: "Plans",
      line1: "Start free.",
      line2: "Go further with Pro.",
      free: {
        name: "Free",
        priceSuffix: "forever",
        features: ["5 beginner stories", "Native-language translation toggle", "WPM & accuracy tracking", "Day streak"],
        muted: ["Premium story library", "Playback speed control", "Offline mode"],
        cta: "Create free account",
      },
      pro: {
        badge: "Pro",
        name: "Pro",
        priceSuffix: "per month · cancel anytime",
        features: [
          "The complete story library",
          "Native-language translation toggle",
          "WPM & accuracy tracking",
          "Day streak",
          "Premium story library",
          "Playback speed (0.6× – 1.25×)",
          "Offline mode",
        ],
        cta: "Start Pro free for 7 days",
      },
    },
    ctaBand: {
      line1: "Your first story",
      line2Emphasis: "is waiting for you.",
      paragraph: "No app to download. No account required to start. Just open a story and begin.",
      cta: "Begin retracing →",
    },
    footer: { about: "About", stories: "Stories", pricing: "Pricing", privacy: "Privacy", terms: "Terms" },
  },

  ar: {
    nav: { howItWorks: "كيف يعمل", stories: "القصص", pricing: "الأسعار", startForFree: "ابدأ مجانًا", goToLibrary: "الذهاب إلى المكتبة" },
    hero: {
      eyebrow: "تعلّم الإنجليزية عبر القصص — للناطقين بالعربية",
      line1: "تعلّم الإنجليزية",
      line2Pre: "عبر ",
      line2Emphasis: "إعادة تتبّعها",
      line2Post: ".",
      subPre: "اقرأ الجملة. استمع إليها منطوقة. ",
      subStrong: "اكتبها من الذاكرة.",
      subLine2: "قصص حقيقية لا بطاقات تعليمية — طلاقة تُبنى جملة تلو الأخرى.",
      ctaBegin: "ابدأ قصتك الأولى ←",
      ctaLibrary: "الذهاب إلى المكتبة ←",
      ctaHow: "شاهد كيف يعمل",
    },
    demo: {
      header: "المنارة القديمة — السطر 3 من 18",
      chapter: "الفصل 1 · مبتدئ",
      translation: "كان الحارس يصعد الدرج الحلزوني في كل ليلة دون استثناء.",
      wpm: "WPM",
      accuracy: "الدقة",
      streak: "يوم متتالي",
    },
    how: {
      eyebrow: "المنهج",
      line1: "ثلاث خطوات.",
      line2: "عادة راسخة واحدة.",
      paragraph: "الحفظ الآلي لا يدوم. يبني Retrace الطلاقة عبر الإيقاع الطبيعي للقراءة والاستماع والتذكر — بالطريقة نفسها التي يتعلم بها الأطفال.",
      steps: [
        { title: "اقرأ السطر", body: "تظهر جملة واحدة كاملة — مناسبة لمستواك، من قصة حقيقية. تقرأها، تستوعبها، وتشعر بإيقاعها." },
        { title: "استمع إليها منطوقة", body: "يُشغَّل التعليق الصوتي تلقائيًا، بإيقاع طبيعي ولكنة أصلية. اسمع كيف تُنطق قبل أن تحاول إنتاجها بنفسك." },
        { title: "اكتبها من الذاكرة", body: "اكتب السطر من الذاكرة، حرفًا بحرف. كل ضغطة صحيحة تُضيء. المفاتيح الخاطئة لا تُقدّمك — فالدقة هي الطريق الوحيد للمتابعة." },
      ],
    },
    storiesSection: {
      eyebrow: "المكتبة",
      heading: "قصص تستحق أن تُعاد كتابتها.",
      linesUnit: "سطر",
      minUnit: "د",
      items: items(
        ["المنارة القديمة", "رسالة لم تُرسل أبدًا", "صباح السوق", "القطار الأخير نحو الشمال", "مدينتان، خريطة واحدة"],
        ["منار", "رحلة", "حياة", "سفر", "ذاكرة"],
        ["مبتدئ", "متوسط", "متقدم"]
      ),
    },
    stats: ["لغات مدعومة", "مستويات الصعوبة", "مواضيع متاحة", "إعلانات، أبدًا"],
    pricing: {
      eyebrow: "الخطط",
      line1: "ابدأ مجانًا.",
      line2: "تقدّم أكثر مع Pro.",
      free: {
        name: "مجاني",
        priceSuffix: "إلى الأبد",
        features: ["5 قصص للمبتدئين", "خيار الترجمة بلغتك الأم", "تتبّع سرعة الكتابة والدقة", "سلسلة أيام متتالية"],
        muted: ["مكتبة قصص مميزة", "تحكم بسرعة التشغيل", "وضع عدم الاتصال"],
        cta: "أنشئ حسابًا مجانيًا",
      },
      pro: {
        badge: "Pro",
        name: "Pro",
        priceSuffix: "شهريًا · ألغِ في أي وقت",
        features: [
          "مكتبة القصص كاملة",
          "خيار الترجمة بلغتك الأم",
          "تتبّع سرعة الكتابة والدقة",
          "سلسلة أيام متتالية",
          "مكتبة قصص مميزة",
          "سرعة تشغيل (0.6× – 1.25×)",
          "وضع عدم الاتصال",
        ],
        cta: "جرّب Pro مجانًا لمدة 7 أيام",
      },
    },
    ctaBand: {
      line1: "قصتك الأولى",
      line2Emphasis: "بانتظارك.",
      paragraph: "لا حاجة لتنزيل تطبيق. لا حاجة لحساب للبدء. فقط افتح قصة وابدأ.",
      cta: "ابدأ إعادة التتبّع ←",
    },
    footer: { about: "حول", stories: "القصص", pricing: "الأسعار", privacy: "الخصوصية", terms: "الشروط" },
  },

  fr: {
    nav: { howItWorks: "Comment ça marche", stories: "Histoires", pricing: "Tarifs", startForFree: "Commencer gratuitement", goToLibrary: "Accéder à la bibliothèque" },
    hero: {
      eyebrow: "Apprenez l'anglais à travers des histoires — pour les francophones",
      line1: "Apprenez l'anglais",
      line2Pre: "en le ",
      line2Emphasis: "retraçant",
      line2Post: ".",
      subPre: "Lisez une ligne. Écoutez-la prononcée. ",
      subStrong: "Retapez-la de mémoire.",
      subLine2: "De vraies histoires, pas des flashcards — la fluidité se construit phrase après phrase.",
      ctaBegin: "Commencer votre première histoire →",
      ctaLibrary: "Accéder à la bibliothèque →",
      ctaHow: "Voir comment ça marche",
    },
    demo: {
      header: "Le Vieux Phare — Ligne 3 sur 18",
      chapter: "Chapitre 1 · Débutant",
      translation: "Le gardien montait l'escalier en colimaçon chaque nuit, sans exception.",
      wpm: "MPM",
      accuracy: "précision",
      streak: "jours d'affilée",
    },
    how: {
      eyebrow: "La méthode",
      line1: "Trois étapes.",
      line2: "Une habitude profonde.",
      paragraph: "L'apprentissage par cœur ne dure pas. Retrace construit la fluidité grâce au rythme naturel de la lecture, de l'écoute et du rappel — comme les enfants apprennent.",
      steps: [
        { title: "Lisez la ligne", body: "Une phrase complète apparaît — adaptée à votre niveau, tirée d'une vraie histoire. Vous la lisez, l'absorbez, en ressentez le rythme." },
        { title: "Écoutez-la prononcée", body: "La narration audio se lance automatiquement. Rythme naturel, accent natif. Entendez-la avant d'avoir à la reproduire." },
        { title: "Retapez-la", body: "Tapez la ligne de mémoire, caractère par caractère. Chaque frappe correcte s'illumine. Les erreurs ne font pas avancer — seule la précision permet de continuer." },
      ],
    },
    storiesSection: {
      eyebrow: "La bibliothèque",
      heading: "Des histoires qui méritent d'être retracées.",
      linesUnit: "lignes",
      minUnit: "min",
      items: items(
        ["Le Vieux Phare", "Une lettre jamais envoyée", "Matin de marché", "Le dernier train vers le nord", "Deux villes, une carte"],
        ["phare", "périple", "vie", "voyage", "mémoire"],
        ["Débutant", "Intermédiaire", "Avancé"]
      ),
    },
    stats: ["Langues prises en charge", "Niveaux de difficulté", "Thèmes couverts", "Publicités, jamais"],
    pricing: {
      eyebrow: "Offres",
      line1: "Commencez gratuitement.",
      line2: "Allez plus loin avec Pro.",
      free: {
        name: "Gratuit",
        priceSuffix: "à vie",
        features: ["5 histoires débutant", "Traduction dans votre langue maternelle", "Suivi de la vitesse et de la précision", "Série de jours"],
        muted: ["Bibliothèque premium", "Contrôle de la vitesse de lecture", "Mode hors ligne"],
        cta: "Créer un compte gratuit",
      },
      pro: {
        badge: "Pro",
        name: "Pro",
        priceSuffix: "par mois · annulez à tout moment",
        features: [
          "La bibliothèque complète",
          "Traduction dans votre langue maternelle",
          "Suivi de la vitesse et de la précision",
          "Série de jours",
          "Bibliothèque premium",
          "Vitesse de lecture (0,6× – 1,25×)",
          "Mode hors ligne",
        ],
        cta: "Essayez Pro gratuitement pendant 7 jours",
      },
    },
    ctaBand: {
      line1: "Votre première histoire",
      line2Emphasis: "vous attend.",
      paragraph: "Pas d'application à télécharger. Aucun compte requis pour commencer. Ouvrez simplement une histoire et démarrez.",
      cta: "Commencer à retracer →",
    },
    footer: { about: "À propos", stories: "Histoires", pricing: "Tarifs", privacy: "Confidentialité", terms: "Conditions" },
  },

  tr: {
    nav: { howItWorks: "Nasıl çalışır", stories: "Hikâyeler", pricing: "Fiyatlandırma", startForFree: "Ücretsiz başla", goToLibrary: "Kütüphaneye git" },
    hero: {
      eyebrow: "Hikâyelerle İngilizce öğrenin — Türkçe konuşanlar için",
      line1: "İngilizceyi",
      line2Pre: "",
      line2Emphasis: "yeniden izleyerek",
      line2Post: " öğren.",
      subPre: "Bir satır oku. Söylenişini dinle. ",
      subStrong: "Ezberden yeniden yaz.",
      subLine2: "Kart değil, gerçek hikâyeler — akıcılık cümle cümle inşa edilir.",
      ctaBegin: "İlk hikâyene başla →",
      ctaLibrary: "Kütüphaneye git →",
      ctaHow: "Nasıl çalıştığını gör",
    },
    demo: {
      header: "Eski Deniz Feneri — 18 satırdan 3.",
      chapter: "1. Bölüm · Başlangıç",
      translation: "Bekçi her gece aksatmadan sarmal merdivenleri çıkardı.",
      wpm: "DKS",
      accuracy: "doğruluk",
      streak: "gün seri",
    },
    how: {
      eyebrow: "Yöntem",
      line1: "Üç adım.",
      line2: "Tek köklü alışkanlık.",
      paragraph: "Ezber kalıcı olmaz. Retrace, okuma, dinleme ve hatırlamanın doğal ritmiyle akıcılık kazandırır — tıpkı çocukların öğrendiği gibi.",
      steps: [
        { title: "Satırı oku", body: "Seviyene uygun, gerçek bir hikâyeden tek bir cümle tam olarak görünür. Onu okur, özümser, ritmini hissedersin." },
        { title: "Söylenişini dinle", body: "Sesli anlatım otomatik olarak çalar. Doğal tempo, anadil aksanı. Kendin üretmeden önce nasıl duyulduğunu duy." },
        { title: "Yeniden yaz", body: "Satırı ezberden, harf harf yaz. Her doğru tuş vuruşu parlar. Yanlış tuşlar seni ilerletmez — tek yol doğruluktan geçer." },
      ],
    },
    storiesSection: {
      eyebrow: "Kütüphane",
      heading: "Yeniden yazılmaya değer hikâyeler.",
      linesUnit: "satır",
      minUnit: "dk",
      items: items(
        ["Eski Deniz Feneri", "Hiç Gönderilmeyen Mektup", "Pazar Sabahı", "Kuzeye Giden Son Tren", "İki Şehir, Tek Harita"],
        ["fener", "yolculuk", "hayat", "seyahat", "hafıza"],
        ["Başlangıç", "Orta", "İleri"]
      ),
    },
    stats: ["Desteklenen dil", "Zorluk seviyesi", "Konu başlığı", "Reklam, asla"],
    pricing: {
      eyebrow: "Planlar",
      line1: "Ücretsiz başla.",
      line2: "Pro ile daha ileri git.",
      free: {
        name: "Ücretsiz",
        priceSuffix: "süresiz",
        features: ["5 başlangıç seviyesi hikâye", "Ana dilinde çeviri seçeneği", "Hız ve doğruluk takibi", "Günlük seri"],
        muted: ["Premium hikâye kütüphanesi", "Oynatma hızı kontrolü", "Çevrimdışı mod"],
        cta: "Ücretsiz hesap oluştur",
      },
      pro: {
        badge: "Pro",
        name: "Pro",
        priceSuffix: "aylık · istediğin zaman iptal et",
        features: [
          "Eksiksiz hikâye kütüphanesi",
          "Ana dilinde çeviri seçeneği",
          "Hız ve doğruluk takibi",
          "Günlük seri",
          "Premium hikâye kütüphanesi",
          "Oynatma hızı (0.6× – 1.25×)",
          "Çevrimdışı mod",
        ],
        cta: "Pro'yu 7 gün ücretsiz dene",
      },
    },
    ctaBand: {
      line1: "İlk hikâyen",
      line2Emphasis: "seni bekliyor.",
      paragraph: "İndirilecek bir uygulama yok. Başlamak için hesap gerekmez. Sadece bir hikâye aç ve başla.",
      cta: "İzini sürmeye başla →",
    },
    footer: { about: "Hakkında", stories: "Hikâyeler", pricing: "Fiyatlandırma", privacy: "Gizlilik", terms: "Koşullar" },
  },

  es: {
    nav: { howItWorks: "Cómo funciona", stories: "Historias", pricing: "Precios", startForFree: "Empieza gratis", goToLibrary: "Ir a la biblioteca" },
    hero: {
      eyebrow: "Aprende inglés a través de historias — para hispanohablantes",
      line1: "Aprende inglés",
      line2Pre: "",
      line2Emphasis: "retrazándolo",
      line2Post: ".",
      subPre: "Lee una línea. Escúchala hablada. ",
      subStrong: "Escríbela de memoria.",
      subLine2: "Historias reales, no flashcards — la fluidez se construye una frase a la vez.",
      ctaBegin: "Comienza tu primera historia →",
      ctaLibrary: "Ir a la biblioteca →",
      ctaHow: "Ver cómo funciona",
    },
    demo: {
      header: "El Viejo Faro — Línea 3 de 18",
      chapter: "Capítulo 1 · Principiante",
      translation: "El guardián subía la escalera de caracol cada noche sin falta.",
      wpm: "PPM",
      accuracy: "precisión",
      streak: "días seguidos",
    },
    how: {
      eyebrow: "El método",
      line1: "Tres pasos.",
      line2: "Un hábito profundo.",
      paragraph: "La memorización mecánica no perdura. Retrace construye fluidez a través del ritmo natural de leer, escuchar y recordar — igual que aprenden los niños.",
      steps: [
        { title: "Lee la línea", body: "Aparece una sola frase completa — adecuada a tu nivel, de una historia real. La lees, la absorbes, sientes su ritmo." },
        { title: "Escúchala hablada", body: "La narración de audio se reproduce automáticamente. Ritmo natural, acento nativo. Escucha cómo suena antes de tener que producirla." },
        { title: "Escríbela de nuevo", body: "Escribe la línea de memoria, carácter por carácter. Cada pulsación correcta se ilumina. Las teclas equivocadas no avanzan — la precisión es el único camino." },
      ],
    },
    storiesSection: {
      eyebrow: "La biblioteca",
      heading: "Historias que merece la pena retrazar.",
      linesUnit: "líneas",
      minUnit: "min",
      items: items(
        ["El Viejo Faro", "Una carta nunca enviada", "Mañana de mercado", "El último tren al norte", "Dos ciudades, un mapa"],
        ["faro", "travesía", "vida", "viaje", "memoria"],
        ["Principiante", "Intermedio", "Avanzado"]
      ),
    },
    stats: ["Idiomas admitidos", "Niveles de dificultad", "Temas cubiertos", "Anuncios, nunca"],
    pricing: {
      eyebrow: "Planes",
      line1: "Empieza gratis.",
      line2: "Ve más lejos con Pro.",
      free: {
        name: "Gratis",
        priceSuffix: "para siempre",
        features: ["5 historias para principiantes", "Traducción en tu idioma nativo", "Seguimiento de velocidad y precisión", "Racha de días"],
        muted: ["Biblioteca premium", "Control de velocidad de reproducción", "Modo sin conexión"],
        cta: "Crear cuenta gratis",
      },
      pro: {
        badge: "Pro",
        name: "Pro",
        priceSuffix: "al mes · cancela cuando quieras",
        features: [
          "La biblioteca completa",
          "Traducción en tu idioma nativo",
          "Seguimiento de velocidad y precisión",
          "Racha de días",
          "Biblioteca premium",
          "Velocidad de reproducción (0,6× – 1,25×)",
          "Modo sin conexión",
        ],
        cta: "Prueba Pro gratis durante 7 días",
      },
    },
    ctaBand: {
      line1: "Tu primera historia",
      line2Emphasis: "te está esperando.",
      paragraph: "No hay que descargar ninguna app. No se necesita cuenta para empezar. Solo abre una historia y comienza.",
      cta: "Empieza a retrazar →",
    },
    footer: { about: "Acerca de", stories: "Historias", pricing: "Precios", privacy: "Privacidad", terms: "Términos" },
  },

};

export function getLandingCopy(code: string): LandingCopy {
  return LANDING_COPY[code as LandingLangCode] ?? LANDING_COPY.en;
}

// The hero demo types out this exact English sentence for every locale — the target
// language being learned is always English, only the translation beneath it changes.
export const DEMO_SENTENCE_TYPED = "The keeper climbed ";
export const DEMO_SENTENCE_REST = "the spiral stairs every night without fail.";
