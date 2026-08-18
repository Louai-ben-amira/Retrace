import type { LanguageCode } from "@/lib/languages";

// Arabic counted-noun forms: 1 / 2 / 3+ (simplified from full CLDR few/many/other).
function ar3(n: number, one: string, two: string, many: string): string {
  if (n === 1) return one;
  if (n === 2) return two;
  return many;
}

// French/Spanish: singular only at exactly 1, plural otherwise (incl. 0).
function fr2(n: number, singular: string, plural: string): string {
  return n === 1 ? singular : plural;
}

export interface AppCopy {
  common: {
    difficulty: { BEGINNER: string; INTERMEDIATE: string; ADVANCED: string };
    mastery: { new: string; learning: string; good: string; mastered: string };
    rating: { forgot: string; hard: string; good: string; easy: string };
    pro: string;
    free: string;
    locked: string;
    words: (n: number) => string;
    close: string;
  };
  nav: {
    library: string;
    wordbank: string;
    vocabulary: string;
    progress: string;
    settings: string;
    admin: string;
    switchReadingLanguage: string;
    readingLanguage: string;
    mainNavigation: string;
  };
  settings: {
    title: string;
    account: string;
    name: string;
    email: string;
    memberSince: string;
    languagePreferences: string;
    appLanguage: string;
    appLanguageHint: string;
    nativeLanguage: string;
    nativeLanguageHint: string;
    learning: string;
    learningHint: string;
    subscription: string;
    status: string;
    renews: string;
    manageViaReceipt: string;
    upgradeCopy: string;
    upgradeCta: string;
    checkoutError: string;
    savedToast: string;
    errorToast: string;
  };
  library: {
    title: string;
    subtitle: string;
    allLevels: string;
    emptyTitle: string;
    emptySubtitle: string;
    completed: string;
    inProgress: string;
    notStarted: string;
  };
  progress: {
    title: string;
    dayStreak: string;
    bestStreakLabel: string;
    bestStreak: (n: number) => string;
    storiesCompleted: string;
    linesTyped: string;
    totalXp: string;
    inProgressSection: string;
    completedSection: string;
    lastStudied: (pct: number, date: string) => string;
    completedOn: (date: string) => string;
    empty: string;
    browseLibrary: string;
  };
  reader: {
    readyToRetrace: string;
    start: string;
    startHint: string;
    lineOf: (current: number, total: number) => string;
    whyThisLine: string;
    hideGrammarNote: string;
    grammarNoteError: string;
    storyComplete: string;
    retraceAgain: string;
    goToLibrary: string;
    score: string;
    xp: string;
    wpm: string;
    linesRetraced: (n: number) => string;
    muteKeySound: string;
    unmuteKeySound: string;
    keySoundOn: string;
    keySoundMuted: string;
    noLinesYet: string;
    replayLine: string;
    upgradeForSpeed: string;
    tryAgain: string;
    hereIsTheAnswer: string;
    typeTheLine: string;
    showTranslation: string;
    hideTranslation: string;
    tapToType: string;
  };
  wordbank: {
    pageTitle: string;
    pageSubtitle: string;
    myWordsTitle: string;
    myWordsSubtitle: string;
    emptyTitle: string;
    emptyBody: string;
    startCollecting: string;
    allTopics: string;
    dueForReview: string;
    dueForReviewSub: string;
    weakWords: string;
    weakWordsSub: string;
    masteredFilter: string;
    masteredFilterSub: string;
    byTopic: string;
    byStory: string;
    wordsReadyToReview: (n: number) => string;
    spacedRepetitionHint: string;
    startReviewSession: string;
    upgradeToReview: string;
    noWordsInCategory: string;
    todaysWords: string;
    searchTopics: string;
    viewGrid: string;
    viewList: string;
    viewFlashcard: string;
    noTopicsMatch: (query: string) => string;
    readMoreToUnlock: string;
    backToAllTopics: string;
    backToGroups: string;
    backToWordBank: string;
    backToVocabulary: string;
    wordsFromStory: (n: number) => string;
    wordsFromTopic: (n: number) => string;
    readItAgain: string;
    allCaughtUp: string;
    noCardsDue: string;
    noWordsDue: string;
    sessionComplete: string;
    cardOf: (current: number, total: number) => string;
    reviewedCount: (n: number) => string;
    leveledUp: (n: number) => string;
    nextIn: (days: number) => string;
    backToWordBankBtn: string;
    backToVocabularyBtn: string;
    whatDoesThisMean: string;
    tapToReveal: string;
    fromStory: (title: string) => string;
    reviewHint: string;
    seenTimes: (n: number) => string;
    fromPrefix: string;
  };
  vocabulary: {
    pageTitle: string;
    pageSubtitle: string;
    myWords: string;
    comingSoon: string;
    wordCount: (n: number) => string;
    preparingGroup: string;
    upgradeToUnlock: string;
    learnedProgress: (learned: number, total: number) => string;
    notStarted: string;
    markAsLearned: string;
    learned: string;
    playPronunciation: string;
  };
  streak: {
    greatWorkToday: (days: number) => string;
    keepItAlive: (days: number) => string;
    startToday: string;
    yourBest: (days: number) => string;
    continueReading: string;
    startReading: string;
    dismiss: string;
  };
  continueReading: {
    label: string;
    minutesLeft: (minutes: string) => string;
    cta: string;
  };
  notifications: {
    prompt: string;
    enable: string;
  };
  push: {
    wordOfTheDay: string;
  };
  errors: {
    genericTitle: string;
    genericBody: string;
    tryAgain: string;
    notFoundTitle: string;
    notFoundBody: string;
    backToLibrary: string;
    offlineTitle: string;
    offlineBody: string;
  };
}

export const APP_COPY: Record<LanguageCode, AppCopy> = {
  ar: {
    common: {
      difficulty: { BEGINNER: "مبتدئ", INTERMEDIATE: "متوسط", ADVANCED: "متقدم" },
      mastery: { new: "جديد", learning: "قيد التعلم", good: "جيد", mastered: "متقن" },
      rating: { forgot: "نسيت", hard: "صعب", good: "جيد", easy: "سهل" },
      pro: "برو",
      free: "مجاني",
      locked: "مقفل",
      words: (n) => ar3(n, "كلمة واحدة", "كلمتان", `${n} كلمة`),
      close: "إغلاق",
    },
    nav: {
      library: "المكتبة",
      wordbank: "بنك الكلمات",
      vocabulary: "المفردات",
      progress: "التقدم",
      settings: "الإعدادات",
      admin: "الإدارة",
      switchReadingLanguage: "تبديل لغة القراءة",
      readingLanguage: "لغة القراءة",
      mainNavigation: "التنقل الرئيسي",
    },
    settings: {
      title: "الإعدادات",
      account: "الحساب",
      name: "الاسم",
      email: "البريد الإلكتروني",
      memberSince: "عضو منذ",
      languagePreferences: "تفضيلات اللغة",
      appLanguage: "لغة التطبيق",
      appLanguageHint: "القوائم والأزرار والرسائل",
      nativeLanguage: "لغتي الأم",
      nativeLanguageHint: "الترجمات المعروضة أثناء القراءة",
      learning: "أتعلم",
      learningHint: "المزيد من اللغات قريبًا",
      subscription: "الاشتراك",
      status: "الحالة",
      renews: "يتجدد في",
      manageViaReceipt: "لتحديث بيانات الدفع أو إلغاء الاشتراك، استخدم الرابط الموجود في رسالة إيصال Paddle.",
      upgradeCopy: "قم بالترقية إلى برو لفتح جميع القصص والمحتوى المولّد بالذكاء الاصطناعي والتحكم في سرعة الصوت.",
      upgradeCta: "الترقية إلى برو",
      checkoutError: "تعذّر فتح صفحة الدفع. يُرجى المحاولة مرة أخرى.",
      savedToast: "تم حفظ التفضيلات.",
      errorToast: "تعذر حفظ التغيير — حاول مرة أخرى.",
    },
    library: {
      title: "مكتبة القصص",
      subtitle: "اختر قصة لتبدأ أو تكمل التعلّم.",
      allLevels: "كل المستويات",
      emptyTitle: "لا توجد قصص في هذا المستوى بعد",
      emptySubtitle: "المزيد قريبًا — جرّب مستوى آخر الآن.",
      completed: "مكتملة",
      inProgress: "قيد التقدم",
      notStarted: "لم تبدأ",
    },
    progress: {
      title: "تقدمي",
      dayStreak: "أيام متتالية",
      bestStreakLabel: "أفضل سلسلة",
      bestStreak: (n) => `${n} يومًا`,
      storiesCompleted: "قصص مكتملة",
      linesTyped: "أسطر مكتوبة",
      totalXp: "إجمالي نقاط الخبرة",
      inProgressSection: "قيد التقدم",
      completedSection: "مكتملة",
      lastStudied: (pct, date) => `${pct}% · آخر دراسة ${date}`,
      completedOn: (date) => `اكتملت في ${date}`,
      empty: "لم تبدأ أي قصة بعد.",
      browseLibrary: "تصفّح المكتبة ←",
    },
    reader: {
      readyToRetrace: "جاهز لإعادة الكتابة",
      start: "ابدأ",
      startHint: "اكتب مع الصوت · اضغط T لإخفاء الترجمة",
      lineOf: (c, t) => `السطر ${c} من ${t}`,
      whyThisLine: "لماذا هذا السطر؟",
      hideGrammarNote: "إخفاء الشرح النحوي",
      grammarNoteError: "تعذر تحميل الشرح الآن.",
      storyComplete: "اكتملت القصة",
      retraceAgain: "أعد الكتابة",
      goToLibrary: "الذهاب إلى المكتبة",
      score: "النتيجة",
      xp: "نقاط الخبرة",
      wpm: "كلمة/دقيقة",
      linesRetraced: (n) => ar3(n, "تمت إعادة كتابة سطر واحد", "تمت إعادة كتابة سطرين", `تمت إعادة كتابة ${n} سطرًا`),
      muteKeySound: "كتم صوت لوحة المفاتيح",
      unmuteKeySound: "تشغيل صوت لوحة المفاتيح",
      keySoundOn: "صوت لوحة المفاتيح مفعّل",
      keySoundMuted: "صوت لوحة المفاتيح مكتوم",
      noLinesYet: "لا تحتوي هذه القصة على أسطر بعد.",
      replayLine: "إعادة تشغيل السطر",
      upgradeForSpeed: "قم بالترقية إلى برو للتحكم في سرعة التشغيل",
      tryAgain: "ليست بالضبط — حاول مرة أخرى",
      hereIsTheAnswer: "إليك الجملة الصحيحة",
      typeTheLine: "اكتب السطر",
      showTranslation: "إظهار الترجمة",
      hideTranslation: "إخفاء الترجمة",
      tapToType: "اضغط في أي مكان للكتابة",
    },
    wordbank: {
      pageTitle: "بنك الكلمات",
      pageSubtitle: "كل كلمة كتبتها وتعلمتها، تُجمع تلقائيًا.",
      myWordsTitle: "كلماتي",
      myWordsSubtitle: "كل كلمة كتبتها وتعلمتها، تُجمع تلقائيًا.",
      emptyTitle: "بنك كلماتك فارغ.",
      emptyBody: "لا تُضاف الكلمات يدويًا أبدًا — كل كلمة تكتبها بشكل صحيح في قصة تُحفظ هنا تلقائيًا.",
      startCollecting: "ابدأ قصة لتبدأ جمع الكلمات ←",
      allTopics: "كل المواضيع",
      dueForReview: "بانتظار المراجعة",
      dueForReviewSub: "كلمات بانتظار جولة التكرار المتباعد التالية.",
      weakWords: "كلمات ضعيفة",
      weakWordsSub: "قيد التعلم فعليًا، لكن ليست راسخة بعد.",
      masteredFilter: "متقنة",
      masteredFilterSub: "فترات طويلة، محفوظة جيدًا.",
      byTopic: "حسب الموضوع",
      byStory: "حسب القصة",
      wordsReadyToReview: (n) => ar3(n, "كلمة واحدة جاهزة للمراجعة", "كلمتان جاهزتان للمراجعة", `${n} كلمة جاهزة للمراجعة`),
      spacedRepetitionHint: "التكرار المتباعد يبقيها حاضرة في الذاكرة.",
      startReviewSession: "ابدأ جلسة المراجعة ←",
      upgradeToReview: "الترقية إلى برو للمراجعة ←",
      noWordsInCategory: "لا توجد كلمات في هذه الفئة بعد.",
      todaysWords: "كلمات اليوم",
      searchTopics: "ابحث في المواضيع…",
      viewGrid: "شبكة",
      viewList: "قائمة",
      viewFlashcard: "بطاقات",
      noTopicsMatch: (q) => `لا توجد مواضيع مطابقة لـ "${q}".`,
      readMoreToUnlock: "اقرأ المزيد من القصص لفتحه.",
      backToAllTopics: "→ كل المواضيع",
      backToGroups: "→ مجموعات المفردات",
      backToWordBank: "→ بنك الكلمات",
      backToVocabulary: "→ المفردات",
      wordsFromStory: (n) => ar3(n, "كلمة واحدة تعلمتها من هذه القصة ·", "كلمتان تعلمتهما من هذه القصة ·", `${n} كلمة تعلمتها من هذه القصة ·`),
      wordsFromTopic: (n) => ar3(n, "كلمة واحدة جُمعت من هذا الموضوع.", "كلمتان جُمعتا من هذا الموضوع.", `${n} كلمة جُمعت من هذا الموضوع.`),
      readItAgain: "اقرأها مجددًا ←",
      allCaughtUp: "لا شيء بانتظارك الآن!",
      noCardsDue: "لا توجد بطاقات بحاجة للمراجعة الآن.",
      noWordsDue: "لا توجد كلمات بحاجة للمراجعة الآن.",
      sessionComplete: "اكتملت الجلسة",
      cardOf: (c, t) => `${c} من ${t}`,
      reviewedCount: (n) => ar3(n, "راجعت كلمة واحدة.", "راجعت كلمتين.", `راجعت ${n} كلمة.`),
      leveledUp: (n) => ar3(n, "🎉 ارتقت كلمة واحدة إلى متقن", "🎉 ارتقت كلمتان إلى متقن", `🎉 ارتقت ${n} كلمة إلى متقن`),
      nextIn: (days) => `التالي بعد ${days} يوم`,
      backToWordBankBtn: "العودة إلى بنك الكلمات",
      backToVocabularyBtn: "العودة إلى المفردات",
      whatDoesThisMean: "ماذا يعني هذا؟",
      tapToReveal: "انقر أو اضغط مسافة للكشف",
      fromStory: (title) => `من ${title}`,
      reviewHint: "انقر على البطاقة لرؤية الإجابة، ثم قيّم مدى معرفتك بها",
      seenTimes: (n) => ` · شوهدت ${n} مرة`,
      fromPrefix: "من ",
    },
    vocabulary: {
      pageTitle: "مجموعات المفردات",
      pageSubtitle: "قوائم كلمات منسّقة حسب الموضوع — ادرسها، ثم اعثر عليها في قصص حقيقية.",
      myWords: "كلماتي ←",
      comingSoon: "قريبًا",
      wordCount: (n) => ar3(n, "كلمة واحدة", "كلمتان", `${n} كلمة`),
      preparingGroup: "🕐 المشرف يعدّ هذه المجموعة.",
      upgradeToUnlock: "الترقية للفتح",
      learnedProgress: (learned, total) => `${learned} / ${total} تم تعلمها`,
      notStarted: "لم تبدأ",
      markAsLearned: "وضع علامة كمتعلَّمة",
      learned: "✓ تم تعلمها",
      playPronunciation: "نطق الكلمة",
    },
    streak: {
      greatWorkToday: (d) => `🔥 ${d} ${ar3(d, "يوم متتالٍ", "يومان متتاليان", "أيام متتالية")} — عمل رائع اليوم!`,
      keepItAlive: (d) => `🔥 ${d} ${ar3(d, "يوم متتالٍ", "يومان متتاليان", "أيام متتالية")} — ادرس اليوم للحفاظ عليها!`,
      startToday: "ابدأ سلسلتك اليوم — اقرأ قصة واحدة للبدء",
      yourBest: (d) => `أفضل نتيجة لك: ${d} ${ar3(d, "يوم", "يومان", "أيام")}`,
      continueReading: "متابعة القراءة",
      startReading: "ابدأ القراءة",
      dismiss: "إغلاق",
    },
    continueReading: {
      label: "متابعة القراءة",
      minutesLeft: (m) => `~${m} دقيقة متبقية`,
      cta: "متابعة ←",
    },
    notifications: {
      prompt: "احصل على كلمة اليوم — فعّل الإشعارات",
      enable: "تفعيل",
    },
    push: {
      wordOfTheDay: "كلمة اليوم — Retrace",
    },
    errors: {
      genericTitle: "حدث خطأ ما",
      genericBody: "واجهنا مشكلة غير متوقعة. حاول مرة أخرى.",
      tryAgain: "حاول مرة أخرى",
      notFoundTitle: "الصفحة غير موجودة",
      notFoundBody: "الرابط الذي تبحث عنه غير موجود أو تم نقله.",
      backToLibrary: "العودة إلى المكتبة",
      offlineTitle: "أنت غير متصل",
      offlineBody: "تبقى القصص التي فتحتها سابقًا متاحة بدون اتصال. أما الجديد فيحتاج إلى الاتصال بالإنترنت.",
    },
  },
  fr: {
    common: {
      difficulty: { BEGINNER: "Débutant", INTERMEDIATE: "Intermédiaire", ADVANCED: "Avancé" },
      mastery: { new: "Nouveau", learning: "En cours", good: "Bien", mastered: "Maîtrisé" },
      rating: { forgot: "Oublié", hard: "Difficile", good: "Bien", easy: "Facile" },
      pro: "Pro",
      free: "Gratuit",
      locked: "Verrouillé",
      words: (n) => fr2(n, "1 mot", `${n} mots`),
      close: "Fermer",
    },
    nav: {
      library: "Bibliothèque",
      wordbank: "Banque de mots",
      vocabulary: "Vocabulaire",
      progress: "Progrès",
      settings: "Paramètres",
      admin: "Admin",
      switchReadingLanguage: "Changer la langue de lecture",
      readingLanguage: "Langue de lecture",
      mainNavigation: "Navigation principale",
    },
    settings: {
      title: "Paramètres",
      account: "Compte",
      name: "Nom",
      email: "E-mail",
      memberSince: "Membre depuis",
      languagePreferences: "Préférences de langue",
      appLanguage: "Langue de l'application",
      appLanguageHint: "Menus, boutons et messages",
      nativeLanguage: "Ma langue maternelle",
      nativeLanguageHint: "Traductions affichées pendant la lecture",
      learning: "J'apprends",
      learningHint: "D'autres langues arrivent bientôt",
      subscription: "Abonnement",
      status: "Statut",
      renews: "Renouvellement",
      manageViaReceipt: "Pour modifier votre moyen de paiement ou résilier, utilisez le lien dans l'e-mail de reçu Paddle.",
      upgradeCopy: "Passez à Pro pour débloquer toutes les histoires, le contenu généré par IA et le contrôle de la vitesse audio.",
      upgradeCta: "Passer à Pro",
      checkoutError: "Impossible d'ouvrir le paiement. Veuillez réessayer.",
      savedToast: "Préférences enregistrées.",
      errorToast: "Impossible d'enregistrer — réessayez.",
    },
    library: {
      title: "Bibliothèque d'histoires",
      subtitle: "Choisissez une histoire pour commencer ou continuer.",
      allLevels: "Tous les niveaux",
      emptyTitle: "Aucune histoire à ce niveau pour l'instant",
      emptySubtitle: "Bientôt disponible — essayez un autre niveau.",
      completed: "Terminée",
      inProgress: "En cours",
      notStarted: "Non commencée",
    },
    progress: {
      title: "Mes progrès",
      dayStreak: "Jours consécutifs",
      bestStreakLabel: "Meilleure série",
      bestStreak: (n) => fr2(n, `${n} jour`, `${n} jours`),
      storiesCompleted: "Histoires terminées",
      linesTyped: "Lignes tapées",
      totalXp: "XP total",
      inProgressSection: "En cours",
      completedSection: "Terminées",
      lastStudied: (pct, date) => `${pct} % · dernière étude le ${date}`,
      completedOn: (date) => `Terminée le ${date}`,
      empty: "Aucune histoire commencée pour l'instant.",
      browseLibrary: "Parcourir la bibliothèque →",
    },
    reader: {
      readyToRetrace: "Prêt à retracer",
      start: "Commencer",
      startHint: "Tapez en même temps que l'audio · appuyez sur T pour masquer la traduction",
      lineOf: (c, t) => `Ligne ${c} sur ${t}`,
      whyThisLine: "Pourquoi cette ligne ?",
      hideGrammarNote: "Masquer la note de grammaire",
      grammarNoteError: "Impossible de charger l'explication pour le moment.",
      storyComplete: "Histoire terminée",
      retraceAgain: "Retracer à nouveau",
      goToLibrary: "Aller à la bibliothèque",
      score: "Score",
      xp: "XP",
      wpm: "MPM",
      linesRetraced: (n) => fr2(n, "1 ligne retracée", `${n} lignes retracées`),
      muteKeySound: "Couper le son du clavier",
      unmuteKeySound: "Activer le son du clavier",
      keySoundOn: "Son du clavier activé",
      keySoundMuted: "Son du clavier coupé",
      noLinesYet: "Cette histoire n'a pas encore de lignes.",
      replayLine: "Rejouer la ligne",
      upgradeForSpeed: "Passez à Pro pour contrôler la vitesse de lecture",
      tryAgain: "Pas tout à fait — réessayez",
      hereIsTheAnswer: "Voici la phrase correcte",
      typeTheLine: "Tapez la ligne",
      showTranslation: "Afficher la traduction",
      hideTranslation: "Masquer la traduction",
      tapToType: "Touchez n'importe où pour écrire",
    },
    wordbank: {
      pageTitle: "Banque de mots",
      pageSubtitle: "Chaque mot que vous avez tapé et appris, collecté automatiquement.",
      myWordsTitle: "Mes mots",
      myWordsSubtitle: "Chaque mot que vous avez tapé et appris, collecté automatiquement.",
      emptyTitle: "Votre banque de mots est vide.",
      emptyBody: "Les mots ne sont jamais ajoutés manuellement — chaque mot correctement tapé dans une histoire est enregistré ici automatiquement.",
      startCollecting: "Commencez une histoire pour collecter des mots →",
      allTopics: "Tous les thèmes",
      dueForReview: "À réviser",
      dueForReviewSub: "Mots en attente de leur prochaine répétition espacée.",
      weakWords: "Mots faibles",
      weakWordsSub: "En cours d'apprentissage, mais pas encore solides.",
      masteredFilter: "Maîtrisés",
      masteredFilterSub: "Longs intervalles, bien retenus.",
      byTopic: "Par thème",
      byStory: "Par histoire",
      wordsReadyToReview: (n) => fr2(n, "1 mot prêt à être révisé", `${n} mots prêts à être révisés`),
      spacedRepetitionHint: "La répétition espacée les garde frais en mémoire.",
      startReviewSession: "Démarrer la session de révision →",
      upgradeToReview: "Passer à Pro pour réviser →",
      noWordsInCategory: "Aucun mot dans cette catégorie pour l'instant.",
      todaysWords: "Mots du jour",
      searchTopics: "Rechercher des thèmes…",
      viewGrid: "Grille",
      viewList: "Liste",
      viewFlashcard: "Cartes",
      noTopicsMatch: (q) => `Aucun thème ne correspond à « ${q} ».`,
      readMoreToUnlock: "Lisez plus d'histoires pour débloquer.",
      backToAllTopics: "← Tous les thèmes",
      backToGroups: "← Groupes de vocabulaire",
      backToWordBank: "← Banque de mots",
      backToVocabulary: "← Vocabulaire",
      wordsFromStory: (n) => fr2(n, "1 mot appris de cette histoire ·", `${n} mots appris de cette histoire ·`),
      wordsFromTopic: (n) => fr2(n, "1 mot collecté de ce thème.", `${n} mots collectés de ce thème.`),
      readItAgain: "Relire →",
      allCaughtUp: "Tout est à jour !",
      noCardsDue: "Aucune carte à réviser pour le moment.",
      noWordsDue: "Aucun mot à réviser pour le moment.",
      sessionComplete: "Session terminée",
      cardOf: (c, t) => `${c} sur ${t}`,
      reviewedCount: (n) => fr2(n, "Vous avez révisé 1 mot.", `Vous avez révisé ${n} mots.`),
      leveledUp: (n) => fr2(n, "🎉 1 mot est passé à Maîtrisé", `🎉 ${n} mots sont passés à Maîtrisé`),
      nextIn: (days) => `prochain dans ${days} j`,
      backToWordBankBtn: "Retour à la banque de mots",
      backToVocabularyBtn: "Retour au vocabulaire",
      whatDoesThisMean: "Qu'est-ce que ça veut dire ?",
      tapToReveal: "Touchez ou appuyez sur Espace pour révéler",
      fromStory: (title) => `de ${title}`,
      reviewHint: "Cliquez sur la carte pour voir la réponse, puis évaluez votre niveau de connaissance",
      seenTimes: (n) => ` · vu ${n}×`,
      fromPrefix: "de ",
    },
    vocabulary: {
      pageTitle: "Groupes de vocabulaire",
      pageSubtitle: "Listes de mots organisées par thème — étudiez-les, puis retrouvez-les dans de vraies histoires.",
      myWords: "Mes mots →",
      comingSoon: "Bientôt disponible",
      wordCount: (n) => fr2(n, "1 mot", `${n} mots`),
      preparingGroup: "🕐 L'administrateur prépare ce groupe.",
      upgradeToUnlock: "Passer à Pro pour débloquer",
      learnedProgress: (learned, total) => `${learned} / ${total} appris`,
      notStarted: "Non commencé",
      markAsLearned: "Marquer comme appris",
      learned: "✓ Appris",
      playPronunciation: "Écouter la prononciation",
    },
    streak: {
      greatWorkToday: (d) => `🔥 Série de ${d} ${fr2(d, "jour", "jours")} — beau travail aujourd'hui !`,
      keepItAlive: (d) => `🔥 Série de ${d} ${fr2(d, "jour", "jours")} — étudiez aujourd'hui pour la garder !`,
      startToday: "Commencez votre série aujourd'hui — lisez une histoire pour débuter",
      yourBest: (d) => `Votre record : ${d} ${fr2(d, "jour", "jours")}`,
      continueReading: "Continuer la lecture",
      startReading: "Commencer à lire",
      dismiss: "Fermer",
    },
    continueReading: {
      label: "Continuer la lecture",
      minutesLeft: (m) => `~${m} min restantes`,
      cta: "Continuer →",
    },
    notifications: {
      prompt: "Recevez votre mot du jour — activez les notifications",
      enable: "Activer",
    },
    push: {
      wordOfTheDay: "Mot du jour — Retrace",
    },
    errors: {
      genericTitle: "Une erreur est survenue",
      genericBody: "Un problème inattendu s'est produit. Veuillez réessayer.",
      tryAgain: "Réessayer",
      notFoundTitle: "Page introuvable",
      notFoundBody: "Le lien que vous cherchez n'existe pas ou a été déplacé.",
      backToLibrary: "Retour à la bibliothèque",
      offlineTitle: "Vous êtes hors ligne",
      offlineBody: "Les histoires déjà ouvertes restent accessibles sans connexion. Le reste nécessite Internet.",
    },
  },
  tr: {
    common: {
      difficulty: { BEGINNER: "Başlangıç", INTERMEDIATE: "Orta", ADVANCED: "İleri" },
      mastery: { new: "Yeni", learning: "Öğreniliyor", good: "İyi", mastered: "Ustalaşıldı" },
      rating: { forgot: "Unuttum", hard: "Zor", good: "İyi", easy: "Kolay" },
      pro: "Pro",
      free: "Ücretsiz",
      locked: "Kilitli",
      words: (n) => `${n} kelime`,
      close: "Kapat",
    },
    nav: {
      library: "Kütüphane",
      wordbank: "Kelime bankası",
      vocabulary: "Kelime hazinesi",
      progress: "İlerleme",
      settings: "Ayarlar",
      admin: "Yönetim",
      switchReadingLanguage: "Okuma dilini değiştir",
      readingLanguage: "Okuma dili",
      mainNavigation: "Ana gezinme",
    },
    settings: {
      title: "Ayarlar",
      account: "Hesap",
      name: "Ad",
      email: "E-posta",
      memberSince: "Üyelik tarihi",
      languagePreferences: "Dil tercihleri",
      appLanguage: "Uygulama dili",
      appLanguageHint: "Menüler, düğmeler ve mesajlar",
      nativeLanguage: "Ana dilim",
      nativeLanguageHint: "Okurken gösterilen çeviriler",
      learning: "Öğrendiğim dil",
      learningHint: "Daha fazla dil yakında",
      subscription: "Abonelik",
      status: "Durum",
      renews: "Yenilenme tarihi",
      manageViaReceipt: "Ödeme bilgilerini güncellemek veya iptal etmek için Paddle makbuz e-postasındaki bağlantıyı kullanın.",
      upgradeCopy: "Tüm hikayelerin, yapay zeka içeriğinin ve ses hızı kontrolünün kilidini açmak için Pro'ya geçin.",
      upgradeCta: "Pro'ya geç",
      checkoutError: "Ödeme ekranı açılamadı. Lütfen tekrar deneyin.",
      savedToast: "Tercihler kaydedildi.",
      errorToast: "Kaydedilemedi — tekrar deneyin.",
    },
    library: {
      title: "Hikaye kütüphanesi",
      subtitle: "Öğrenmeye başlamak veya devam etmek için bir hikaye seçin.",
      allLevels: "Tüm seviyeler",
      emptyTitle: "Bu seviyede henüz hikaye yok",
      emptySubtitle: "Yakında gelecek — şimdilik başka bir seviye deneyin.",
      completed: "Tamamlandı",
      inProgress: "Devam ediyor",
      notStarted: "Başlanmadı",
    },
    progress: {
      title: "İlerlemem",
      dayStreak: "Günlük seri",
      bestStreakLabel: "En iyi seri",
      bestStreak: (n) => `${n} gün`,
      storiesCompleted: "Tamamlanan hikaye",
      linesTyped: "Yazılan satır",
      totalXp: "Toplam XP",
      inProgressSection: "Devam ediyor",
      completedSection: "Tamamlandı",
      lastStudied: (pct, date) => `%${pct} · son çalışma ${date}`,
      completedOn: (date) => `${date} tarihinde tamamlandı`,
      empty: "Henüz hiçbir hikayeye başlanmadı.",
      browseLibrary: "Kütüphaneye göz at →",
    },
    reader: {
      readyToRetrace: "Yeniden yazmaya hazır",
      start: "Başla",
      startHint: "Ses çalarken birlikte yazın · çeviriyi gizlemek için T'ye basın",
      lineOf: (c, t) => `Satır ${c} / ${t}`,
      whyThisLine: "Bu satır neden böyle?",
      hideGrammarNote: "Dilbilgisi notunu gizle",
      grammarNoteError: "Açıklama şu anda yüklenemedi.",
      storyComplete: "Hikaye tamamlandı",
      retraceAgain: "Tekrar yeniden yaz",
      goToLibrary: "Kütüphaneye git",
      score: "Puan",
      xp: "XP",
      wpm: "KPD",
      linesRetraced: (n) => `${n} satır yeniden yazıldı`,
      muteKeySound: "Klavye sesini kapat",
      unmuteKeySound: "Klavye sesini aç",
      keySoundOn: "Klavye sesi açık",
      keySoundMuted: "Klavye sesi kapalı",
      noLinesYet: "Bu hikayenin henüz satırı yok.",
      replayLine: "Satırı tekrar oynat",
      upgradeForSpeed: "Oynatma hızı kontrolü için Pro'ya geçin",
      tryAgain: "Tam olarak değil — tekrar dene",
      hereIsTheAnswer: "İşte doğru cümle",
      typeTheLine: "Satırı yazın",
      showTranslation: "Çeviriyi göster",
      hideTranslation: "Çeviriyi gizle",
      tapToType: "Yazmak için herhangi bir yere dokunun",
    },
    wordbank: {
      pageTitle: "Kelime bankası",
      pageSubtitle: "Yazıp öğrendiğiniz her kelime otomatik olarak burada toplanır.",
      myWordsTitle: "Kelimelerim",
      myWordsSubtitle: "Yazıp öğrendiğiniz her kelime otomatik olarak burada toplanır.",
      emptyTitle: "Kelime bankanız boş.",
      emptyBody: "Kelimeler asla elle eklenmez — bir hikayede doğru yazdığınız her kelime buraya otomatik olarak kaydedilir.",
      startCollecting: "Kelime toplamaya başlamak için bir hikayeye başlayın →",
      allTopics: "Tüm konular",
      dueForReview: "Tekrar zamanı gelen",
      dueForReviewSub: "Bir sonraki aralıklı tekrar turunu bekleyen kelimeler.",
      weakWords: "Zayıf kelimeler",
      weakWordsSub: "Aktif olarak öğreniliyor ama henüz sağlam değil.",
      masteredFilter: "Ustalaşıldı",
      masteredFilterSub: "Uzun aralıklar, iyi hatırlanıyor.",
      byTopic: "Konuya göre",
      byStory: "Hikayeye göre",
      wordsReadyToReview: (n) => `${n} kelime tekrar için hazır`,
      spacedRepetitionHint: "Aralıklı tekrar onları hafızada taze tutar.",
      startReviewSession: "Tekrar oturumunu başlat →",
      upgradeToReview: "Tekrar için Pro'ya geç →",
      noWordsInCategory: "Bu kategoride henüz kelime yok.",
      todaysWords: "Bugünün kelimeleri",
      searchTopics: "Konularda ara…",
      viewGrid: "Izgara",
      viewList: "Liste",
      viewFlashcard: "Kart",
      noTopicsMatch: (q) => `"${q}" ile eşleşen konu yok.`,
      readMoreToUnlock: "Kilidini açmak için daha fazla hikaye okuyun.",
      backToAllTopics: "← Tüm konular",
      backToGroups: "← Kelime hazinesi grupları",
      backToWordBank: "← Kelime bankası",
      backToVocabulary: "← Kelime hazinesi",
      wordsFromStory: (n) => `${n} kelime bu hikayeden öğrenildi ·`,
      wordsFromTopic: (n) => `${n} kelime bu konudan toplandı.`,
      readItAgain: "Tekrar oku →",
      allCaughtUp: "Hepsi tamam!",
      noCardsDue: "Şu anda tekrar edilecek kart yok.",
      noWordsDue: "Şu anda tekrar edilecek kelime yok.",
      sessionComplete: "Oturum tamamlandı",
      cardOf: (c, t) => `${c} / ${t}`,
      reviewedCount: (n) => `${n} kelimeyi tekrar ettiniz.`,
      leveledUp: (n) => `🎉 ${n} kelime Ustalaşıldı seviyesine yükseldi`,
      nextIn: (days) => `${days} gün sonra`,
      backToWordBankBtn: "Kelime bankasına dön",
      backToVocabularyBtn: "Kelime hazinesine dön",
      whatDoesThisMean: "Bu ne anlama geliyor?",
      tapToReveal: "Göstermek için dokunun veya Boşluk'a basın",
      fromStory: (title) => `${title} hikayesinden`,
      reviewHint: "Cevabı görmek için karta tıklayın, sonra ne kadar bildiğinizi değerlendirin",
      seenTimes: (n) => ` · ${n} kez görüldü`,
      fromPrefix: "kaynak: ",
    },
    vocabulary: {
      pageTitle: "Kelime hazinesi grupları",
      pageSubtitle: "Konuya göre hazırlanmış kelime listeleri — çalışın, sonra gerçek hikayelerde bulun.",
      myWords: "Kelimelerim →",
      comingSoon: "Yakında",
      wordCount: (n) => `${n} kelime`,
      preparingGroup: "🕐 Yönetici bu grubu hazırlıyor.",
      upgradeToUnlock: "Kilidini açmak için yükselt",
      learnedProgress: (learned, total) => `${learned} / ${total} öğrenildi`,
      notStarted: "Başlanmadı",
      markAsLearned: "Öğrenildi olarak işaretle",
      learned: "✓ Öğrenildi",
      playPronunciation: "Telaffuzu dinle",
    },
    streak: {
      greatWorkToday: (d) => `🔥 ${d} günlük seri — bugün harika iş çıkardın!`,
      keepItAlive: (d) => `🔥 ${d} günlük seri — sürdürmek için bugün çalış!`,
      startToday: "Serine bugün başla — başlamak için bir hikâye oku",
      yourBest: (d) => `En iyin: ${d} gün`,
      continueReading: "Okumaya devam et",
      startReading: "Okumaya başla",
      dismiss: "Kapat",
    },
    continueReading: {
      label: "Okumaya devam et",
      minutesLeft: (m) => `~${m} dk kaldı`,
      cta: "Devam et →",
    },
    notifications: {
      prompt: "Günün kelimesini al — bildirimleri aç",
      enable: "Aç",
    },
    push: {
      wordOfTheDay: "Günün kelimesi — Retrace",
    },
    errors: {
      genericTitle: "Bir şeyler ters gitti",
      genericBody: "Beklenmedik bir sorun oluştu. Lütfen tekrar deneyin.",
      tryAgain: "Tekrar dene",
      notFoundTitle: "Sayfa bulunamadı",
      notFoundBody: "Aradığınız bağlantı mevcut değil veya taşınmış.",
      backToLibrary: "Kütüphaneye dön",
      offlineTitle: "Çevrimdışısınız",
      offlineBody: "Daha önce açtığınız hikâyeler bağlantı olmadan da kullanılabilir. Yeni içerik için internet gerekir.",
    },
  },
  es: {
    common: {
      difficulty: { BEGINNER: "Principiante", INTERMEDIATE: "Intermedio", ADVANCED: "Avanzado" },
      mastery: { new: "Nuevo", learning: "Aprendiendo", good: "Bien", mastered: "Dominado" },
      rating: { forgot: "Olvidé", hard: "Difícil", good: "Bien", easy: "Fácil" },
      pro: "Pro",
      free: "Gratis",
      locked: "Bloqueado",
      words: (n) => fr2(n, "1 palabra", `${n} palabras`),
      close: "Cerrar",
    },
    nav: {
      library: "Biblioteca",
      wordbank: "Banco de palabras",
      vocabulary: "Vocabulario",
      progress: "Progreso",
      settings: "Ajustes",
      admin: "Admin",
      switchReadingLanguage: "Cambiar idioma de lectura",
      readingLanguage: "Idioma de lectura",
      mainNavigation: "Navegación principal",
    },
    settings: {
      title: "Ajustes",
      account: "Cuenta",
      name: "Nombre",
      email: "Correo electrónico",
      memberSince: "Miembro desde",
      languagePreferences: "Preferencias de idioma",
      appLanguage: "Idioma de la app",
      appLanguageHint: "Menús, botones y mensajes",
      nativeLanguage: "Mi idioma nativo",
      nativeLanguageHint: "Traducciones mostradas al leer",
      learning: "Estoy aprendiendo",
      learningHint: "Más idiomas próximamente",
      subscription: "Suscripción",
      status: "Estado",
      renews: "Se renueva",
      manageViaReceipt: "Para actualizar tu método de pago o cancelar, usa el enlace del correo de recibo de Paddle.",
      upgradeCopy: "Mejora a Pro para desbloquear todas las historias, contenido generado por IA y control de velocidad de audio.",
      upgradeCta: "Mejorar a Pro",
      checkoutError: "No se pudo abrir el pago. Inténtalo de nuevo.",
      savedToast: "Preferencias guardadas.",
      errorToast: "No se pudo guardar — inténtalo de nuevo.",
    },
    library: {
      title: "Biblioteca de historias",
      subtitle: "Elige una historia para empezar o continuar aprendiendo.",
      allLevels: "Todos los niveles",
      emptyTitle: "Aún no hay historias en este nivel",
      emptySubtitle: "Más historias próximamente — prueba otro nivel por ahora.",
      completed: "Completada",
      inProgress: "En curso",
      notStarted: "Sin empezar",
    },
    progress: {
      title: "Mi progreso",
      dayStreak: "Racha de días",
      bestStreakLabel: "Mejor racha",
      bestStreak: (n) => fr2(n, `${n} día`, `${n} días`),
      storiesCompleted: "Historias completadas",
      linesTyped: "Líneas escritas",
      totalXp: "XP total",
      inProgressSection: "En curso",
      completedSection: "Completadas",
      lastStudied: (pct, date) => `${pct}% · última vez el ${date}`,
      completedOn: (date) => `Completada el ${date}`,
      empty: "Aún no has empezado ninguna historia.",
      browseLibrary: "Explorar la biblioteca →",
    },
    reader: {
      readyToRetrace: "Listo para retrazar",
      start: "Empezar",
      startHint: "Escribe mientras suena el audio · pulsa T para ocultar la traducción",
      lineOf: (c, t) => `Línea ${c} de ${t}`,
      whyThisLine: "¿Por qué esta línea?",
      hideGrammarNote: "Ocultar nota gramatical",
      grammarNoteError: "No se pudo cargar la explicación ahora.",
      storyComplete: "Historia completada",
      retraceAgain: "Retrazar de nuevo",
      goToLibrary: "Ir a la biblioteca",
      score: "Puntuación",
      xp: "XP",
      wpm: "PPM",
      linesRetraced: (n) => fr2(n, "1 línea retrazada", `${n} líneas retrazadas`),
      muteKeySound: "Silenciar sonido del teclado",
      unmuteKeySound: "Activar sonido del teclado",
      keySoundOn: "Sonido del teclado activado",
      keySoundMuted: "Sonido del teclado silenciado",
      noLinesYet: "Esta historia todavía no tiene líneas.",
      replayLine: "Repetir línea",
      upgradeForSpeed: "Mejora a Pro para controlar la velocidad de reproducción",
      tryAgain: "No exactamente — inténtalo de nuevo",
      hereIsTheAnswer: "Aquí está la frase correcta",
      typeTheLine: "Escribe la línea",
      showTranslation: "Mostrar traducción",
      hideTranslation: "Ocultar traducción",
      tapToType: "Toca en cualquier lugar para escribir",
    },
    wordbank: {
      pageTitle: "Banco de palabras",
      pageSubtitle: "Cada palabra que has escrito y aprendido, recopilada automáticamente.",
      myWordsTitle: "Mis palabras",
      myWordsSubtitle: "Cada palabra que has escrito y aprendido, recopilada automáticamente.",
      emptyTitle: "Tu banco de palabras está vacío.",
      emptyBody: "Las palabras nunca se añaden manualmente — cada palabra que escribes correctamente en una historia se guarda aquí automáticamente.",
      startCollecting: "Empieza una historia para comenzar a recopilar palabras →",
      allTopics: "Todos los temas",
      dueForReview: "Pendientes de repaso",
      dueForReviewSub: "Palabras esperando su próxima ronda de repetición espaciada.",
      weakWords: "Palabras débiles",
      weakWordsSub: "En aprendizaje activo, pero aún no consolidadas.",
      masteredFilter: "Dominadas",
      masteredFilterSub: "Intervalos largos, bien retenidas.",
      byTopic: "Por tema",
      byStory: "Por historia",
      wordsReadyToReview: (n) => fr2(n, "1 palabra lista para repasar", `${n} palabras listas para repasar`),
      spacedRepetitionHint: "La repetición espaciada las mantiene frescas en la memoria.",
      startReviewSession: "Iniciar sesión de repaso →",
      upgradeToReview: "Mejora a Pro para repasar →",
      noWordsInCategory: "Aún no hay palabras en esta categoría.",
      todaysWords: "Palabras de hoy",
      searchTopics: "Buscar temas…",
      viewGrid: "Cuadrícula",
      viewList: "Lista",
      viewFlashcard: "Tarjetas",
      noTopicsMatch: (q) => `Ningún tema coincide con "${q}".`,
      readMoreToUnlock: "Lee más historias para desbloquear.",
      backToAllTopics: "← Todos los temas",
      backToGroups: "← Grupos de vocabulario",
      backToWordBank: "← Banco de palabras",
      backToVocabulary: "← Vocabulario",
      wordsFromStory: (n) => fr2(n, "1 palabra aprendida de esta historia ·", `${n} palabras aprendidas de esta historia ·`),
      wordsFromTopic: (n) => fr2(n, "1 palabra recopilada de este tema.", `${n} palabras recopiladas de este tema.`),
      readItAgain: "Leer de nuevo →",
      allCaughtUp: "¡Todo al día!",
      noCardsDue: "No hay tarjetas pendientes de repaso ahora.",
      noWordsDue: "No hay palabras pendientes de repaso ahora.",
      sessionComplete: "Sesión completada",
      cardOf: (c, t) => `${c} de ${t}`,
      reviewedCount: (n) => fr2(n, "Repasaste 1 palabra.", `Repasaste ${n} palabras.`),
      leveledUp: (n) => fr2(n, "🎉 1 palabra pasó a Dominada", `🎉 ${n} palabras pasaron a Dominada`),
      nextIn: (days) => `próxima en ${days} d`,
      backToWordBankBtn: "Volver al banco de palabras",
      backToVocabularyBtn: "Volver al vocabulario",
      whatDoesThisMean: "¿Qué significa esto?",
      tapToReveal: "Toca o pulsa Espacio para revelar",
      fromStory: (title) => `de ${title}`,
      reviewHint: "Haz clic en la tarjeta para ver la respuesta, luego evalúa cuánto la sabías",
      seenTimes: (n) => ` · vista ${n}×`,
      fromPrefix: "de ",
    },
    vocabulary: {
      pageTitle: "Grupos de vocabulario",
      pageSubtitle: "Listas de palabras por tema — estúdialas y luego encuéntralas en historias reales.",
      myWords: "Mis palabras →",
      comingSoon: "Próximamente",
      wordCount: (n) => fr2(n, "1 palabra", `${n} palabras`),
      preparingGroup: "🕐 El administrador está preparando este grupo.",
      upgradeToUnlock: "Mejora para desbloquear",
      learnedProgress: (learned, total) => `${learned} / ${total} aprendidas`,
      notStarted: "Sin empezar",
      markAsLearned: "Marcar como aprendida",
      learned: "✓ Aprendida",
      playPronunciation: "Escuchar pronunciación",
    },
    streak: {
      greatWorkToday: (d) => `🔥 Racha de ${d} ${fr2(d, "día", "días")} — ¡buen trabajo hoy!`,
      keepItAlive: (d) => `🔥 Racha de ${d} ${fr2(d, "día", "días")} — ¡estudia hoy para mantenerla!`,
      startToday: "Empieza tu racha hoy — lee una historia para comenzar",
      yourBest: (d) => `Tu récord: ${d} ${fr2(d, "día", "días")}`,
      continueReading: "Seguir leyendo",
      startReading: "Empezar a leer",
      dismiss: "Cerrar",
    },
    continueReading: {
      label: "Seguir leyendo",
      minutesLeft: (m) => `~${m} min restantes`,
      cta: "Continuar →",
    },
    notifications: {
      prompt: "Recibe tu palabra del día — activa las notificaciones",
      enable: "Activar",
    },
    push: {
      wordOfTheDay: "Palabra del día — Retrace",
    },
    errors: {
      genericTitle: "Algo salió mal",
      genericBody: "Se produjo un problema inesperado. Inténtalo de nuevo.",
      tryAgain: "Intentar de nuevo",
      notFoundTitle: "Página no encontrada",
      notFoundBody: "El enlace que buscas no existe o se ha movido.",
      backToLibrary: "Volver a la biblioteca",
      offlineTitle: "Estás sin conexión",
      offlineBody: "Las historias que ya abriste siguen disponibles sin conexión. Lo nuevo requiere internet.",
    },
  },
  en: {
    common: {
      difficulty: { BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" },
      mastery: { new: "New", learning: "Learning", good: "Good", mastered: "Mastered" },
      rating: { forgot: "Forgot", hard: "Hard", good: "Good", easy: "Easy" },
      pro: "Pro",
      free: "Free",
      locked: "Locked",
      words: (n) => fr2(n, "1 word", `${n} words`),
      close: "Close",
    },
    nav: {
      library: "Library",
      wordbank: "Word Bank",
      vocabulary: "Vocabulary",
      progress: "Progress",
      settings: "Settings",
      admin: "Admin",
      switchReadingLanguage: "Switch reading language",
      readingLanguage: "Reading language",
      mainNavigation: "Main navigation",
    },
    settings: {
      title: "Settings",
      account: "Account",
      name: "Name",
      email: "Email",
      memberSince: "Member since",
      languagePreferences: "Language preferences",
      appLanguage: "App language",
      appLanguageHint: "Menus, buttons, and messages",
      nativeLanguage: "My native language",
      nativeLanguageHint: "Translations shown while reading",
      learning: "Learning",
      learningHint: "More languages coming soon",
      subscription: "Subscription",
      status: "Status",
      renews: "Renews",
      manageViaReceipt: "To update payment details or cancel, use the link in your Paddle receipt email.",
      upgradeCopy: "Upgrade to Pro to unlock every story, AI-generated content, and audio speed control.",
      upgradeCta: "Upgrade to Pro",
      checkoutError: "Couldn't open checkout. Please try again.",
      savedToast: "Preferences saved.",
      errorToast: "Couldn't save — try again.",
    },
    library: {
      title: "Story Library",
      subtitle: "Pick a story to start or continue learning.",
      allLevels: "All levels",
      emptyTitle: "No stories at this level yet",
      emptySubtitle: "More coming soon — try another level for now.",
      completed: "Completed",
      inProgress: "In progress",
      notStarted: "Not started",
    },
    progress: {
      title: "My Progress",
      dayStreak: "Day streak",
      bestStreakLabel: "Best streak",
      bestStreak: (n) => fr2(n, `${n} day`, `${n} days`),
      storiesCompleted: "Stories completed",
      linesTyped: "Lines typed",
      totalXp: "Total XP",
      inProgressSection: "In progress",
      completedSection: "Completed",
      lastStudied: (pct, date) => `${pct}% · last studied ${date}`,
      completedOn: (date) => `Completed on ${date}`,
      empty: "You haven't started any story yet.",
      browseLibrary: "Browse the library →",
    },
    reader: {
      readyToRetrace: "Ready to retrace",
      start: "Start",
      startHint: "Type along with the audio · press T to hide the translation",
      lineOf: (c, t) => `Line ${c} of ${t}`,
      whyThisLine: "Why this line?",
      hideGrammarNote: "Hide grammar note",
      grammarNoteError: "Couldn't load the explanation right now.",
      storyComplete: "Story complete",
      retraceAgain: "Retrace again",
      goToLibrary: "Go to library",
      score: "Score",
      xp: "XP",
      wpm: "WPM",
      linesRetraced: (n) => fr2(n, "1 line retraced", `${n} lines retraced`),
      muteKeySound: "Mute key sound",
      unmuteKeySound: "Unmute key sound",
      keySoundOn: "Key sound on",
      keySoundMuted: "Key sound muted",
      noLinesYet: "This story doesn't have any lines yet.",
      replayLine: "Replay line",
      upgradeForSpeed: "Upgrade to Pro to control playback speed",
      tryAgain: "Not quite — try again",
      hereIsTheAnswer: "Here's the correct sentence",
      typeTheLine: "Type the line",
      showTranslation: "Show translation",
      hideTranslation: "Hide translation",
      tapToType: "Tap anywhere to type",
    },
    wordbank: {
      pageTitle: "Word Bank",
      pageSubtitle: "Every word you've typed and learned, collected automatically.",
      myWordsTitle: "My words",
      myWordsSubtitle: "Every word you've typed and learned, collected automatically.",
      emptyTitle: "Your word bank is empty.",
      emptyBody: "Words are never added manually — every word you type correctly in a story is saved here automatically.",
      startCollecting: "Start a story to begin collecting words →",
      allTopics: "All topics",
      dueForReview: "Due for review",
      dueForReviewSub: "Words waiting for their next spaced-repetition round.",
      weakWords: "Weak words",
      weakWordsSub: "Actively being learned, but not yet solid.",
      masteredFilter: "Mastered",
      masteredFilterSub: "Long intervals, well retained.",
      byTopic: "By topic",
      byStory: "By story",
      wordsReadyToReview: (n) => fr2(n, "1 word ready to review", `${n} words ready to review`),
      spacedRepetitionHint: "Spaced repetition keeps them fresh in memory.",
      startReviewSession: "Start review session →",
      upgradeToReview: "Upgrade to Pro to review →",
      noWordsInCategory: "No words in this category yet.",
      todaysWords: "Today's words",
      searchTopics: "Search topics…",
      viewGrid: "Grid",
      viewList: "List",
      viewFlashcard: "Flashcards",
      noTopicsMatch: (q) => `No topics match "${q}".`,
      readMoreToUnlock: "Read more stories to unlock it.",
      backToAllTopics: "← All topics",
      backToGroups: "← Vocabulary groups",
      backToWordBank: "← Word bank",
      backToVocabulary: "← Vocabulary",
      wordsFromStory: (n) => fr2(n, "1 word learned from this story ·", `${n} words learned from this story ·`),
      wordsFromTopic: (n) => fr2(n, "1 word collected from this topic.", `${n} words collected from this topic.`),
      readItAgain: "Read it again →",
      allCaughtUp: "All caught up!",
      noCardsDue: "No cards due for review right now.",
      noWordsDue: "No words due for review right now.",
      sessionComplete: "Session complete",
      cardOf: (c, t) => `${c} of ${t}`,
      reviewedCount: (n) => fr2(n, "You reviewed 1 word.", `You reviewed ${n} words.`),
      leveledUp: (n) => fr2(n, "🎉 1 word leveled up to Mastered", `🎉 ${n} words leveled up to Mastered`),
      nextIn: (days) => `next in ${days}d`,
      backToWordBankBtn: "Back to word bank",
      backToVocabularyBtn: "Back to vocabulary",
      whatDoesThisMean: "What does this mean?",
      tapToReveal: "Tap or press Space to reveal",
      fromStory: (title) => `from ${title}`,
      reviewHint: "Click the card to see the answer, then rate how well you knew it",
      seenTimes: (n) => ` · seen ${n}×`,
      fromPrefix: "from ",
    },
    vocabulary: {
      pageTitle: "Vocabulary Groups",
      pageSubtitle: "Word lists curated by topic — study them, then find them in real stories.",
      myWords: "My words →",
      comingSoon: "Coming soon",
      wordCount: (n) => fr2(n, "1 word", `${n} words`),
      preparingGroup: "🕐 The admin is preparing this group.",
      upgradeToUnlock: "Upgrade to unlock",
      learnedProgress: (learned, total) => `${learned} / ${total} learned`,
      notStarted: "Not started",
      markAsLearned: "Mark as learned",
      learned: "✓ Learned",
      playPronunciation: "Play pronunciation",
    },
    streak: {
      greatWorkToday: (d) => `🔥 ${d}-day streak — great work today!`,
      keepItAlive: (d) => `🔥 ${d}-day streak — study today to keep it alive!`,
      startToday: "Start your streak today — read one story to begin",
      yourBest: (d) => `Your best: ${d} ${d === 1 ? "day" : "days"}`,
      continueReading: "Continue reading",
      startReading: "Start reading",
      dismiss: "Dismiss",
    },
    continueReading: {
      label: "Continue reading",
      minutesLeft: (m) => `~${m} min left`,
      cta: "Continue →",
    },
    notifications: {
      prompt: "Get your word of the day — enable notifications",
      enable: "Enable",
    },
    push: {
      wordOfTheDay: "Word of the day — Retrace",
    },
    errors: {
      genericTitle: "Something went wrong",
      genericBody: "We hit an unexpected problem. Please try again.",
      tryAgain: "Try again",
      notFoundTitle: "Page not found",
      notFoundBody: "The link you followed doesn't exist or has moved.",
      backToLibrary: "Back to library",
      offlineTitle: "You're offline",
      offlineBody: "Stories you have already opened stay available without a connection. Anything new needs you back online.",
    },
  },
};

export function getAppCopy(code: string | null | undefined): AppCopy {
  return APP_COPY[code as LanguageCode] ?? APP_COPY.ar;
}
