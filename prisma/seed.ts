import { PrismaClient, Difficulty } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const stories = [
    {
      slug: "my-first-day",
      title: "My First Day",
      titleTranslations: { ar: "يومي الأول" },
      description: "A student arrives in a new city and explores the neighbourhood.",
      descriptionTranslations: { ar: "يصل طالب إلى مدينة جديدة ويستكشف الحي." },
      difficulty: Difficulty.BEGINNER,
      topic: "daily-life",
      isPremium: false,
      isPublished: true,
      wordCount: 72,
      lines: {
        create: [
          { position: 1, text: "I woke up early this morning.", translations: { ar: "استيقظت مبكراً هذا الصباح." } },
          { position: 2, text: "The sun was shining through the window.", translations: { ar: "كانت الشمس تسطع من خلال النافذة." } },
          { position: 3, text: "I made a cup of coffee and sat by the window.", translations: { ar: "صنعت كوبًا من القهوة وجلست بجانب النافذة." } },
          { position: 4, text: "The street below was quiet and peaceful.", translations: { ar: "كان الشارع أسفلي هادئًا ومسالمًا." } },
          { position: 5, text: "I decided to go for a walk before breakfast.", translations: { ar: "قررت الذهاب في نزهة قبل الإفطار." } },
          { position: 6, text: "The air was fresh and cool outside.", translations: { ar: "كان الهواء منعشًا وباردًا في الخارج." } },
          { position: 7, text: "I walked past a bakery and smelled fresh bread.", translations: { ar: "مررت بمخبز وشممت رائحة الخبز الطازج." } },
          { position: 8, text: "It was a beautiful start to the day.", translations: { ar: "كانت بداية جميلة لليوم." } },
        ],
      },
    },
    {
      slug: "at-the-market",
      title: "At the Market",
      titleTranslations: { ar: "في السوق" },
      description: "Sarah visits the local market and meets a friendly vendor.",
      descriptionTranslations: { ar: "تزور سارة السوق المحلي وتلتقي ببائع ودود." },
      difficulty: Difficulty.BEGINNER,
      topic: "daily-life",
      isPremium: false,
      isPublished: true,
      wordCount: 88,
      lines: {
        create: [
          { position: 1, text: "Sarah went to the market on Saturday morning.", translations: { ar: "ذهبت سارة إلى السوق صباح يوم السبت." } },
          { position: 2, text: "The market was full of colour and noise.", translations: { ar: "كان السوق مليئًا بالألوان والضجيج." } },
          { position: 3, text: "She saw fruits, vegetables, and fresh flowers.", translations: { ar: "رأت الفواكه والخضروات والزهور الطازجة." } },
          { position: 4, text: "A friendly man called out to her.", translations: { ar: "ناداها رجل ودود." } },
          { position: 5, text: "He was selling oranges for a very good price.", translations: { ar: "كان يبيع البرتقال بسعر جيد جداً." } },
          { position: 6, text: "She bought a bag of oranges and some tomatoes.", translations: { ar: "اشترت كيسًا من البرتقال وبعض الطماطم." } },
          { position: 7, text: "The man smiled and said, 'Come back next week!'", translations: { ar: "ابتسم الرجل وقال: 'تعودي الأسبوع القادم!'" } },
          { position: 8, text: "Sarah walked home, happy with her purchases.", translations: { ar: "مشت سارة إلى المنزل سعيدة بمشترياتها." } },
          { position: 9, text: "She decided to visit the market every weekend.", translations: { ar: "قررت زيارة السوق كل نهاية أسبوع." } },
        ],
      },
    },
    {
      slug: "a-phone-call",
      title: "A Phone Call",
      titleTranslations: { ar: "مكالمة هاتفية" },
      description: "Omar calls his mother after a long week at work.",
      descriptionTranslations: { ar: "يتصل عمر بأمه بعد أسبوع طويل في العمل." },
      difficulty: Difficulty.BEGINNER,
      topic: "family",
      isPremium: false,
      isPublished: true,
      wordCount: 95,
      lines: {
        create: [
          { position: 1, text: "Omar sat down after a long day at work.", translations: { ar: "جلس عمر بعد يوم طويل في العمل." } },
          { position: 2, text: "He picked up his phone and called his mother.", translations: { ar: "أمسك هاتفه واتصل بأمه." } },
          { position: 3, text: "She answered on the second ring.", translations: { ar: "ردت في الرنة الثانية." } },
          { position: 4, text: "'How are you, my son?' she asked warmly.", translations: { ar: "'كيف حالك يا ابني؟' سألت بدفء." } },
          { position: 5, text: "Omar smiled and felt better already.", translations: { ar: "ابتسم عمر وشعر بتحسن على الفور." } },
          { position: 6, text: "He told her about his week at work.", translations: { ar: "أخبرها عن أسبوعه في العمل." } },
          { position: 7, text: "She listened carefully and gave him good advice.", translations: { ar: "أنصتت باهتمام وأعطته نصائح جيدة." } },
          { position: 8, text: "'Remember to eat well and rest,' she said.", translations: { ar: "'تذكر أن تأكل جيداً وتستريح،' قالت." } },
          { position: 9, text: "After the call, Omar felt calm and grateful.", translations: { ar: "بعد المكالمة، شعر عمر بالهدوء والامتنان." } },
          { position: 10, text: "He went to the kitchen to make dinner.", translations: { ar: "ذهب إلى المطبخ ليعد العشاء." } },
        ],
      },
    },
  ];

  for (const story of stories) {
    await db.story.upsert({
      where: { slug: story.slug },
      update: {},
      create: story,
    });
    console.log(`✅ Story: "${story.title}"`);
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
