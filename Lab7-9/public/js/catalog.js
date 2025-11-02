const API_URL = 'http://localhost:3000/services';
const CART_URL = 'http://localhost:3000/cart';
const FAVORITES_URL = 'http://localhost:3000/favorites';

let state = {
    search: '',
    sort: '',
    order: 'asc',
    category: '',
    minPrice: '',
    maxPrice: '',
    page: 1,
    limit: 6
};

let allCategories = new Set();

function buildUrl() {
    const params = [];
    if (state.search) params.push(`q=${encodeURIComponent(state.search)}`);
    if (state.sort) params.push(`_sort=${state.sort}&_order=${state.order}`);
    if (state.category) params.push(`category=${encodeURIComponent(state.category)}`);
    if (state.minPrice) params.push(`price_gte=${state.minPrice}`);
    if (state.maxPrice) params.push(`price_lte=${state.maxPrice}`);
    params.push(`_page=${state.page}`);
    params.push(`_limit=${state.limit}`);
    return `${API_URL}?${params.join('&')}`;
}

function fetchCategories() {
    fetch(`${API_URL}`)
        .then(res => res.json())
        .then(data => {
            allCategories = new Set(data.map(s => s.category));
            renderCategories();
        });
}

function renderCategories() {
    const catDiv = document.getElementById('categoryList');
    catDiv.innerHTML = '';
    allCategories.forEach(cat => {
        const id = 'cat_' + cat.replace(/\s/g, '');
        catDiv.innerHTML += `
      <label>
        <input type="radio" name="category" class="categoryRadio" value="${cat}" id="${id}"
            ${state.category === cat ? 'checked' : ''}>
        ${cat}
      </label>
    `;
    });
    catDiv.innerHTML += `
      <label>
        <input type="radio" name="category" class="categoryRadio" value="" ${!state.category ? 'checked' : ''}>
        Все категории
      </label>
  `;
    document.querySelectorAll('.categoryRadio').forEach(cb => cb.addEventListener('change', e => {
        state.category = e.target.value;
        state.page = 1;
        fetchAndRender();
    }));
}

function fetchAndRender() {
    fetch(buildUrl())
        .then(res => {
            const total = res.headers.get('X-Total-Count');
            return res.json().then(data => ({
                data,
                total
            }));
        })
        .then(({
            data,
            total
        }) => {
            renderCatalog(data);
            renderPagination(Number(total) || 0);
        });
}

function renderCatalog(data) {
    const container = document.getElementById('catalog-container');
    container.innerHTML = '';
    if (!data.length) {
        container.innerHTML = `<div style="padding:2em;text-align:center;color:#297ac7;font-size:1.3em;">
        Товары по заданным критериям не найдены.
      </div>`;
        return;
    }
    data.forEach(service => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
        <img src="${service.image}" alt="${service.name}" class="service-img">
        <h3>${service.name}</h3>
        <p>${service.description}</p>
        <p class="service-extra"><b>Локация:</b> ${service.location}</p>
        <p>
          <span class="service-extra"><b>Рейтинг:</b> ${service.rating} ⭐</span>
          <span class="service-extra"><b>Пациентов:</b> ${service.patients}</span>
        </p>
        <p class="service-extra"><b>Цена:</b> ${service.price} руб.</p>
        <p class="service-extra"><b>Категория:</b> ${service.category}</p>
        <div class="card-actions">
          <button onclick="addToFavorites(${service.id})">★</button>
          <button onclick="addToCart(${service.id})">В корзину</button>
          <button class="details-btn" data-id="${service.id}">Подробнее</button>
        </div>
      `;
        container.appendChild(card);
    });

    container.querySelectorAll('.details-btn').forEach(btn => {
        btn.onclick = () => {
            showDetailsModal(Number(btn.getAttribute('data-id')));
        };
    });
}


function renderPagination(total) {
    const pagDiv = document.getElementById('pagination');
    pagDiv.innerHTML = '';
    const pages = Math.ceil(total / state.limit);
    if (pages <= 1) return;
    for (let i = 1; i <= pages; ++i) {
        let btn = document.createElement('button');
        btn.textContent = i;
        if (i === state.page) btn.classList.add('active');
        btn.onclick = () => {
            state.page = i;
            fetchAndRender();
        };
        pagDiv.appendChild(btn);
    }
}

window.addToFavorites = function (id) {
    fetch(`${API_URL}/${id}`)
        .then(res => res.json())
        .then(item => {
            fetch(`${FAVORITES_URL}?id=${item.id}`)
                .then(res => res.json())
                .then(favs => {
                    if (!favs.length) {
                        fetch(FAVORITES_URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(item)
                        });
                    }
                });
        });
    notify('Товар добавлен в избранное');
};
window.addToCart = function (id) {
    fetch(`${API_URL}/${id}`)
        .then(res => res.json())
        .then(item => {
            fetch(`${CART_URL}?id=${item.id}`)
                .then(res => res.json())
                .then(items => {
                    if (!items.length) {
                        fetch(CART_URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                ...item,
                                count: 1
                            })
                        });
                    }
                });
        });
    notify('Товар добавлен в корзину');
};

document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();

    document.getElementById('searchBox').addEventListener('input', e => {
        state.search = e.target.value;
        state.page = 1;
        fetchAndRender();
    });
    document.getElementById('sortSelect').addEventListener('change', e => {
        state.sort = e.target.value;
        state.page = 1;
        fetchAndRender();
    });

    document.getElementById('priceMin').addEventListener('input', e => {
        state.minPrice = e.target.value;
        state.page = 1;
        fetchAndRender();
    });
    document.getElementById('priceMax').addEventListener('input', e => {
        state.maxPrice = e.target.value;
        state.page = 1;
        fetchAndRender();
    });

    fetchAndRender();
});

function showModal(html = '', options = {}) {
    const modal = document.getElementById('modal-bg');
    const modalContent = document.getElementById('modal-content');
    let title = options.title ? `<h3 style="margin-top:0;">${options.title}</h3>` : '';
    modalContent.innerHTML = title + html;
    modal.classList.add('open');
    document.body.classList.add('modal-open');
    modal.onclick = (e) => {
        if (e.target === modal) closeModal(options.onClose);
    };
    document.getElementById('modal-close-btn').onclick = () => closeModal(options.onClose);
    document.addEventListener('keydown', escListener);

    function escListener(evt) {
        if (evt.key === "Escape") closeModal(options.onClose);
    }
    closeModal.escListener = escListener;
}

function closeModal(onClose) {
    const modal = document.getElementById('modal-bg');
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', closeModal.escListener);
    if (typeof onClose === 'function') onClose();
}

function showDetailsModal(id) {
    fetch(`http://localhost:3000/services/${id}`)
        .then(res => res.json())
        .then(service => {
            showModal(`
          <img src="${service.image}" style="max-width:230px; border-radius:11px; margin-bottom:1em;"><br>
          <b style="font-size:1.25em;">${service.name}</b><br>
          <div style="margin: 0.45em 0 0.9em;color:#2772b7;">
            <b>Категория:</b> ${service.category} <br>
            <b>Локация:</b> ${service.location} <br>
            <b>Пациентов:</b> ${service.patients} <br>
            <b>Рейтинг:</b> ${service.rating} ★ <br>
          </div>
          <div style="margin:1em 0;font-size:1.08em;">${service.description}</div>
          <div style="margin-top:1.2em;color:#255c77;"><b>Цена:</b> ${service.price} руб.</div>
        `, {
                title: "Детальная информация"
            });
        });
}

function notify(msg, type = 'success') {
    const box = document.getElementById('notif-box');
    const div = document.createElement('div');
    div.className = 'notif' + (type === 'error' ? ' error' : '');
    div.innerText = msg;
    box.appendChild(div);
    setTimeout(() => {
      div.style.opacity = 0.08;
      setTimeout(() => div.remove(), 340);
    }, 2200);
  }
  