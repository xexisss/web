const FAVORITES_URL = 'http://localhost:3000/favorites';

function fetchAndRenderFavorites() {
    fetch(FAVORITES_URL)
        .then(res => {
            if (!res.ok) throw new Error("Нет доступа к серверу избранного");
            return res.json();
        })
        .then(data => {
            renderFavorites(data);
        })
        .catch(err => {
            document.getElementById('favorites-container').innerHTML =
                '<div style="color:red;">Ошибка: ' + err.message + '</div>';
        });
}

function renderFavorites(data) {
    const container = document.getElementById('favorites-container');
    container.innerHTML = '';
    if (!data.length) {
        container.innerHTML = `<div style="padding:2em;text-align:center;color:#297ac7;font-size:1.3em;">
      В избранном пока нет ни одной услуги.
    </div>`;
        return;
    }
    data.forEach(service => {
        const card = document.createElement('div');
        card.className = 'favorite-card';
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
      <button class="remove-fav" data-id="${service.id}">Удалить</button>
    `;
        container.appendChild(card);
    });
    document.querySelectorAll('.remove-fav').forEach(btn => {
        btn.onclick = function () {
            const id = btn.getAttribute('data-id');
            removeFavorite(id);
        };
    });
}

function removeFavorite(id) {
    fetch(`${FAVORITES_URL}/${id}`, {
            method: 'DELETE'
        })
        .then(res => {
            if (!res.ok) throw new Error("Ошибка при удалении");
            fetchAndRenderFavorites();
        })
        .catch(err => {
            alert('Ошибка удаления: ' + err.message);
        });
}

document.addEventListener('DOMContentLoaded', fetchAndRenderFavorites);