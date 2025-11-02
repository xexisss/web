const CART_URL = 'http://localhost:3000/cart';
const ORDERS_URL = 'http://localhost:3000/orders';

function getCurrentUserId() {
  return 1;
}

function fetchAndRenderCart() {
  fetch(CART_URL)
    .then(res => res.json())
    .then(data => {
      renderCart(data);
      renderSummary(data);
    });
}

function renderCart(data) {
  const container = document.getElementById('cart-container');
  document.getElementById('checkout-btn').style.display = data.length ? 'block' : 'none';
  container.innerHTML = '';
  if (!data.length) {
    container.innerHTML = `<div style="padding:2em;text-align:center;color:#297ac7;font-size:1.3em;">
      Корзина пуста.
    </div>`;
    return;
  }
  data.forEach(service => {
    const card = document.createElement('div');
    card.className = 'cart-card';
    card.innerHTML = `
      <img src="${service.image}" alt="${service.name}" class="service-img">
      <h3>${service.name}</h3>
      <p>${service.description || ''}</p>
      <p class="service-extra"><b>Локация:</b> ${service.location || '-'}</p>
      <p>
        <span class="service-extra"><b>Рейтинг:</b> ${service.rating || '-'} ⭐</span>
        <span class="service-extra"><b>Пациентов:</b> ${service.patients || '-'}</span>
      </p>
      <p class="service-extra"><b>Цена:</b> ${service.price || '-'} руб.</p>
      <p class="service-extra"><b>Категория:</b> ${service.category || '-'}</p>
      <div class="count-block">
        <button class="count-btn" data-action="dec" data-id="${service.id}">−</button>
        <input type="number" min="1" class="count-input" data-id="${service.id}" value="${service.count || 1}">
        <button class="count-btn" data-action="inc" data-id="${service.id}">+</button>
      </div>
      <button class="remove-cart" data-id="${service.id}">Удалить</button>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll('.count-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      const input = document.querySelector(`.count-input[data-id="${id}"]`);
      let count = parseInt(input.value, 10) || 1;
      if (action === "inc") count += 1;
      if (action === "dec" && count > 1) count -= 1;
      updateCount(id, count);
    };
  });
  document.querySelectorAll('.count-input').forEach(inp => {
    inp.onchange = () => {
      let val = parseInt(inp.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      updateCount(inp.getAttribute('data-id'), val);
    };
  });

  document.querySelectorAll('.remove-cart').forEach(btn => {
    btn.onclick = () => removeCart(btn.getAttribute('data-id'));
  });
}

function updateCount(id, count) {
  fetch(`${CART_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      count
    })
  }).then(fetchAndRenderCart);
}

function removeCart(id) {
  fetch(`${CART_URL}/${id}`, {
    method: 'DELETE'
  }).then(fetchAndRenderCart);
}

function renderSummary(data) {
  const summaryDiv = document.getElementById('cart-summary');
  if (!data.length) {
    summaryDiv.textContent = '';
    return;
  }
  const total = data.reduce((sum, item) => sum + (item.price || 0) * (item.count || 1), 0);
  summaryDiv.innerHTML = `<b>Общая стоимость:</b> ${total} руб.`;
}

document.getElementById('checkout-btn').onclick = function () {
  fetch(CART_URL)
    .then(res => res.json())
    .then(cartData => {
      if (!cartData.length) return;

      const userId = getCurrentUserId();
      const orderItems = cartData.map(item => ({
        serviceId: item.id,
        name: item.name,
        count: item.count || 1,
        price: item.price
      }));
      const total = orderItems.reduce((sum, item) => sum + item.price * item.count, 0);
      const order = {
        userId: userId,
        orderDate: new Date().toISOString(),
        items: orderItems,
        total: total
      };

      fetch(ORDERS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
      }).then(() => {
        Promise.all(
          cartData.map(item =>
            fetch(`${CART_URL}/${item.id}`, {
              method: 'DELETE'
            })
          )
        ).then(() => {
          fetchAndRenderCart();
          document.getElementById('purchase-message').textContent = 'Покупка успешно оформлена!';
          setTimeout(() => {
            document.getElementById('purchase-message').textContent = '';
          }, 3000);
        });
      });
    });
};

document.addEventListener('DOMContentLoaded', fetchAndRenderCart);