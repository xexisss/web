const lang_btn = document.getElementById('langToggle');

const saved = localStorage.getItem('lang') || 'en';
lang_btn.dataset.lang = saved;
lang_btn.textContent  = saved.toUpperCase();

lang_btn.addEventListener('click', () => {
    
    const current = lang_btn.dataset.lang;               
    const next    = current === 'en' ? 'ru' : 'en';


    lang_btn.dataset.lang = next;
    lang_btn.textContent  = next.toUpperCase();           

    I18n.load(next);                                 
    document.documentElement.lang = next;            
});

  