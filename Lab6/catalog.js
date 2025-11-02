const servicesCatalog = [{
    name: "Терапевт",
    description: "Общая диагностика и лечение заболеваний.",
    image: "img/therapist.jpg",
    location: "Москва",
    rating: 4.8,
    patients: 1200,
    price: 2500,
    category: "Взрослый врач"
  },
  {
    name: "Педиатр",
    description: "Лечение всех видов детских болезней.",
    image: "img/pediatrician.jpg",
    location: "Санкт-Петербург",
    rating: 4.9,
    patients: 950,
    price: 2000,
    category: "Детский врач"
  },
  {
    name: "Кардиолог",
    description: "Профилактика и лечение сердечно-сосудистых заболеваний.",
    image: "img/cardiologist.jpg",
    location: "Казань",
    rating: 4.7,
    patients: 800,
    price: 3500,
    category: "Узкий специалист"
  },
  {
    name: "Невролог",
    description: "Лечение неврологических расстройств.",
    image: "img/neurologist.jpg",
    location: "Екатеринбург",
    rating: 4.6,
    patients: 700,
    price: 3200,
    category: "Узкий специалист"
  },
  {
    name: "Дерматолог",
    description: "Диагностика и лечение кожных заболеваний.",
    image: "img/dermatologist.jpg",
    location: "Самара",
    rating: 4.8,
    patients: 500,
    price: 3000,
    category: "Узкий специалист"
  },
  {
    name: "Офтальмолог",
    description: "Консультация и лечение глазных болезней.",
    image: "img/ophthalmologist.jpg",
    location: "Нижний Новгород",
    rating: 4.7,
    patients: 680,
    price: 3100,
    category: "Узкий специалист"
  },
  {
    name: "ЛОР",
    description: "Диагностика и лечение ЛОР заболеваний.",
    image: "img/otolaryngologist.jpg",
    location: "Челябинск",
    rating: 4.5,
    patients: 400,
    price: 2700,
    category: "Узкий специалист"
  },
  {
    name: "Гинеколог",
    description: "Женское здоровье и профилактика.",
    image: "img/gynecologist.jpg",
    location: "Красноярск",
    rating: 4.9,
    patients: 600,
    price: 3300,
    category: "Женское здоровье"
  },
  {
    name: "УЗИ специалист",
    description: "Проведение ультразвуковых исследований.",
    image: "img/ultrasound.jpg",
    location: "Пермь",
    rating: 4.8,
    patients: 1100,
    price: 1500,
    category: "Диагностика"
  },
  {
    name: "Стоматолог",
    description: "Диагностика и лечение заболеваний полости рта.",
    image: "img/dentist.jpg",
    location: "Воронеж",
    rating: 4.9,
    patients: 940,
    price: 3700,
    category: "Взрослый врач"
  },
  {
    name: "Психотерапевт",
    description: "Психологическая поддержка и консультации.",
    image: "img/psychotherapist.jpg",
    location: "Ростов-на-Дону",
    rating: 4.7,
    patients: 540,
    price: 3500,
    category: "Психотерапия"
  },
  {
    name: "Онколог",
    description: "Консультации по онкологическим вопросам.",
    image: "img/oncologist.jpg",
    location: "Уфа",
    rating: 4.6,
    patients: 310,
    price: 5000,
    category: "Узкий специалист"
  },
  {
    name: "Гастроэнтеролог",
    description: "Диагностика желудочно-кишечных заболеваний.",
    image: "img/gastroenterologist.jpg",
    location: "Омск",
    rating: 4.7,
    patients: 470,
    price: 2800,
    category: "Узкий специалист"
  },
  {
    name: "Травматолог",
    description: "Лечение травм и повреждений.",
    image: "img/traumatologist.jpg",
    location: "Волгоград",
    rating: 4.5,
    patients: 360,
    price: 3900,
    category: "Узкий специалист"
  },
  {
    name: "Эндокринолог",
    description: "Диагностика и лечение эндокринных нарушений.",
    image: "img/endocrinologist.jpg",
    location: "Краснодар",
    rating: 4.8,
    patients: 410,
    price: 3400,
    category: "Узкий специалист"
  }
];

const controls = [{
    name: 'Все услуги',
    handler: arr => arr
  },
  {
    name: 'Цена > 3000₽ (filter)',
    handler: arr => arr.filter(s => s.price > 3000)
  },
  {
    name: 'До 1000 пациентов',
    handler: arr => arr.filter(s => s.patients < 1000)
  },
  {
    name: 'TOP-5 по рейтингу',
    handler: arr => arr.slice().sort((a, b) => b.rating - a.rating).slice(0, 5)
  },
  {
    name: 'По алфавиту',
    handler: arr => arr.slice().sort((a, b) => a.name.localeCompare(b.name))
  },
  {
    name: 'Только Москва',
    handler: arr => arr.filter(s => s.location === 'Москва')
  },
  {
    name: 'Рейтинг +0.1',
    handler: arr => arr.map(s => ({
      ...s,
      rating: +(s.rating + 0.1).toFixed(1)
    }))
  },
  {
    name: 'Суммарно пациентов',
    handler: arr => [{
      name: 'Всего пациентов',
      description: '',
      image: 'img/total.jpg',
      location: '',
      rating: '',
      patients: arr.reduce((acc, s) => acc + s.patients, 0),
      price: '',
      category: ''
    }]
  },
  {
    name: 'Добавить ★',
    handler: arr => arr.map(s => ({
      ...s,
      name: s.name + " ★"
    }))
  },
  {
    name: 'Самый дешёвый',
    handler: arr => [arr.reduce((min, s) => s.price < min.price ? s : min, arr[0])]
  }
];

function renderCategories() {
  const categories = [...new Set(servicesCatalog.map(s => s.category))];
  const catDiv = document.getElementById('categoryList');
  catDiv.innerHTML = '';
  categories.forEach(cat => {
    const id = 'cat_' + cat.replace(/\s/g, '');
    catDiv.innerHTML += `
        <label>
          <input type="checkbox" class="categoryCheck" value="${cat}" id="${id}"> 
          ${cat}
        </label>
      `;
  });
}

function getFilteredCatalog(sourceArr = servicesCatalog) {
  let arr = sourceArr.slice();

  const checkedCats = Array.from(document.querySelectorAll('.categoryCheck:checked')).map(cb => cb.value);
  if (checkedCats.length) arr = arr.filter(s => checkedCats.includes(s.category));

  const search = document.getElementById('searchBox').value.trim().toLowerCase();
  if (search) arr = arr.filter(s => s.name.toLowerCase().includes(search) || s.description.toLowerCase().includes(search));

  const sort = document.getElementById('sortSelect').value;
  if (sort === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "price") arr.sort((a, b) => a.price - b.price);
  if (sort === "rating") arr.sort((a, b) => b.rating - a.rating);

  return arr;
}

function renderCatalog(arr) {
  const container = document.getElementById('catalog-container');
  container.innerHTML = '';
  if (!arr.length) {
    container.innerHTML = `<div style="padding:2em;text-align:center;color:#297ac7;font-size:1.3em;">
        Товары по заданным критериям не найдены.
      </div>`;
    return;
  }
  arr.forEach(service => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
        <img src="${service.image}" alt="${service.name}" class="service-img">
        <h3>${service.name}</h3>
        <p class="service-info">${service.description}</p>
        <p class="service-extra"><strong>Локация:</strong> ${service.location}</p>
        <p>
          <span class="service-rating"><strong>Рейтинг:</strong> ${service.rating} ⭐</span>
          <span class="service-patients"><strong>Пациентов:</strong> ${service.patients}</span>
        </p>
        <p class="service-extra"><strong>Цена:</strong> ${service.price} руб.</p>
        ${service.category ? `<p class="service-extra"><strong>Категория:</strong> ${service.category}</p>` : ''}
      `;
    container.appendChild(card);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  // Рендер кнопок
  const ctrl = document.getElementById('catalog-controls');
  controls.forEach(btn => {
    const button = document.createElement('button');
    button.textContent = btn.name;
    button.onclick = () => {
      lastBaseArray = btn.handler(servicesCatalog);
      renderCatalog(getFilteredCatalog(lastBaseArray));
    };
    ctrl.appendChild(button);
  });

  renderCategories();

  let lastBaseArray = servicesCatalog;
  const update = () => renderCatalog(getFilteredCatalog(lastBaseArray));

  document.getElementById('searchBox').addEventListener('input', update);
  document.getElementById('sortSelect').addEventListener('change', update);
  document.getElementById('categoryList').addEventListener('change', update);

  renderCatalog(servicesCatalog);
});