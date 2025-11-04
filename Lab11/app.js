const API_CONFIG = {
    baseUrl: 'https://www.omdbapi.com/',
    apiKey: '2435e903',
    fallbackImage: 'https://via.placeholder.com/300x450/161b22/58a6ff?text=No+Poster'
};

let currentMovies = [];
let currentQuery = '';
let currentFilter = 'title-asc';

const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const moviesGrid = document.getElementById('moviesGrid');
const loading = document.getElementById('loading');
const message = document.getElementById('message');
const errorMessage = document.getElementById('errorMessage');
const filterBtns = document.querySelectorAll('.filter-btn');

init();

function init() {
    searchMovies('Marvel');
    setupEventListeners();
}

function setupEventListeners() {
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('keypress', handleKeyPress);

    clearBtn.addEventListener('click', handleClearSearch);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', handleFilterChange);
    });
}

function handleSearchInput(e) {
    const value = e.target.value.trim();
    clearBtn.classList.toggle('visible', value.length > 0);
}

function handleKeyPress(e) {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            currentQuery = query;
            searchMovies(query);
        } else {
            currentQuery = '';
            searchMovies('Marvel');
        }
    }
}

function handleClearSearch() {
    searchInput.value = '';
    clearBtn.classList.remove('visible');
    currentQuery = '';
    searchInput.focus();
    searchMovies('Marvel');
}

function handleFilterChange(e) {
    filterBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    currentFilter = e.target.dataset.filter;

    applyFilter();
}

function applyFilter() {
    const [sortBy, order] = currentFilter.split('-');

    let sortedMovies = [...currentMovies];

    if (sortBy === 'title') {
        sortedMovies.sort((a, b) => {
            const titleA = a.Title || '';
            const titleB = b.Title || '';
            return order === 'desc' ?
                titleB.localeCompare(titleA) :
                titleA.localeCompare(titleB);
        });
    } else if (sortBy === 'rating') {
        sortedMovies.sort((a, b) => {
            const ratingA = parseFloat(a.imdbRating) || 0;
            const ratingB = parseFloat(b.imdbRating) || 0;
            return order === 'desc' ?
                ratingB - ratingA :
                ratingA - ratingB;
        });
    } else if (sortBy === 'year') {
        sortedMovies.sort((a, b) => {
            const yearA = parseInt(a.Year) || 0;
            const yearB = parseInt(b.Year) || 0;
            return order === 'desc' ? yearB - yearA : yearA - yearB;
        });
    }

    displayMovies(sortedMovies);
}



async function searchMovies(query) {
    showLoading(true);
    hideError();
    hideMessage();

    try {
        const searchUrl =
            `${API_CONFIG.baseUrl}?apikey=${API_CONFIG.apiKey}&s=${encodeURIComponent(query)}&type=movie`;
        const searchResponse = await fetch(searchUrl);

        if (!searchResponse.ok) {
            throw new Error('Failed to search movies');
        }

        const searchData = await searchResponse.json();

        if (searchData.Response === 'False') {
            currentMovies = [];
            showMessage('Фильмы не найдены');
            showLoading(false);
            return;
        }

        const movies = searchData.Search || [];

        if (movies.length === 0) {
            currentMovies = [];
            showMessage('Фильмы не найдены');
            showLoading(false);
            return;
        }

        const detailPromises = movies.slice(0, 10).map(movie =>
            fetch(`${API_CONFIG.baseUrl}?apikey=${API_CONFIG.apiKey}&i=${movie.imdbID}&plot=short`)
            .then(res => res.json())
            .catch(err => {
                console.error('Error fetching movie details:', err);
                return movie; 
            })
        );

        currentMovies = await Promise.all(detailPromises);

        applyFilter();
    } catch (error) {
        console.error('Error searching movies:', error);
        showError('Ошибка загрузки данных. Проверьте подключение к интернету.');
    } finally {
        showLoading(false);
    }
}

function displayMovies(movies) {
    moviesGrid.innerHTML = '';
    hideMessage();

    movies.forEach(movie => {
        const card = createMovieCard(movie);
        moviesGrid.appendChild(card);
    });
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const posterUrl = movie.Poster && movie.Poster !== 'N/A' ?
        movie.Poster :
        API_CONFIG.fallbackImage;

    const year = movie.Year || 'N/A';

    const rating = movie.imdbRating && movie.imdbRating !== 'N/A' ?
        movie.imdbRating :
        'N/A';

    const overview = movie.Plot && movie.Plot !== 'N/A' ?
        movie.Plot :
        'Описание недоступно.';

    // Get genres
    const genreTags = movie.Genre && movie.Genre !== 'N/A' ?
        movie.Genre.split(',').slice(0, 3).map(genre =>
            `<span class="genre-tag">${genre.trim()}</span>`
        ).join('') :
        '';

    const title = movie.Title || 'Unknown';

    card.innerHTML = `
        <img class="movie-poster" src="${posterUrl}" alt="${title}" loading="lazy">
        <div class="movie-info">
            <h3 class="movie-title">${title}</h3>
            <div class="movie-meta">
                <span class="movie-year">${year}</span>
                <div class="movie-rating">
                    <span class="star-icon">★</span>
                    <span>${rating}</span>
                </div>
            </div>
            <p class="movie-overview">${overview}</p>
            ${genreTags ? `<div class="movie-genres">${genreTags}</div>` : ''}
        </div>
    `;

    return card;
}

function showLoading(show) {
    loading.classList.toggle('show', show);
}

function showMessage(msg) {
    message.textContent = msg;
    message.classList.add('show');
}

function hideMessage() {
    message.classList.remove('show');
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.add('show');
}

function hideError() {
    errorMessage.classList.remove('show');
}