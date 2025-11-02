const SERVICES_URL = 'http://localhost:3000/services';
const FEEDBACK_URL = 'http://localhost:3000/feedback';
const USERS_URL = 'http://localhost:3000/users';

const currentUser = (() => {
    try {
        return JSON.parse(sessionStorage.getItem('currentUser'));
    } catch {
        return null;
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser || currentUser.role !== 'администратор') {
        document.getElementById('not-admin').style.display = "";
        document.getElementById('admin-content').style.display = "none";
        return;
    }
    document.getElementById('admin-content').style.display = "";
    renderServices();
    initServiceForm();
    updateReviewFilters();
});

function renderServices() {
    fetch(SERVICES_URL)
        .then(res => res.json())
        .then(data => {
            const table = document.getElementById('services-table');
            table.innerHTML = `<tr>
        <th>ID</th><th>Название</th><th>Описание</th><th>Город</th><th>Цена</th>
        <th>Рейтинг</th><th>Пациентов</th><th>Категория</th><th></th>
      </tr>` +
                data.map(s => `<tr>
        <td>${s.id}</td>
        <td>${s.name}</td>
        <td>${s.description}</td>
        <td>${s.location}</td>
        <td>${s.price}</td>
        <td>${s.rating}</td>
        <td>${s.patients}</td>
        <td>${s.category}</td>
        <td>
          <button class="action-btn edit" data-id="${s.id}">✎</button>
          <button class="action-btn delete" data-id="${s.id}">🗑</button>
        </td>
      </tr>`).join('');
            // CRUD обработка
            table.querySelectorAll('.edit').forEach(btn =>
                btn.onclick = () => loadServiceForEdit(btn.dataset.id)
            );
            table.querySelectorAll('.delete').forEach(btn =>
                btn.onclick = () => deleteService(btn.dataset.id)
            );
            updateReviewFilters();
        });
}

function initServiceForm() {
    const form = document.getElementById('serviceForm');
    const saveBtn = document.getElementById('save-serv-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const errBox = document.getElementById('service-err');

    form.oninput = () => {
        let valid = true;
        ['serv-name', 'serv-description', 'serv-image', 'serv-location', 'serv-rating', 'serv-patients', 'serv-price', 'serv-category'].forEach(id => {
            if (!document.getElementById(id).value.trim()) valid = false;
        });
        saveBtn.disabled = !valid;
        errBox.textContent = '';
    };

    form.onsubmit = e => {
        e.preventDefault();
        const service = {
            name: document.getElementById('serv-name').value,
            description: document.getElementById('serv-description').value,
            image: document.getElementById('serv-image').value,
            location: document.getElementById('serv-location').value,
            rating: parseFloat(document.getElementById('serv-rating').value),
            patients: parseInt(document.getElementById('serv-patients').value),
            price: parseInt(document.getElementById('serv-price').value),
            category: document.getElementById('serv-category').value
        };
        const serviceId = document.getElementById('service-id').value;

        if (serviceId) {
            fetch(`${SERVICES_URL}/${serviceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...service,
                    id: Number(serviceId)
                })
            }).then(() => {
                resetForm();
                renderServices();
            });
        } else {
            fetch(SERVICES_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(service)
            }).then(() => {
                resetForm();
                renderServices();
            });
        }
    };

    cancelBtn.onclick = resetForm;

    function resetForm() {
        form.reset();
        document.getElementById('service-id').value = '';
        saveBtn.textContent = "Добавить / Сохранить";
        cancelBtn.style.display = "none";
        saveBtn.disabled = true;
        errBox.textContent = '';
    }
}

function loadServiceForEdit(id) {
    fetch(`${SERVICES_URL}/${id}`)
        .then(res => res.json())
        .then(s => {
            document.getElementById('service-id').value = s.id;
            document.getElementById('serv-name').value = s.name;
            document.getElementById('serv-description').value = s.description;
            document.getElementById('serv-image').value = s.image;
            document.getElementById('serv-location').value = s.location;
            document.getElementById('serv-rating').value = s.rating;
            document.getElementById('serv-patients').value = s.patients;
            document.getElementById('serv-price').value = s.price;
            document.getElementById('serv-category').value = s.category;
            document.getElementById('save-serv-btn').textContent = "Сохранить изменения";
            document.getElementById('cancel-edit-btn').style.display = "";
            document.getElementById('save-serv-btn').disabled = false;
        });
}

function deleteService(id) {
    if (!confirm("Удалить услугу?")) return;
    fetch(`${SERVICES_URL}/${id}`, {
            method: 'DELETE'
        })
        .then(() => renderServices());
}

function updateReviewFilters() {
    fetch(SERVICES_URL)
        .then(res => res.json())
        .then(services => {
            const sel = document.getElementById('filter-service-reviews');
            sel.innerHTML = `<option value="">Выбрать услугу</option>` +
                services.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            sel.onchange = () => renderServiceReviews(sel.value);

            fetch(USERS_URL).then(res => res.json()).then(users => {
                const usel = document.getElementById('filter-user-reviews');
                usel.innerHTML = `<option value="">Выбрать пользователя</option>` +
                    users.map(u => `<option value="${u.id}">${u.nickname}</option>`).join('');
                usel.onchange = () => renderUserReviews(usel.value);
            });
        });
}

function renderServiceReviews(serviceId) {
    const table = document.getElementById('reviews-table');
    if (!serviceId) return table.innerHTML = '';
    fetch(`${FEEDBACK_URL}?serviceId=${serviceId}`)
        .then(res => res.json())
        .then(arr => {
            table.innerHTML = arr.length ?
                `<tr><th>id</th><th>nick</th><th>Текст</th><th>Оценка</th><th>Дата</th><th></th></tr>` +
                arr.map(f =>
                    `<tr>
              <td>${f.id}</td>
              <td data-userid="${f.userId}"></td>
              <td>${f.text}</td>
              <td>${f.rating}</td>
              <td>${f.date ? new Date(f.date).toLocaleString() : ""}</td>
              <td><button class="action-btn delete" onclick="deleteFeedback(${f.id})">🗑</button></td>
            </tr>`).join('') :
                "<tr><td colspan='6'><i>Нет отзывов</i></td></tr>";
            fillNicks(table);
        });
}

function renderUserReviews(userId) {
    const table = document.getElementById('user-reviews-table');
    if (!userId) return table.innerHTML = '';
    fetch(`${FEEDBACK_URL}?userId=${userId}`)
        .then(res => res.json())
        .then(arr => {
            table.innerHTML = arr.length ?
                `<tr><th>id</th><th>услуга</th><th>Текст</th><th>Оценка</th><th>Дата</th><th></th></tr>` +
                arr.map(f =>
                    `<tr>
              <td>${f.id}</td>
              <td data-servid="${f.serviceId}"></td>
              <td>${f.text}</td>
              <td>${f.rating}</td>
              <td>${f.date ? new Date(f.date).toLocaleString() : ""}</td>
              <td><button class="action-btn delete" onclick="deleteFeedback(${f.id})">🗑</button></td>
            </tr>`).join('') :
                "<tr><td colspan='6'><i>Нет отзывов</i></td></tr>";
            fillServices(table);
        });
}
window.deleteFeedback = function (id) {
    if (!confirm("Удалить отзыв?")) return;
    fetch(`${FEEDBACK_URL}/${id}`, {
            method: 'DELETE'
        })
        .then(() => {
            updateReviewFilters();
            document.getElementById('reviews-table').innerHTML = '';
            document.getElementById('user-reviews-table').innerHTML = '';
        });
};

function fillNicks(table) {
    table.querySelectorAll('td[data-userid]').forEach(td => {
        fetch(`${USERS_URL}/${td.dataset.userid}`)
            .then(res => res.json())
            .then(u => td.textContent = u.nickname || "");
    });
}

function fillServices(table) {
    table.querySelectorAll('td[data-servid]').forEach(td => {
        fetch(`${SERVICES_URL}/${td.dataset.servid}`)
            .then(res => res.json())
            .then(s => td.textContent = s.name || "");
    });
}