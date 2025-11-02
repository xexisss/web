const SERVICES_URL = 'http://localhost:3000/services';
const ORDERS_URL = 'http://localhost:3000/orders';
const FEEDBACK_URL = 'http://localhost:3000/feedback';
const USERS_URL = 'http://localhost:3000/users';

const MIN_FEEDBACK_LEN = 20;

const currentUser = (() => {
  try {
    return JSON.parse(sessionStorage.getItem('currentUser'));
  } catch {
    return null;
  }
})();

const form = document.getElementById('feedbackForm');
const serviceSelect = document.getElementById('serviceSelect');
const ratingSelect = document.getElementById('ratingSelect');
const feedbackText = document.getElementById('feedbackText');
const feedbackBtn = document.getElementById('feedbackBtn');
const feedbackSuccess = document.getElementById('feedback-success');
const productReviews = document.getElementById('product-reviews');

const serviceError = document.getElementById('service-error');
const ratingError = document.getElementById('rating-error');
const feedbackTextError = document.getElementById('feedbackText-error');

async function loadServices() {
  if (!currentUser) {
    serviceSelect.innerHTML = `<option value="">Войдите в аккаунт для оставления отзыва</option>`;
    feedbackBtn.disabled = true;
    return;
  }
  if (currentUser.role === "администратор") {
    serviceSelect.innerHTML = `<option value="">Администратор не может оставлять отзывы</option>`;
    feedbackBtn.disabled = true;
    return;
  }
  const resp = await fetch(`${ORDERS_URL}?userId=${currentUser.id}`);
  if (!resp.ok) return;
  const orders = await resp.json();
  const boughtIds = [...new Set([].concat(...orders.map(order =>
    (order.items || []).map(item => item.serviceId)
  )))];
  if (boughtIds.length === 0) {
    serviceSelect.innerHTML = `<option value="">Нет купленных товаров</option>`;
    feedbackBtn.disabled = true;
    return;
  }

  const resp2 = await fetch(`${SERVICES_URL}`);
  const allServices = await resp2.json();
  const owned = allServices.filter(svc => boughtIds.includes(svc.id));
  serviceSelect.innerHTML = `<option value="">-- не выбрано --</option>` +
    owned.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  feedbackBtn.disabled = false;
}

function loadReviews(serviceId) {
  if (!serviceId) {
    productReviews.innerHTML = "";
    return;
  }
  fetch(`${FEEDBACK_URL}?serviceId=${serviceId}`)
    .then(res => res.json())
    .then(feeds => {
      if (!feeds.length) {
        productReviews.innerHTML = '<div class="review">Нет отзывов по данной услуге</div>';
        return;
      }
      return Promise.all(feeds.map(feed =>
        fetch(`${USERS_URL}/${feed.userId}`)
        .then(res => res.json())
        .then(user => ({
          feed,
          author: user.nickname || "Пользователь"
        }))
      )).then(arrs => {
        productReviews.innerHTML = arrs.map(({
          feed,
          author
        }) => {
          return `<div class="review">
            <div class="stars">${'★'.repeat(feed.rating)}${'☆'.repeat(5-feed.rating)}</div>
            <div class="author">${author}
              <span class="date">${feed.date ? new Date(feed.date).toLocaleDateString() : ''}</span>
            </div>
            <div>${feed.text}</div>
          </div>`;
        }).join('');
      });
    });
}

function validateForm() {
  let valid = true;
  if (!serviceSelect.value) {
    serviceError.textContent = "Выберите товар";
    valid = false;
  } else {
    serviceError.textContent = "";
  }
  if (!ratingSelect.value) {
    ratingError.textContent = "Введите оценку";
    valid = false;
  } else {
    ratingError.textContent = "";
  }
  if (!feedbackText.value.trim() || feedbackText.value.trim().length < MIN_FEEDBACK_LEN) {
    feedbackTextError.textContent = `Минимум ${MIN_FEEDBACK_LEN} символов`;
    valid = false;
  } else {
    feedbackTextError.textContent = "";
  }
  feedbackBtn.disabled = !valid;
  return valid;
}

form.oninput = validateForm;
serviceSelect.onchange = () => {
  loadReviews(serviceSelect.value);
  validateForm();
};

form.onsubmit = function (e) {
  e.preventDefault();
  if (!validateForm() || !currentUser) return;
  if (currentUser.role === "администратор") {
    feedbackSuccess.textContent = "Администратор не может оставлять отзывы";
    return;
  }

  fetch(`${FEEDBACK_URL}?userId=${currentUser.id}&serviceId=${serviceSelect.value}`)
    .then(res => res.json())
    .then(arr => {
      if (arr.length) {
        feedbackSuccess.textContent = "Вы уже оставляли отзыв по этой услуге!";
      } else {
        fetch(FEEDBACK_URL, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: currentUser.id,
            serviceId: Number(serviceSelect.value),
            rating: Number(ratingSelect.value),
            text: feedbackText.value.trim(),
            date: new Date().toISOString()
          })
        }).then(() => {
          feedbackText.value = '';
          ratingSelect.value = '';
          feedbackSuccess.textContent = "Отзыв успешно отправлен!";
          loadReviews(serviceSelect.value);
          validateForm();
          setTimeout(() => feedbackSuccess.textContent = '', 2500);
        });
      }
    });
};

document.addEventListener('DOMContentLoaded', () => {
  loadServices();
  validateForm();
  loadReviews(serviceSelect.value);
});