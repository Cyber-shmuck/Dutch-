import { createServer, type Server } from "http";
import type { Express } from "express";
import { storage } from "./storage";
import { insertWordSchema, insertRuleSchema } from "@shared/schema";
import { z } from "zod";
import { CONTEXT_SENTENCES } from "./context-seed";
import { SEED_WORDS } from "./words-seed";
import { setupSession, registerAuthRoutes } from "./auth";

async function seedDatabase() {
  const existingWords = await storage.getWords();
  if (existingWords.length === 0) {
    for (const word of SEED_WORDS) {
      await storage.createWord(word);
    }
  }

  const existingRules = await storage.getRules();
  if (existingRules.length === 0) {
    const grammarRules = [
      {
        title: "De / Het — артикли",
        difficulty: "A1",
        explanation: `В нидерландском два определённых артикля: «de» и «het».

• «de» — для мужского и женского рода (примерно 2/3 всех существительных):
  de man (мужчина), de vrouw (женщина), de tafel (стол), de kat (кошка)

• «het» — для среднего рода и всех уменьшительных форм (-je):
  het huis (дом), het kind (ребёнок), het boekje (книжечка)

• Во множественном числе всегда используется «de»:
  de huizen, de kinderen, de boeken

Совет: запоминайте артикль вместе со словом, как одно целое.`
      },
      {
        title: "Личные местоимения",
        difficulty: "A1",
        explanation: `Подлежащие местоимения (subject pronouns):

ik — я                   wij (we) — мы
jij (je) — ты            jullie — вы
hij — он                 zij (ze) — они
zij (ze) — она
het — оно
u — Вы (вежливое)

Объектные местоимения (object pronouns):
mij (me) — меня/мне      ons — нас/нам
jou (je) — тебя/тебе     jullie — вас/вам
hem — его/ему             hen/hun — их/им
haar — её/ей

Пример: Ik zie hem. (Я вижу его.) — Hij ziet mij. (Он видит меня.)`
      },
      {
        title: "Настоящее время (Presens)",
        difficulty: "A1",
        explanation: `Образование настоящего времени:

1. Находим основу глагола: убираем -en из инфинитива
   werken → werk, lopen → loop, lezen → lees

2. Добавляем окончания:
   ik       → основа          (ik werk)
   jij/je   → основа + t      (jij werkt)
   hij/zij  → основа + t      (hij werkt)
   wij      → инфинитив       (wij werken)
   jullie   → инфинитив       (jullie werken)
   zij (мн.)→ инфинитив       (zij werken)

Исключение: если jij стоит ПОСЛЕ глагола, -t не добавляется:
   Jij werkt. НО: Werk jij hier? (Ты здесь работаешь?)

Неправильные: zijn (быть): ik ben, jij bent, hij is, wij zijn
              hebben (иметь): ik heb, jij hebt, hij heeft, wij hebben`
      },
      {
        title: "Отрицание: niet / geen",
        difficulty: "A1",
        explanation: `Два способа отрицания:

• «geen» — заменяет неопределённый артикль (een) или нулевой артикль:
  Ik heb een auto. → Ik heb geen auto. (У меня нет машины.)
  Ik drink koffie. → Ik drink geen koffie. (Я не пью кофе.)

• «niet» — во всех остальных случаях:
  Ik werk niet. (Я не работаю.)
  Het boek is niet groot. (Книга не большая.)
  Ik ga niet naar huis. (Я не иду домой.)

Место «niet» в предложении:
  — В конце, если отрицается глагол: Ik werk niet.
  — Перед прилагательным: Het is niet mooi.
  — Перед предлогом: Ik ga niet naar school.`
      },
      {
        title: "Числительные 0–100",
        difficulty: "A1",
        explanation: `0 nul, 1 een, 2 twee, 3 drie, 4 vier, 5 vijf
6 zes, 7 zeven, 8 acht, 9 negen, 10 tien
11 elf, 12 twaalf, 13 dertien, 14 veertien

20 twintig, 30 dertig, 40 veertig, 50 vijftig
60 zestig, 70 zeventig, 80 tachtig, 90 negentig, 100 honderd

Составные числа — единицы ПЕРЕД десятками (как в немецком):
21 = eenentwintig (een-en-twintig, «один и двадцать»)
35 = vijfendertig
99 = negenennegentig`
      },
      {
        title: "Порядок слов: V2-правило",
        difficulty: "A2",
        explanation: `Главное правило нидерландского: спрягаемый глагол ВСЕГДА на втором месте.

Обычный порядок: Подлежащее + Глагол + Остальное
  Ik werk vandaag. (Я работаю сегодня.)

Инверсия — если предложение начинается НЕ с подлежащего:
  Vandaag werk ik. (Сегодня работаю я.)
  Morgen ga ik naar Amsterdam. (Завтра я еду в Амстердам.)

Глагол остаётся на 2-м месте, подлежащее перемещается за него.

В вопросах глагол стоит на 1-м месте:
  Werk jij hier? (Ты здесь работаешь?)
  Heb je een broer? (У тебя есть брат?)`
      },
      {
        title: "Прошедшее время (Perfectum)",
        difficulty: "A2",
        explanation: `Perfectum = hebben/zijn + причастие прошедшего времени (voltooid deelwoord)

Образование причастия:
• Слабые глаголы: ge- + основа + -t/-d
  werken → gewerkt, leven → geleefd
  (-t после глухих: p, t, k, f, s, ch — запомните: 't kofschip)
  (-d после остальных)

• Сильные глаголы: ge- + изменённая основа + -en
  schrijven → geschreven, lezen → gelezen

Глаголы с zijn (вместо hebben) — глаголы движения и изменения состояния:
  gaan → Ik ben gegaan. (Я пошёл.)
  komen → Hij is gekomen. (Он пришёл.)
  worden → Zij is geworden. (Она стала.)

Глаголы на be-, ver-, ge-, ont-, her- НЕ добавляют ge-:
  vertellen → verteld, beginnen → begonnen`
      },
      {
        title: "Модальные глаголы",
        difficulty: "A2",
        explanation: `Модальные глаголы + инфинитив в конце предложения:

kunnen (мочь):    Ik kan zwemmen. (Я умею плавать.)
moeten (должен):  Jij moet studeren. (Ты должен учиться.)
willen (хотеть):  Wij willen eten. (Мы хотим есть.)
mogen (иметь разрешение): Je mag hier roken. (Здесь можно курить.)
zullen (буду):    Ik zal bellen. (Я позвоню.)

Спряжение (настоящее время):
        kunnen  moeten  willen  mogen   zullen
ik      kan     moet    wil     mag     zal
jij     kan/kunt moet   wil/wilt mag    zal/zult
hij     kan     moet    wil     mag     zal
wij     kunnen  moeten  willen  mogen   zullen`
      },
      {
        title: "Притяжательные местоимения",
        difficulty: "A2",
        explanation: `mijn (m'n) — мой/моя/моё     ons/onze — наш/наша
jouw (je) — твой/твоя          jullie — ваш/ваша
zijn (z'n) — его               hun — их
haar (d'r) — её
uw — Ваш (вежливое)

«ons» используется с het-словами, «onze» — с de-словами:
  ons huis (наш дом, het huis)
  onze auto (наша машина, de auto)

Пример: Mijn broer en zijn vrouw wonen in ons huis.
(Мой брат и его жена живут в нашем доме.)`
      },
      {
        title: "Предлоги места и направления",
        difficulty: "A2",
        explanation: `Основные предлоги:

in — в:        Ik woon in Amsterdam. (Я живу в Амстердаме.)
op — на:       Het boek ligt op de tafel. (Книга лежит на столе.)
aan — у/при:   Zij zit aan tafel. (Она сидит за столом.)
naar — к/в (направление): Ik ga naar huis. (Я иду домой.)
uit — из:      Hij komt uit Nederland. (Он из Нидерландов.)
van — от/из:   De trein van Amsterdam. (Поезд из Амстердама.)
bij — у/возле: Ik ben bij de dokter. (Я у врача.)
met — с:       Ik ga met de trein. (Я еду поездом.)
voor — перед/для: Dit is voor jou. (Это для тебя.)
achter — за:   De tuin is achter het huis. (Сад за домом.)
tussen — между: Tussen de twee huizen. (Между двумя домами.)
naast — рядом: Naast de school. (Рядом со школой.)`
      },
      {
        title: "Отделяемые приставки",
        difficulty: "B1",
        explanation: `Многие голландские глаголы имеют отделяемые приставки.

В главном предложении приставка отделяется и идёт в КОНЕЦ:
  opstaan (вставать): Ik sta om 7 uur op. (Я встаю в 7 часов.)
  meenemen (брать с собой): Neem je een paraplu mee? (Берёшь зонт?)
  opbellen (звонить): Ik bel je morgen op. (Я позвоню тебе завтра.)

Отделяемые приставки: aan, af, bij, in, mee, na, op, out, terug, toe, uit, voor

НЕотделяемые приставки (ударение на корне): be-, er-, ge-, her-, ont-, ver-
  vertellen → Ik vertel een verhaal. (приставка НЕ отделяется)

В Perfectum приставка + ge- + основа:
  opbellen → opgebeld
  meenemen → meegenomen`
      },
      {
        title: "Придаточные предложения",
        difficulty: "B1",
        explanation: `В придаточном предложении глагол уходит в КОНЕЦ:

Союзы: dat (что), omdat (потому что), als (если/когда),
        wanneer (когда), terwijl (пока), hoewel (хотя),
        voordat (прежде чем), nadat (после того как)

Ik weet dat hij morgen komt.
(Я знаю, что он завтра придёт.)  — «komt» в конце!

Ik blijf thuis, omdat het regent.
(Я остаюсь дома, потому что идёт дождь.)

Als het mooi weer is, gaan we naar het park.
(Если будет хорошая погода, мы пойдём в парк.)

Обратите внимание: после придаточного + запятой, основное предложение начинается с глагола (инверсия):
  Omdat het regent, blijf ik thuis.`
      },
      {
        title: "Прошедшее время (Imperfectum)",
        difficulty: "B1",
        explanation: `Imperfectum — простое прошедшее время (без вспомогательного глагола).

Слабые глаголы:
  основа + -te/-ten (после p, t, k, f, s, ch — 't kofschip)
  основа + -de/-den (после остальных)

  werken: ik werkte, wij werkten
  leven:  ik leefde, wij leefden

Сильные глаголы — меняется гласная корня:
  schrijven: ik schreef, wij schreven
  lezen:     ik las, wij lazen
  gaan:      ik ging, wij gingen
  komen:     ik kwam, wij kwamen

Когда использовать Imperfectum vs Perfectum:
  — Imperfectum: рассказ, описание, длительные действия в прошлом
  — Perfectum: разговорная речь, завершённые действия`
      },
      {
        title: "Относительные местоимения",
        difficulty: "B1",
        explanation: `die / dat — «который/которая/которое»

• «die» — для de-слов и множественного числа:
  De man die daar staat. (Мужчина, который там стоит.)
  De boeken die ik lees. (Книги, которые я читаю.)

• «dat» — для het-слов (единственное число):
  Het huis dat daar staat. (Дом, который там стоит.)
  Het boek dat ik lees. (Книга, которую я читаю.)

• «waar» + предлог — для предложных конструкций:
  Het huis waar ik in woon. → Het huis waarin ik woon.
  (Дом, в котором я живу.)

• «wie» — для людей после предлога:
  De man met wie ik praat. (Мужчина, с которым я говорю.)`
      },
      {
        title: "Сравнительная и превосходная степень",
        difficulty: "B1",
        explanation: `Сравнительная степень: прилагательное + -er
  groot → groter (больше)
  mooi → mooier (красивее)
  duur → duurder (дороже)

Превосходная степень: het + прилагательное + -st(e)
  groot → het grootst / de grootste
  mooi → het mooist / de mooiste

Исключения:
  goed → beter → best (хороший)
  veel → meer → meest (много)
  weinig → minder → minst (мало)
  graag → liever → liefst (охотно)

Сравнение: dan (чем)
  Hij is groter dan ik. (Он выше, чем я.)
  Amsterdam is mooier dan Rotterdam.`
      },
      {
        title: "Пассивный залог (Passief)",
        difficulty: "B2",
        explanation: `Пассив = worden + причастие прошедшего времени

Настоящее время:
  Het boek wordt gelezen. (Книга читается.)
  De huizen worden gebouwd. (Дома строятся.)

Прошедшее время (Imperfectum):
  Het boek werd gelezen. (Книга читалась.)

Прошедшее время (Perfectum):
  Het boek is gelezen. (Книга была прочитана.)
  — Обратите внимание: «is», не «is geworden»!

Агент действия вводится предлогом «door»:
  Het boek is geschreven door een beroemde schrijver.
  (Книга написана известным писателем.)

«Er» используется, когда агент неизвестен:
  Er wordt veel gepraat. (Много говорят.)`
      },
      {
        title: "Сослагательное наклонение / Условные предложения",
        difficulty: "B2",
        explanation: `Условные предложения с «als» и «zou/zouden»:

Реальное условие (тип 1):
  Als het regent, neem ik een paraplu.
  (Если пойдёт дождь, я возьму зонт.)

Нереальное условие (тип 2) — zou + инфинитив:
  Als ik rijk was, zou ik een groot huis kopen.
  (Если бы я был богат, я бы купил большой дом.)

Нереальное в прошлом (тип 3) — zou + hebben/zijn + причастие:
  Als ik had gestudeerd, zou ik geslaagd zijn.
  (Если бы я учился, я бы сдал экзамен.)

«Zou» — спряжение:
  ik zou, jij zou, hij zou, wij zouden, jullie zouden, zij zouden`
      },
      {
        title: "Конструкция er + предлог",
        difficulty: "B2",
        explanation: `«Er» — многофункциональное слово в нидерландском:

1. Existential er (= «есть/существует»):
   Er zijn veel mensen. (Есть много людей.)
   Er is een probleem. (Есть проблема.)

2. Locative er (= «там»):
   Ik ben er geweest. (Я там был.)

3. Prepositional er (заменяет «het» + предлог):
   Ik denk aan het boek. → Ik denk eraan.
   (Я думаю о книге. → Я думаю об этом.)
   
   Hij wacht op de bus. → Hij wacht erop.
   (Он ждёт автобус. → Он ждёт его.)

4. Quantitative er (при указании количества):
   Hoeveel boeken heb je? Ik heb er drie.
   (Сколько книг у тебя? У меня их три.)`
      },
      {
        title: "Косвенная речь",
        difficulty: "B2",
        explanation: `Прямая → косвенная речь:

Прямая: Hij zei: "Ik ga morgen naar Amsterdam."
Косвенная: Hij zei dat hij morgen naar Amsterdam ging.

Правила:
1. Добавляется «dat», глагол уходит в конец
2. Местоимения меняются (ik → hij/zij)
3. Время может сдвигаться:
   presens → imperfectum (ga → ging)
   perfectum → plusquamperfectum (heb gedaan → had gedaan)

Вопросы в косвенной речи:
  "Waar woon je?" → Hij vroeg waar ik woonde.
  "Heb je een auto?" → Hij vroeg of ik een auto had.

Союз «of» используется для да/нет вопросов.`
      },
    ];

    for (const rule of grammarRules) {
      await storage.createRule(rule);
    }
  }

  const contextCount = await storage.getContextCount();
  if (contextCount === 0) {
    await storage.createContextSentencesBulk(CONTEXT_SENTENCES);
    console.log(`Seeded ${CONTEXT_SENTENCES.length} context sentences`);
  }

  const existingVerbs = await storage.getVerbs();
  if (existingVerbs.length === 0) {
    const defaultVerbs = [
      { infinitive: "bakken", pastSingular: "bakte", pastParticiple: "gebakken", translation: "печь / to bake", example: "Ik bak een taart.", isLearned: false },
      { infinitive: "beginnen", pastSingular: "begon", pastParticiple: "begonnen", translation: "начинать / to begin", example: "De les begon om 9 uur.", isLearned: false },
      { infinitive: "begrijpen", pastSingular: "begreep", pastParticiple: "begrepen", translation: "понимать / to understand", example: "Ik begrijp het.", isLearned: false },
      { infinitive: "blijven", pastSingular: "bleef", pastParticiple: "gebleven", translation: "оставаться / to stay", example: "Blijf hier.", isLearned: false },
      { infinitive: "brengen", pastSingular: "bracht", pastParticiple: "gebracht", translation: "приносить / to bring", example: "Breng me een krant.", isLearned: false },
      { infinitive: "denken", pastSingular: "dacht", pastParticiple: "gedacht", translation: "думать / to think", example: "Ik denk het wel.", isLearned: false },
      { infinitive: "doen", pastSingular: "deed", pastParticiple: "gedaan", translation: "делать / to do", example: "Wat doe je?", isLearned: false },
      { infinitive: "dragen", pastSingular: "droeg", pastParticiple: "gedragen", translation: "носить / to carry, wear", example: "Zij draagt een jas.", isLearned: false },
      { infinitive: "drinken", pastSingular: "dronk", pastParticiple: "gedronken", translation: "пить / to drink", example: "Ik drink water.", isLearned: false },
      { infinitive: "eten", pastSingular: "at", pastParticiple: "gegeten", translation: "есть / to eat", example: "Wat eet je?", isLearned: false },
      { infinitive: "gaan", pastSingular: "ging", pastParticiple: "gegaan", translation: "идти / to go", example: "Wij gaan naar huis.", isLearned: false },
      { infinitive: "geven", pastSingular: "gaf", pastParticiple: "gegeven", translation: "давать / to give", example: "Ik geef je een cadeau.", isLearned: false },
      { infinitive: "hebben", pastSingular: "had", pastParticiple: "gehad", translation: "иметь / to have", example: "Ik heb een auto.", isLearned: false },
      { infinitive: "helpen", pastSingular: "hielp", pastParticiple: "geholpen", translation: "помогать / to help", example: "Help me even.", isLearned: false },
      { infinitive: "houden", pastSingular: "hield", pastParticiple: "gehouden", translation: "держать / to hold", example: "Houd de deur open.", isLearned: false },
      { infinitive: "kiezen", pastSingular: "koos", pastParticiple: "gekozen", translation: "выбирать / to choose", example: "Kies een kleur.", isLearned: false },
      { infinitive: "kijken", pastSingular: "keek", pastParticiple: "gekeken", translation: "смотреть / to look", example: "Kijk naar mij.", isLearned: false },
      { infinitive: "komen", pastSingular: "kwam", pastParticiple: "gekomen", translation: "приходить / to come", example: "Hij komt uit Nederland.", isLearned: false },
      { infinitive: "kopen", pastSingular: "kocht", pastParticiple: "gekocht", translation: "покупать / to buy", example: "Ik koop een fiets.", isLearned: false },
      { infinitive: "krijgen", pastSingular: "kreeg", pastParticiple: "gekregen", translation: "получать / to get", example: "Ik krijg een cadeau.", isLearned: false },
      { infinitive: "kunnen", pastSingular: "kon", pastParticiple: "gekund", translation: "мочь / to be able", example: "Ik kan het doen.", isLearned: false },
      { infinitive: "laten", pastSingular: "liet", pastParticiple: "gelaten", translation: "позволять / to let", example: "Laat me gaan.", isLearned: false },
      { infinitive: "lezen", pastSingular: "las", pastParticiple: "gelezen", translation: "читать / to read", example: "Ik lees een boek.", isLearned: false },
      { infinitive: "liggen", pastSingular: "lag", pastParticiple: "gelegen", translation: "лежать / to lie down", example: "De kat ligt op bed.", isLearned: false },
      { infinitive: "lijken", pastSingular: "leek", pastParticiple: "geleken", translation: "казаться / to seem", example: "Het lijkt op regen.", isLearned: false },
      { infinitive: "lopen", pastSingular: "liep", pastParticiple: "gelopen", translation: "идти / to walk", example: "Wij lopen buiten.", isLearned: false },
      { infinitive: "moeten", pastSingular: "moest", pastParticiple: "gemoeten", translation: "быть должным / must", example: "Ik moet gaan.", isLearned: false },
      { infinitive: "mogen", pastSingular: "mocht", pastParticiple: "gemogen", translation: "мочь (разрешение) / may", example: "Mag ik dat?", isLearned: false },
      { infinitive: "nemen", pastSingular: "nam", pastParticiple: "genomen", translation: "брать / to take", example: "Neem een appel.", isLearned: false },
      { infinitive: "rijden", pastSingular: "reed", pastParticiple: "gereden", translation: "ездить / to drive", example: "Wij rijden naar de stad.", isLearned: false },
      { infinitive: "roepen", pastSingular: "riep", pastParticiple: "geroepen", translation: "звать / to call", example: "Roep de kinderen.", isLearned: false },
      { infinitive: "schrijven", pastSingular: "schreef", pastParticiple: "geschreven", translation: "писать / to write", example: "Schrijf een brief.", isLearned: false },
      { infinitive: "slapen", pastSingular: "sliep", pastParticiple: "geslapen", translation: "спать / to sleep", example: "Lekker slapen.", isLearned: false },
      { infinitive: "spreken", pastSingular: "sprak", pastParticiple: "gesproken", translation: "говорить / to speak", example: "Ik spreek Nederlands.", isLearned: false },
      { infinitive: "staan", pastSingular: "stond", pastParticiple: "gestaan", translation: "стоять / to stand", example: "Het staat op tafel.", isLearned: false },
      { infinitive: "vallen", pastSingular: "viel", pastParticiple: "gevallen", translation: "падать / to fall", example: "De appel valt.", isLearned: false },
      { infinitive: "vinden", pastSingular: "vond", pastParticiple: "gevonden", translation: "находить / to find", example: "Ik vind het leuk.", isLearned: false },
      { infinitive: "vragen", pastSingular: "vroeg", pastParticiple: "gevraagd", translation: "спрашивать / to ask", example: "Vraag het hem.", isLearned: false },
      { infinitive: "weten", pastSingular: "wist", pastParticiple: "geweten", translation: "знать / to know", example: "Ik weet het не.", isLearned: false },
      { infinitive: "willen", pastSingular: "wilde", pastParticiple: "gewild", translation: "хотеть / to want", example: "Wat wil je?", isLearned: false },
      { infinitive: "worden", pastSingular: "werd", pastParticiple: "geworden", translation: "становиться / to become", example: "Het wordt koud.", isLearned: false },
      { infinitive: "zeggen", pastSingular: "zei", pastParticiple: "gezegd", translation: "говорить / to say", example: "Zij zegt hallo.", isLearned: false },
      { infinitive: "zien", pastSingular: "zag", pastParticiple: "gezien", translation: "видеть / to see", example: "Ik zie de vogel.", isLearned: false },
      { infinitive: "zijn", pastSingular: "was", pastParticiple: "geweest", translation: "быть / to be", example: "Ik ben in Amsterdam.", isLearned: false },
      { infinitive: "zitten", pastSingular: "zat", pastParticiple: "gezeten", translation: "сидеть / to sit", example: "Ik zit op een стоеl.", isLearned: false },
      { infinitive: "zoeken", pastSingular: "zocht", pastParticiple: "gezocht", translation: "искать / to search", example: "Wat zoek je?", isLearned: false },
    ];
    for (const verb of defaultVerbs) {
      await storage.createVerb(verb);
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupSession(app);
  registerAuthRoutes(app);

  seedDatabase().catch(console.error);

  // --- Words ---
  app.get("/api/words", async (req, res) => {
    const items = await storage.getWords();
    res.json(items);
  });

  app.post("/api/words", async (req, res) => {
    try {
      const input = insertWordSchema.parse(req.body);
      const item = await storage.createWord(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch("/api/words/:id", async (req, res) => {
    try {
      const item = await storage.updateWord(Number(req.params.id), req.body);
      if (!item) return res.status(404).json({ message: "Word not found" });
      res.json(item);
    } catch (err) {
      throw err;
    }
  });

  app.delete("/api/words/:id", async (req, res) => {
    const success = await storage.deleteWord(Number(req.params.id));
    if (!success) return res.status(404).json({ message: "Word not found" });
    res.status(204).end();
  });

  // --- Rules ---
  app.get("/api/rules", async (req, res) => {
    const items = await storage.getRules();
    res.json(items);
  });

  app.post("/api/rules", async (req, res) => {
    try {
      const input = insertRuleSchema.parse(req.body);
      const item = await storage.createRule(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // --- Verbs ---
  app.get("/api/verbs", async (req, res) => {
    const items = await storage.getVerbs();
    res.json(items);
  });

  app.patch("/api/verbs/:id", async (req, res) => {
    try {
      const item = await storage.updateVerb(Number(req.params.id), req.body);
      if (!item) return res.status(404).json({ message: "Verb not found" });
      res.json(item);
    } catch (err) {
      throw err;
    }
  });

  app.get("/api/translate", async (req, res) => {
    const word = (req.query.word as string || "").trim().toLowerCase();
    if (!word || word.length < 2) {
      return res.json({ en: "", ru: "", uk: "" });
    }

    try {
      const [enRes, ruRes, ukRes] = await Promise.allSettled([
        fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=nl|en`).then(r => r.json()),
        fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=nl|ru`).then(r => r.json()),
        fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=nl|uk`).then(r => r.json()),
      ]);

      let en = "";
      let ru = "";
      let uk = "";

      if (enRes.status === "fulfilled" && enRes.value?.responseData?.translatedText) {
        const text = enRes.value.responseData.translatedText;
        if (text.toLowerCase() !== word.toLowerCase()) {
          en = text.charAt(0).toUpperCase() + text.slice(1);
        }
      }

      if (ruRes.status === "fulfilled" && ruRes.value?.responseData?.translatedText) {
        const text = ruRes.value.responseData.translatedText;
        if (text.toLowerCase() !== word.toLowerCase()) {
          ru = text.charAt(0).toUpperCase() + text.slice(1);
        }
      }

      if (ukRes.status === "fulfilled" && ukRes.value?.responseData?.translatedText) {
        const text = ukRes.value.responseData.translatedText;
        if (text.toLowerCase() !== word.toLowerCase()) {
          uk = text.charAt(0).toUpperCase() + text.slice(1);
        }
      }

      res.json({ en, ru, uk });
    } catch {
      res.json({ en: "", ru: "", uk: "" });
    }
  });

  app.get("/api/context", async (req, res) => {
    const q = (req.query.q as string || "").trim();
    if (!q) return res.json([]);
    const results = await storage.searchContext(q);
    res.json(results);
  });

  return httpServer;
}
