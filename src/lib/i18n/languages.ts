import type { Lang, ScreenJSONDocument, Text } from '../types/screenjson';

export interface LanguageOption {
  code: Lang;
  base: string;
  flag: string;
  label: string;
  nativeLabel: string;
}

export interface UiStrings {
  language: string;
  lightMode: string;
  darkMode: string;
  print: string;
  close: string;
  info: string;
  download: string;
  page: string;
  pages: string;
  by?: string;
  basedOn?: string;
  work?: string;
  scrollToRead?: string;
  untitledScreenplay?: string;
}

const TOP_LANGUAGES: Record<string, { flag: string; label: string; nativeLabel: string }> = {
  en: { flag: '🇬🇧', label: 'English', nativeLabel: 'English' },
  zh: { flag: '🇨🇳', label: 'Chinese', nativeLabel: '中文' },
  hi: { flag: '🇮🇳', label: 'Hindi', nativeLabel: 'हिन्दी' },
  es: { flag: '🇪🇸', label: 'Spanish', nativeLabel: 'Español' },
  fr: { flag: '🇫🇷', label: 'French', nativeLabel: 'Français' },
  ar: { flag: '🇸🇦', label: 'Arabic', nativeLabel: 'العربية' },
  bn: { flag: '🇧🇩', label: 'Bengali', nativeLabel: 'বাংলা' },
  pt: { flag: '🇵🇹', label: 'Portuguese', nativeLabel: 'Português' },
  ru: { flag: '🇷🇺', label: 'Russian', nativeLabel: 'Русский' },
  ur: { flag: '🇵🇰', label: 'Urdu', nativeLabel: 'اردو' },
  id: { flag: '🇮🇩', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia' },
  de: { flag: '🇩🇪', label: 'German', nativeLabel: 'Deutsch' },
  ja: { flag: '🇯🇵', label: 'Japanese', nativeLabel: '日本語' },
  sw: { flag: '🇹🇿', label: 'Swahili', nativeLabel: 'Kiswahili' },
  mr: { flag: '🇮🇳', label: 'Marathi', nativeLabel: 'मराठी' },
  te: { flag: '🇮🇳', label: 'Telugu', nativeLabel: 'తెలుగు' },
  tr: { flag: '🇹🇷', label: 'Turkish', nativeLabel: 'Türkçe' },
  ta: { flag: '🇮🇳', label: 'Tamil', nativeLabel: 'தமிழ்' },
  vi: { flag: '🇻🇳', label: 'Vietnamese', nativeLabel: 'Tiếng Việt' },
  ko: { flag: '🇰🇷', label: 'Korean', nativeLabel: '한국어' },
  fa: { flag: '🇮🇷', label: 'Persian', nativeLabel: 'فارسی' },
  it: { flag: '🇮🇹', label: 'Italian', nativeLabel: 'Italiano' },
  pl: { flag: '🇵🇱', label: 'Polish', nativeLabel: 'Polski' },
  uk: { flag: '🇺🇦', label: 'Ukrainian', nativeLabel: 'Українська' },
  nl: { flag: '🇳🇱', label: 'Dutch', nativeLabel: 'Nederlands' }
};

const REGION_FLAGS: Record<string, string> = {
  US: '🇺🇸',
  GB: '🇬🇧',
  CA: '🇨🇦',
  AU: '🇦🇺',
  NZ: '🇳🇿',
  BR: '🇧🇷',
  PT: '🇵🇹',
  MX: '🇲🇽',
  ES: '🇪🇸',
  FR: '🇫🇷',
  DE: '🇩🇪',
  CN: '🇨🇳',
  TW: '🇹🇼',
  HK: '🇭🇰'
};

const UI_STRINGS: Record<string, UiStrings> = {
  en: { language: 'Language', lightMode: 'Light mode', darkMode: 'Dark mode', print: 'Print', close: 'Close', info: 'Info', download: 'Download', page: 'page', pages: 'pages', by: 'by', basedOn: 'Based on the', work: 'work', scrollToRead: 'Scroll to read', untitledScreenplay: 'Untitled Screenplay' },
  zh: { language: '语言', lightMode: '浅色模式', darkMode: '深色模式', print: '打印', close: '关闭', info: '信息', download: '下载', page: '页', pages: '页' },
  hi: { language: 'भाषा', lightMode: 'लाइट मोड', darkMode: 'डार्क मोड', print: 'प्रिंट', close: 'बंद करें', info: 'जानकारी', download: 'डाउनलोड', page: 'पृष्ठ', pages: 'पृष्ठ' },
  es: { language: 'Idioma', lightMode: 'Modo claro', darkMode: 'Modo oscuro', print: 'Imprimir', close: 'Cerrar', info: 'Información', download: 'Descargar', page: 'página', pages: 'páginas', by: 'por', basedOn: 'Basado en', work: 'obra', scrollToRead: 'Desplázate para leer', untitledScreenplay: 'Guion sin título' },
  fr: { language: 'Langue', lightMode: 'Mode clair', darkMode: 'Mode sombre', print: 'Imprimer', close: 'Fermer', info: 'Infos', download: 'Télécharger', page: 'page', pages: 'pages', by: 'par', basedOn: 'D’après', work: 'œuvre', scrollToRead: 'Faites défiler pour lire', untitledScreenplay: 'Scénario sans titre' },
  ar: { language: 'اللغة', lightMode: 'الوضع الفاتح', darkMode: 'الوضع الداكن', print: 'طباعة', close: 'إغلاق', info: 'معلومات', download: 'تنزيل', page: 'صفحة', pages: 'صفحات' },
  bn: { language: 'ভাষা', lightMode: 'লাইট মোড', darkMode: 'ডার্ক মোড', print: 'প্রিন্ট', close: 'বন্ধ', info: 'তথ্য', download: 'ডাউনলোড', page: 'পৃষ্ঠা', pages: 'পৃষ্ঠা' },
  pt: { language: 'Idioma', lightMode: 'Modo claro', darkMode: 'Modo escuro', print: 'Imprimir', close: 'Fechar', info: 'Info', download: 'Baixar', page: 'página', pages: 'páginas' },
  ru: { language: 'Язык', lightMode: 'Светлая тема', darkMode: 'Тёмная тема', print: 'Печать', close: 'Закрыть', info: 'Инфо', download: 'Скачать', page: 'страница', pages: 'страниц' },
  ur: { language: 'زبان', lightMode: 'لائٹ موڈ', darkMode: 'ڈارک موڈ', print: 'پرنٹ', close: 'بند کریں', info: 'معلومات', download: 'ڈاؤن لوڈ', page: 'صفحہ', pages: 'صفحات' },
  id: { language: 'Bahasa', lightMode: 'Mode terang', darkMode: 'Mode gelap', print: 'Cetak', close: 'Tutup', info: 'Info', download: 'Unduh', page: 'halaman', pages: 'halaman' },
  de: { language: 'Sprache', lightMode: 'Heller Modus', darkMode: 'Dunkler Modus', print: 'Drucken', close: 'Schließen', info: 'Info', download: 'Herunterladen', page: 'Seite', pages: 'Seiten' },
  ja: { language: '言語', lightMode: 'ライトモード', darkMode: 'ダークモード', print: '印刷', close: '閉じる', info: '情報', download: 'ダウンロード', page: 'ページ', pages: 'ページ' },
  sw: { language: 'Lugha', lightMode: 'Hali angavu', darkMode: 'Hali nyeusi', print: 'Chapisha', close: 'Funga', info: 'Taarifa', download: 'Pakua', page: 'ukurasa', pages: 'kurasa' },
  mr: { language: 'भाषा', lightMode: 'लाइट मोड', darkMode: 'डार्क मोड', print: 'प्रिंट', close: 'बंद करा', info: 'माहिती', download: 'डाउनलोड', page: 'पान', pages: 'पाने' },
  te: { language: 'భాష', lightMode: 'లైట్ మోడ్', darkMode: 'డార్క్ మోడ్', print: 'ప్రింట్', close: 'మూసివేయి', info: 'సమాచారం', download: 'డౌన్‌లోడ్', page: 'పేజీ', pages: 'పేజీలు' },
  tr: { language: 'Dil', lightMode: 'Açık mod', darkMode: 'Koyu mod', print: 'Yazdır', close: 'Kapat', info: 'Bilgi', download: 'İndir', page: 'sayfa', pages: 'sayfa' },
  ta: { language: 'மொழி', lightMode: 'ஒளி முறை', darkMode: 'இருள் முறை', print: 'அச்சிடு', close: 'மூடு', info: 'தகவல்', download: 'பதிவிறக்கு', page: 'பக்கம்', pages: 'பக்கங்கள்' },
  vi: { language: 'Ngôn ngữ', lightMode: 'Chế độ sáng', darkMode: 'Chế độ tối', print: 'In', close: 'Đóng', info: 'Thông tin', download: 'Tải xuống', page: 'trang', pages: 'trang' },
  ko: { language: '언어', lightMode: '라이트 모드', darkMode: '다크 모드', print: '인쇄', close: '닫기', info: '정보', download: '다운로드', page: '페이지', pages: '페이지' },
  fa: { language: 'زبان', lightMode: 'حالت روشن', darkMode: 'حالت تاریک', print: 'چاپ', close: 'بستن', info: 'اطلاعات', download: 'دانلود', page: 'صفحه', pages: 'صفحات' },
  it: { language: 'Lingua', lightMode: 'Modalità chiara', darkMode: 'Modalità scura', print: 'Stampa', close: 'Chiudi', info: 'Info', download: 'Scarica', page: 'pagina', pages: 'pagine' },
  pl: { language: 'Język', lightMode: 'Tryb jasny', darkMode: 'Tryb ciemny', print: 'Drukuj', close: 'Zamknij', info: 'Info', download: 'Pobierz', page: 'strona', pages: 'strony' },
  uk: { language: 'Мова', lightMode: 'Світлий режим', darkMode: 'Темний режим', print: 'Друк', close: 'Закрити', info: 'Інфо', download: 'Завантажити', page: 'сторінка', pages: 'сторінки' },
  nl: { language: 'Taal', lightMode: 'Lichte modus', darkMode: 'Donkere modus', print: 'Afdrukken', close: 'Sluiten', info: 'Info', download: 'Downloaden', page: 'pagina', pages: 'pagina’s' }
};

function baseLang(lang: Lang): string {
  return lang.toLowerCase().split(/[-_]/)[0] || lang.toLowerCase();
}

function regionFlag(lang: Lang): string | null {
  const region = lang.split(/[-_]/)[1]?.toUpperCase();
  return region ? REGION_FLAGS[region] ?? null : null;
}

function displayName(lang: Lang): string {
  try {
    return new Intl.DisplayNames([lang, 'en'], { type: 'language' }).of(lang) ?? lang;
  } catch {
    return lang;
  }
}

function addTextLanguages(set: Set<Lang>, text: Text | undefined) {
  if (!text) return;
  for (const key of Object.keys(text)) {
    if (key.trim()) set.add(key.trim());
  }
}

export function getLanguageOption(lang: Lang): LanguageOption {
  const base = baseLang(lang);
  const known = TOP_LANGUAGES[base];
  const hasRegion = /[-_]/.test(lang);
  return {
    code: lang,
    base,
    flag: regionFlag(lang) ?? known?.flag ?? '🌐',
    label: hasRegion ? displayName(lang) : known?.label ?? displayName(lang),
    nativeLabel: hasRegion ? displayName(lang) : known?.nativeLabel ?? lang.toUpperCase()
  };
}

export function getLanguageOptions(langs: Lang[]): LanguageOption[] {
  return langs.map(getLanguageOption);
}

export function getUiStrings(lang: Lang): UiStrings {
  const strings = UI_STRINGS[baseLang(lang)] ?? UI_STRINGS.en;
  return {
    ...strings,
    by: strings.by ?? UI_STRINGS.en.by ?? 'by',
    basedOn: strings.basedOn ?? UI_STRINGS.en.basedOn ?? 'Based on the',
    work: strings.work ?? UI_STRINGS.en.work ?? 'work',
    scrollToRead: strings.scrollToRead ?? UI_STRINGS.en.scrollToRead ?? 'Scroll to read',
    untitledScreenplay: strings.untitledScreenplay ?? UI_STRINGS.en.untitledScreenplay ?? 'Untitled Screenplay'
  };
}

export function collectDocumentLanguages(document: ScreenJSONDocument): Lang[] {
  const langs = new Set<Lang>();

  addTextLanguages(langs, document.title);
  addTextLanguages(langs, (document as unknown as { logline?: Text }).logline);

  for (const source of (document as unknown as { sources?: { title?: Text }[] }).sources ?? []) {
    addTextLanguages(langs, source.title);
  }

  for (const scene of document.document.scenes) {
    addTextLanguages(langs, scene.heading?.desc);
    for (const element of scene.body) {
      if ('text' in element) addTextLanguages(langs, element.text as Text | undefined);
      for (const note of element.notes ?? []) addTextLanguages(langs, note.text);
    }
  }

  if (document.lang) langs.add(document.lang);
  return Array.from(langs).sort((a, b) => {
    if (a === document.lang) return -1;
    if (b === document.lang) return 1;
    return getLanguageOption(a).label.localeCompare(getLanguageOption(b).label);
  });
}
