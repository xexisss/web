window.addEventListener('load', () => {
    document.getElementById('preloader').style.opacity = 0;
    setTimeout(() => document.getElementById('preloader').remove(), 600);
});