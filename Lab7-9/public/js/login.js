const USERS_URL = 'http://localhost:3000/users';

const loginInput = document.getElementById('login');
const passwordInput = document.getElementById('login-password');
const loginBtn = document.getElementById('loginBtn');

const loginError = document.getElementById('login-error');
const passwordError = document.getElementById('login-password-error');
const loginSuccess = document.getElementById('login-success');

function isLoginValid(val) {
  return (
    /^\+375(25|29|33|44)\d{7}$/.test(val.trim()) ||
    /^[a-z0-9._%+-]+@[a-z0-9-]+\.[a-z]{2,}$/i.test(val.trim())
  );
}

function isPasswordValid(val) {
  return val && val.length >= 8;
}

function validateLoginForm() {
  let valid = true;
  if (!isLoginValid(loginInput.value)) {
    loginError.textContent = "Введи корректный email или телефон РБ";
    valid = false;
  } else {
    loginError.textContent = "";
  }
  if (!isPasswordValid(passwordInput.value)) {
    passwordError.textContent = "Некорректный пароль";
    valid = false;
  } else {
    passwordError.textContent = "";
  }
  loginBtn.disabled = !valid;
  return valid;
}

loginInput.addEventListener('input', validateLoginForm);
passwordInput.addEventListener('input', validateLoginForm);

document.getElementById('loginForm').onsubmit = function (e) {
  e.preventDefault();
  if (!validateLoginForm()) return;

  const val = loginInput.value.trim();
  const pw = passwordInput.value;

  fetch(`${USERS_URL}?email=${encodeURIComponent(val)}`)
    .then(res => res.json())
    .then(usersByEmail => {
      if (usersByEmail.length) return usersByEmail[0];
      return fetch(`${USERS_URL}?phone=${encodeURIComponent(val)}`)
        .then(res2 => res2.json())
        .then(usersByPhone => usersByPhone.length ? usersByPhone[0] : null);
    })
    .then(user => {
      if (!user) {
        loginError.textContent = "Пользователь не найден";
        loginSuccess.textContent = "";
        return;
      }
      if (user.password !== pw) {
        passwordError.textContent = "Пароль неверен";
        loginSuccess.textContent = "";
        return;
      }
      loginError.textContent = "";
      passwordError.textContent = "";

      sessionStorage.setItem('currentUser', JSON.stringify(user));
      loginSuccess.textContent = "Вход выполнен успешно!";
    });
};