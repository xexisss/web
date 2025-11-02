const burgerBtn = document.getElementById('burger-btn');
const menu = document.getElementById('sidebar-menu');
const overlay = document.getElementById('burger-overlay');

function openMenu() {
    menu.classList.add('open');
    burgerBtn.classList.add('active');
    overlay.classList.add('active');
    document.body.classList.add('menu-open');
}

function closeMenu() {
    menu.classList.remove('open');
    burgerBtn.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('menu-open');
}
burgerBtn.onclick = () => menu.classList.contains('open') ? closeMenu() : openMenu();
overlay.onclick = closeMenu;
menu.querySelectorAll('a').forEach(a => a.onclick = closeMenu);