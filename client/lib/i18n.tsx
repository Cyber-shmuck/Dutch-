import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ru' | 'uk';

type Dictionary = Record<string, string>;

const dictionaries: Record<Language, Dictionary> = {
  en: {
    'nav.words': 'Words',
    'nav.rules': 'Grammar',
    'nav.verbs': 'Strong Verbs',
    'app.title': 'Dutch words',
    'theme.toggle': 'Toggle Theme',
    'lang.toggle': 'RU / EN / UA',
    'donate.button': 'Thanks ❤️',
    'donate.title': 'Support the Project',
    'donate.desc': 'If you find this app helpful, consider buying us a coffee!',
    'donate.paypal': 'Donate via PayPal',
    'donate.card': 'Pay with Card',
    'words.new': 'Learn',
    'words.my': 'Add',
    'words.learned': 'Learned',
    'words.review': 'Repeat',
    'words.add': 'Add',
    'words.empty': 'No words available. Add some to get started!',
    'words.know': 'Know',
    'words.dontKnow': "Don't know",
    'words.completed': "You've reviewed all words for now! 🎉",
    'words.dutch': 'Dutch Word',
    'words.translation': 'Translation',
    'rules.add': 'Add Rule',
    'rules.empty': 'No grammar rules added yet.',
    'rules.difficulty.A1': 'A1',
    'rules.difficulty.A2': 'A2',
    'rules.difficulty.B1': 'B1',
    'rules.difficulty.B2': 'B2',
    'rules.title': 'Rule Title',
    'rules.explanation': 'Explanation',
    'rules.difficulty': 'Difficulty',
    'verbs.add': 'Add Verb',
    'verbs.empty': 'No irregular verbs added yet.',
    'verbs.study': 'Study Mode',
    'verbs.table': 'All Verbs',
    'verbs.infinitive': 'Infinitive',
    'verbs.pastSingular': 'Past Singular',
    'verbs.pastParticiple': 'Past Participle',
    'verbs.example': 'Example',
    'verbs.markLearned': 'Mark Learned',
    'verbs.markUnlearned': 'Mark Unlearned',
    'nav.context': 'Context',
    'context.placeholder': 'Search a word...',
    'context.empty': 'No examples found for this word. Try another one!',
    'words.repeatWeak': 'Weak Words',
    'words.repeatList': 'My List',
    'words.repeatProgress': '{count}/5',
    'words.repeatWeakEmpty': 'No weak words! Keep learning.',
    'words.repeatListEmpty': 'Your repeat list is empty. Add words to practice.',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.creating': 'Creating...',
    'common.flip': 'Tap to flip',
    'auth.login': 'Log In',
    'auth.logout': 'Log Out',
    'auth.register': 'Sign Up',
    'auth.back': 'Back',
    'auth.createAccount': 'Create your account to start learning',
    'auth.welcomeBack': 'Welcome back! Sign in to continue',
    'auth.nickname': 'Nickname',
    'auth.nicknamePlaceholder': 'Your name',
    'auth.password': 'Password',
    'auth.passwordMin': 'At least 6 characters',
    'auth.passwordPlaceholder': 'Enter your password',
    'auth.hasAccount': 'Already have an account?',
    'auth.noAccount': "Don't have an account?",
    'auth.error': 'Error',
    'landing.hero.title': 'Learn Dutch the Smart Way',
    'landing.hero.subtitle': 'Interactive flashcards, grammar rules, irregular verbs, and context search — all in one place.',
    'landing.hero.cta': 'Get Started Free',
    'landing.feature1.title': '5000+ Flashcards',
    'landing.feature1.desc': 'Learn vocabulary from A1 to B2 with interactive flashcards and spaced repetition.',
    'landing.feature2.title': 'Grammar Rules',
    'landing.feature2.desc': 'Clear explanations of Dutch grammar with examples for each CEFR level.',
    'landing.feature3.title': 'Irregular Verbs',
    'landing.feature3.desc': 'Master 50+ irregular verbs with study mode and progress tracking.',
    'landing.feature4.title': 'Context Search',
    'landing.feature4.desc': 'Find example sentences to see how words are used in real context.',
    'landing.footer': 'Dutch — Your free Dutch language learning companion',
  },
  ru: {
    'nav.words': 'Слова',
    'nav.rules': 'Грамматика',
    'nav.verbs': 'Неправильные глаголы',
    'app.title': 'Dutch words',
    'theme.toggle': 'Сменить тему',
    'lang.toggle': 'RU / EN / UA',
    'donate.button': 'Спасибо ❤️',
    'donate.title': 'Поддержать проект',
    'donate.desc': 'Если вам нравится приложение, можете угостить нас кофе!',
    'donate.paypal': 'Пожертвовать через PayPal',
    'donate.card': 'Оплатить картой',
    'words.new': 'Изучение',
    'words.my': 'Добавить',
    'words.learned': 'Выученные',
    'words.review': 'Повтор',
    'words.add': 'Добавить',
    'words.empty': 'Нет слов. Добавьте, чтобы начать!',
    'words.know': 'Знаю',
    'words.dontKnow': "Не знаю",
    'words.completed': "На сегодня всё! 🎉",
    'words.dutch': 'Слово (Нидерландский)',
    'words.translation': 'Перевод',
    'rules.add': 'Добавить правило',
    'rules.empty': 'Правил пока нет.',
    'rules.difficulty.A1': 'A1',
    'rules.difficulty.A2': 'A2',
    'rules.difficulty.B1': 'B1',
    'rules.difficulty.B2': 'B2',
    'rules.title': 'Название правила',
    'rules.explanation': 'Объяснение',
    'rules.difficulty': 'Сложность',
    'verbs.add': 'Добавить глагол',
    'verbs.empty': 'Глаголов пока нет.',
    'verbs.study': 'Режим изучения',
    'verbs.table': 'Все глаголы',
    'verbs.infinitive': 'Инфинитив',
    'verbs.pastSingular': 'Прошедшее (ед.ч.)',
    'verbs.pastParticiple': 'Причастие',
    'verbs.example': 'Пример',
    'verbs.markLearned': 'Выучено',
    'verbs.markUnlearned': 'Не выучено',
    'nav.context': 'Контекст',
    'context.placeholder': 'Искать слово...',
    'context.empty': 'Примеров для этого слова не найдено. Попробуйте другое!',
    'words.repeatWeak': 'Слабые слова',
    'words.repeatList': 'Мой список',
    'words.repeatProgress': '{count}/5',
    'words.repeatWeakEmpty': 'Слабых слов нет! Продолжайте учить.',
    'words.repeatListEmpty': 'Список повторения пуст. Добавьте слова для практики.',
    'common.cancel': 'Отмена',
    'common.save': 'Сохранить',
    'common.creating': 'Создание...',
    'common.flip': 'Нажмите, чтобы перевернуть',
    'auth.login': 'Войти',
    'auth.logout': 'Выйти',
    'auth.register': 'Регистрация',
    'auth.back': 'Назад',
    'auth.createAccount': 'Создайте аккаунт, чтобы начать учить',
    'auth.welcomeBack': 'С возвращением! Войдите, чтобы продолжить',
    'auth.nickname': 'Имя',
    'auth.nicknamePlaceholder': 'Ваше имя',
    'auth.password': 'Пароль',
    'auth.passwordMin': 'Минимум 6 символов',
    'auth.passwordPlaceholder': 'Введите пароль',
    'auth.hasAccount': 'Уже есть аккаунт?',
    'auth.noAccount': 'Нет аккаунта?',
    'auth.error': 'Ошибка',
    'landing.hero.title': 'Учите нидерландский с умом',
    'landing.hero.subtitle': 'Интерактивные карточки, грамматика, неправильные глаголы и контекстный поиск — всё в одном месте.',
    'landing.hero.cta': 'Начать бесплатно',
    'landing.feature1.title': '5000+ карточек',
    'landing.feature1.desc': 'Учите лексику от A1 до B2 с интерактивными карточками и интервальным повторением.',
    'landing.feature2.title': 'Правила грамматики',
    'landing.feature2.desc': 'Понятные объяснения грамматики с примерами для каждого уровня CEFR.',
    'landing.feature3.title': 'Неправильные глаголы',
    'landing.feature3.desc': '50+ неправильных глаголов с режимом изучения и отслеживанием прогресса.',
    'landing.feature4.title': 'Контекстный поиск',
    'landing.feature4.desc': 'Находите примеры предложений, чтобы видеть слова в контексте.',
    'landing.footer': 'Dutch — Ваш бесплатный помощник в изучении нидерландского языка',
  },
  uk: {
    'nav.words': 'Слова',
    'nav.rules': 'Граматика',
    'nav.verbs': 'Неправильні дієслова',
    'app.title': 'Dutch words',
    'theme.toggle': 'Змінити тему',
    'lang.toggle': 'RU / EN / UA',
    'donate.button': 'Дякую ❤️',
    'donate.title': 'Підтримати проєкт',
    'donate.desc': 'Якщо вам подобається додаток, пригостіть нас кавою!',
    'donate.paypal': 'Пожертвувати через PayPal',
    'donate.card': 'Оплатити карткою',
    'words.new': 'Вивчення',
    'words.my': 'Додати',
    'words.learned': 'Вивчені',
    'words.review': 'Повтор',
    'words.add': 'Додати',
    'words.empty': 'Немає слів. Додайте, щоб почати!',
    'words.know': 'Знаю',
    'words.dontKnow': 'Не знаю',
    'words.completed': 'На сьогодні все! 🎉',
    'words.dutch': 'Слово (Нідерландська)',
    'words.translation': 'Переклад',
    'rules.add': 'Додати правило',
    'rules.empty': 'Правил поки немає.',
    'rules.difficulty.A1': 'A1',
    'rules.difficulty.A2': 'A2',
    'rules.difficulty.B1': 'B1',
    'rules.difficulty.B2': 'B2',
    'rules.title': 'Назва правила',
    'rules.explanation': 'Пояснення',
    'rules.difficulty': 'Складність',
    'verbs.add': 'Додати дієслово',
    'verbs.empty': 'Дієслів поки немає.',
    'verbs.study': 'Режим вивчення',
    'verbs.table': 'Усі дієслова',
    'verbs.infinitive': 'Інфінітив',
    'verbs.pastSingular': 'Минулий (одн.)',
    'verbs.pastParticiple': 'Дієприкметник',
    'verbs.example': 'Приклад',
    'verbs.markLearned': 'Вивчено',
    'verbs.markUnlearned': 'Не вивчено',
    'nav.context': 'Контекст',
    'context.placeholder': 'Шукати слово...',
    'context.empty': 'Прикладів для цього слова не знайдено. Спробуйте інше!',
    'words.repeatWeak': 'Слабкі слова',
    'words.repeatList': 'Мій список',
    'words.repeatProgress': '{count}/5',
    'words.repeatWeakEmpty': 'Слабких слів немає! Продовжуйте вчити.',
    'words.repeatListEmpty': 'Список повторення порожній. Додайте слова для практики.',
    'common.cancel': 'Скасувати',
    'common.save': 'Зберегти',
    'common.creating': 'Створення...',
    'common.flip': 'Натисніть, щоб перевернути',
    'auth.login': 'Увійти',
    'auth.logout': 'Вийти',
    'auth.register': 'Реєстрація',
    'auth.back': 'Назад',
    'auth.createAccount': 'Створіть акаунт, щоб почати вчити',
    'auth.welcomeBack': 'З поверненням! Увійдіть, щоб продовжити',
    'auth.nickname': "Ім'я",
    'auth.nicknamePlaceholder': "Ваше ім'я",
    'auth.password': 'Пароль',
    'auth.passwordMin': 'Мінімум 6 символів',
    'auth.passwordPlaceholder': 'Введіть пароль',
    'auth.hasAccount': 'Вже є акаунт?',
    'auth.noAccount': 'Немає акаунту?',
    'auth.error': 'Помилка',
    'landing.hero.title': 'Вивчайте нідерландську розумно',
    'landing.hero.subtitle': 'Інтерактивні картки, граматика, неправильні дієслова та контекстний пошук — усе в одному місці.',
    'landing.hero.cta': 'Почати безкоштовно',
    'landing.feature1.title': '5000+ карток',
    'landing.feature1.desc': 'Вивчайте лексику від A1 до B2 з інтерактивними картками та інтервальним повторенням.',
    'landing.feature2.title': 'Правила граматики',
    'landing.feature2.desc': 'Зрозумілі пояснення граматики з прикладами для кожного рівня CEFR.',
    'landing.feature3.title': 'Неправильні дієслова',
    'landing.feature3.desc': '50+ неправильних дієслів з режимом вивчення та відстеженням прогресу.',
    'landing.feature4.title': 'Контекстний пошук',
    'landing.feature4.desc': 'Знаходьте приклади речень, щоб бачити слова в контексті.',
    'landing.footer': 'Dutch — Ваш безкоштовний помічник у вивченні нідерландської мови',
  }
};

const langOrder: Language[] = ['en', 'ru', 'uk'];
const langLabels: Record<Language, string> = { en: 'EN', ru: 'RU', uk: 'UA' };

interface I18nContextType {
  lang: Language;
  toggleLang: () => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'ru' || saved === 'en' || saved === 'uk') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', lang);
  }, [lang]);

  const toggleLang = () => {
    setLang(prev => {
      const idx = langOrder.indexOf(prev);
      return langOrder[(idx + 1) % langOrder.length];
    });
  };
  
  const t = (key: string): string => {
    return dictionaries[lang][key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export { langLabels };
