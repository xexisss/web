const USERS_URL = 'http://localhost:3000/users';

const phone = document.getElementById('phone');
const email = document.getElementById('email');
const birthdate = document.getElementById('birthdate');
const lastName = document.getElementById('lastName');
const firstName = document.getElementById('firstName');
const middleName = document.getElementById('middleName');
const passwordMode = document.getElementById('passwordMode');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const autoPassword = document.getElementById('autoPassword');
const registerBtn = document.getElementById('registerBtn');
const nickname = document.getElementById('nickname');
const agreement = document.getElementById('agreement');
const registerForm = document.getElementById('registerForm');
const genNickBtn = document.getElementById('genNickBtn');
const generatePasswordBtn = document.getElementById('generatePasswordBtn');
const registerSuccess = document.getElementById('register-success');

const phoneError = document.getElementById('phone-error');
const emailError = document.getElementById('email-error');
const birthdateError = document.getElementById('birthdate-error');
const lastNameError = document.getElementById('lastName-error');
const firstNameError = document.getElementById('firstName-error');
const passwordError = document.getElementById('password-error');
const confirmPasswordError = document.getElementById('confirmPassword-error');
const nicknameError = document.getElementById('nickname-error');
const agreementError = document.getElementById('agreement-error');

let failedNickAttempts = 0;
let topPasswords = [];  // сюда можно подгрузить 100 популярных паролей

function isPhoneValid(val) {
  return /^\+375(25|29|33|44)\d{7}$/.test(val.trim());
}
function isEmailValid(val) {
  return /^[a-z0-9._%+-]+@[a-z0-9-]+\.[a-z]{2,}$/i.test(val.trim());
}
function isBirthdateValid(val) {
  if (!val) return false;
  const date = new Date(val);
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 16);
  return date <= minDate;
}
function isPasswordStrong(val) {
  return (
    typeof val === "string" &&
    val.length >= 8 &&
    val.length <= 20 &&
    /[0-9]/.test(val) &&
    /[A-ZА-Я]/.test(val) &&
    /[a-zа-я]/.test(val) &&
    /[!@#$%^&*(),.?":{}|<>/\\~_\-=+;[\]]/.test(val) &&
    (!topPasswords.length || !topPasswords.some(pw => pw === val))
  );
}
function passwordsMatch() {
  return password.value === confirmPassword.value;
}

// -- Пароль
function generateStrongPassword() {
  let letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let digits = "0123456789";
  let specials = "!@#$%^&*()_+=-";
  let result =
    letters[Math.floor(Math.random() * 26)].toUpperCase() + 
    letters[Math.floor(Math.random() * 26)].toLowerCase() +
    digits[Math.floor(Math.random() * digits.length)] +
    specials[Math.floor(Math.random() * specials.length)];
  for (let i = 4; i < 10 + Math.floor(Math.random() * 7); i++) {
    let pool = letters + digits + specials;
    result += pool[Math.floor(Math.random() * pool.length)];
  }
  return result.split('').sort(() => 0.5 - Math.random()).join('');
}

function checkPasswordField() {
  if (passwordMode.value === "auto") return true;
  if (!password.value) {
    passwordError.textContent = "Введите пароль";
    return false;
  }
  if (!isPasswordStrong(password.value)) {
    passwordError.textContent = "Слабый пароль";
    return false;
  }
  if (topPasswords.length && topPasswords.includes(password.value)) {
    passwordError.textContent = "Пароль слишком распространён";
    return false;
  }
  passwordError.textContent = "";
  return true;
}

function checkConfirmPasswordField() {
  if (passwordMode.value === "auto") return true;
  if (!confirmPassword.value) {
    confirmPasswordError.textContent = "Повторите пароль";
    return false;
  }
  if (!passwordsMatch()) {
    confirmPasswordError.textContent = "Пароли не совпадают";
    return false;
  }
  confirmPasswordError.textContent = "";
  return true;
}

// -- Никнейм
function genNickname() {
  let fn = firstName.value.trim();
  let ln = lastName.value.trim();
  if (!fn || !ln) return '';
  let n1 = fn[0].toUpperCase() + fn.slice(1, Math.min(3, fn.length));
  let n2 = ln[0].toUpperCase() + ln.slice(1, Math.min(3, ln.length));
  let num = Math.floor(Math.random() * 990) + 10;
  let suffixes = ['_by', '_rx', '', '', '', '_doc', '_med', '_pro', '_sx'];
  let suff = suffixes[Math.floor(Math.random() * suffixes.length)];
  return n1 + n2 + num + suff;
}

function setAutoNickname() {
  let attempts = 0;
  function tryNick() {
    const nn = genNickname();
    if (!nn) return;
    fetch(`${USERS_URL}?nickname=${encodeURIComponent(nn)}`)
      .then(res => res.json())
      .then(arr => {
        if (arr.length === 0) {
          nickname.value = nn;
          nickname.readOnly = true;
          nicknameError.textContent = "";
        } else {
          attempts++;
          if (attempts < 5) {
            tryNick();
          } else {
            failedNickAttempts++;
            nickname.value = "";
            nickname.readOnly = false;
            nicknameError.textContent = "Вы можете задать собственный уникальный никнейм";
          }
        }
      });
  }
  tryNick();
}

// -- Валидация формы
function validateForm() {
  let valid = true;
  // Телефон
  if (!isPhoneValid(phone.value)) {
    phoneError.textContent = "Введите корректный номер РБ (+375XXXXXXXXX)";
    valid = false;
  } else {
    phoneError.textContent = "";
  }
  // Email
  if (!isEmailValid(email.value)) {
    emailError.textContent = "Некорректный email";
    valid = false;
  } else {
    emailError.textContent = "";
  }
  // Дата рождения
  if (!isBirthdateValid(birthdate.value)) {
    birthdateError.textContent = "Регистрация только с 16 лет";
    valid = false;
  } else {
    birthdateError.textContent = "";
  }
  // Фамилия, имя
  if (!lastName.value.trim()) {
    lastNameError.textContent = "Заполните поле";
    valid = false;
  } else {
    lastNameError.textContent = "";
  }
  if (!firstName.value.trim()) {
    firstNameError.textContent = "Заполните поле";
    valid = false;
  } else {
    firstNameError.textContent = "";
  }
  // Пароль
  valid = checkPasswordField() && valid;
  valid = checkConfirmPasswordField() && valid;
  // Никнейм
  if (!nickname.value.trim()) {
    nicknameError.textContent = "Никнейм обязателен";
    valid = false;
  } else {
    // Проверка уникальности никнейма (асинхронно повторится в send)
    nicknameError.textContent = "";
  }
  // Соглашение
  if (!agreement.checked) {
    agreementError.textContent = "Примите условия соглашения";
    valid = false;
  } else {
    agreementError.textContent = "";
  }
  // Активация кнопки
  registerBtn.disabled = !valid;
  return valid;
}

function listenFields() {
  [phone, email, birthdate, lastName, firstName, middleName, password, confirmPassword, nickname, agreement].forEach(el => {
    el.oninput = () => {
      validateForm();
      registerSuccess.textContent = '';
    };
    el.onchange = () => {
      validateForm();
    };
  });
  passwordMode.onchange = () => {
    let self = passwordMode.value === "self";
    document.getElementById('manualPassword-group').style.display = self ? "" : "none";
    document.getElementById('confirmPassword-group').style.display = self ? "" : "none";
    document.getElementById('autoPassword-group').style.display = self ? "none" : "";
    if (!self) {
      autoPassword.value = generateStrongPassword();
    }
    validateForm();
  };
  generatePasswordBtn.onclick = () => {
    autoPassword.value = generateStrongPassword();
    validateForm();
  };
  genNickBtn.onclick = () => setAutoNickname();
  [firstName, lastName].forEach(el => el.oninput = () => {
    if (nickname.readOnly) setAutoNickname();
  });
}

// -- Отправка формы
registerForm.onsubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  // Проверим никнейм ещё раз
  fetch(`${USERS_URL}?nickname=${encodeURIComponent(nickname.value)}`)
    .then(res => res.json())
    .then(arr => {
      if (arr.length > 0) {
        nicknameError.textContent = "Такой никнейм уже занят";
        return;
      }
      nicknameError.textContent = "";

      // Пароль
      let pw = passwordMode.value === "self" ? password.value : autoPassword.value;

      // Сборка пользователя
      const user = {
        phone: phone.value,
        email: email.value,
        birthdate: birthdate.value,
        role: "покупатель",
        fio: {
          first: firstName.value,
          last: lastName.value,
          middle: middleName.value
        },
        nickname: nickname.value,
        password: pw,
        agreementAccepted: agreement.checked
      };

      fetch(USERS_URL, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      }).then(() => {
        registerSuccess.textContent = "Регистрация успешно завершена!";
        registerForm.reset();
        nickname.value = '';
        setAutoNickname();
        registerBtn.disabled = true;
      });
    });
};

// -- При первой загрузке
document.addEventListener('DOMContentLoaded', () => {
  setAutoNickname();
  listenFields();
  passwordMode.dispatchEvent(new Event('change'));
  // (Для боевых систем topPasswords подгружается из файла здесь)
});
