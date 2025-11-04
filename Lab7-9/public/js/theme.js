const themeBtn = document.getElementById('theme-toggle');
function applyTheme(dark) {
  document.body.classList.toggle('dark-theme', dark);
  themeBtn.textContent = dark ? "☀️" : "🌙";
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}
themeBtn.onclick = () => {
  const dark = !document.body.classList.contains('dark-theme');
  applyTheme(dark);
};
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(localStorage.getItem('theme') === 'dark');
});
