const I18n = {
    defaultLocale: 'en',
    locale: '',
    messages: {},
  
    // Загрузка словаря переводов
    async load(locale) {
      // fallback на defaultLocale, если locale не задан
      const loc = locale || this.defaultLocale;
      this.locale = loc;
  
      try {
        const res = await fetch(`locales/${loc}.json`);
  
        // Если перевод не найден, пытаемся загрузить defaultLocale
        if (!res.ok) {
          console.warn(`Перевод для "${loc}" не найден, загружаем "${this.defaultLocale}"`);
          if (loc !== this.defaultLocale) {
            return this.load(this.defaultLocale);
          }
          return;
        }
  
        this.messages = await res.json();
        this.apply();
        localStorage.setItem('lang', loc);
      } catch (err) {
        console.error('Ошибка при загрузке переводов:', err);
      }
    },
  
    // Получить перевод по ключу и подставить переменные {{var}}
    t(path, vars = {}) {
      const keys = path.split('.');
      let text = keys.reduce((o, k) => (o && o[k] != null ? o[k] : null), this.messages);
  
      if (typeof text !== 'string') {
        console.warn(`Не найден ключ перевода: "${path}"`);
        text = path;
      }
  
      return text.replace(/{{\s*(\w+)\s*}}/g, (_, v) => vars[v] || '');
    },
  
    // Применить переводы ко всем элементам с data-i18n
    apply() {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = this.t(key, el.dataset);
  
        if (el.hasAttribute('placeholder')) {
          el.placeholder = translated;
        } else if (el.tagName.toLowerCase() === 'title') {
          document.title = translated;
        } else {
          el.textContent = translated;
        }
      });
    }
  };
  
  // Инициализация на старте страницы
  document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('lang');
    const htmlLang = document.documentElement.lang;
    I18n.load(savedLang || htmlLang);
  });