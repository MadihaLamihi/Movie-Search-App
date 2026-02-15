const movieGrid = document.getElementById('movieGrid');
const watchlistGrid = document.getElementById('watchlistGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const statusMessage = document.getElementById('statusMessage');
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const watchlistEmpty = document.getElementById('watchlistEmpty');
const modal = document.getElementById('movieModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');

const API_KEY = 'd435fae1';

let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

/* ================= THEME ================= */
themeToggle.addEventListener('click', () => {
    const isDark = body.getAttribute('data-theme') === 'dark';
    const icon = themeToggle.querySelector('i');

    if (isDark) {
        body.removeAttribute('data-theme');
        icon.className = 'fa-regular fa-moon';
    } else {
        body.setAttribute('data-theme', 'dark');
        icon.className = 'fa-regular fa-sun';
    }
});


/* ================= SEARCH ================= */
async function searchMovies() {
    const query = searchInput.value.trim();
    if (!query) return;

    statusMessage.textContent = "Searching...";
    movieGrid.innerHTML = "";

    const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`);
    const data = await response.json();

    if (data.Response === "True") {
        renderMovies(data.Search);
        statusMessage.textContent = `Found ${data.Search.length} results.`;
    } else {
        statusMessage.textContent = data.Error;
    }
}

async function renderMovies(movies) {
    movieGrid.innerHTML = "";

    for (let movie of movies) {
        const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}`);
        const details = await res.json();

        const card = document.createElement('div');
        card.className = "movie-card";

        card.innerHTML = `
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450'}">
            <div class="card-content">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
                <span class="rating-badge">⭐ ${details.imdbRating}</span>
                <button class="add-btn">+ Watchlist</button>
                <button class="add-btn view-btn">View Details</button>
            </div>
        `;

        card.querySelector('.add-btn').onclick = () =>
            addToWatchlist(movie.imdbID, movie.Title, movie.Poster);

        card.querySelector('.view-btn').onclick = () =>
            openModal(details);

        movieGrid.appendChild(card);
    }
}

/* ================= WATCHLIST ================= */
function addToWatchlist(id, title, poster) {
    if (watchlist.some(m => m.id === id)) return;

    watchlist.push({ id, title, poster });
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    updateWatchlist();
}

function removeFromWatchlist(id) {
    watchlist = watchlist.filter(m => m.id !== id);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    updateWatchlist();
}

function updateWatchlist() {
    watchlistEmpty.style.display = watchlist.length === 0 ? "block" : "none";

    watchlistGrid.innerHTML = watchlist.map(movie => `
        <div class="movie-card">
            <img src="${movie.poster}">
            <div class="card-content">
                <h4>${movie.title}</h4>
                <button class="remove-btn" onclick="removeFromWatchlist('${movie.id}')">
                    Remove
                </button>
            </div>
        </div>
    `).join('');
}

window.removeFromWatchlist = removeFromWatchlist;
updateWatchlist();

/* ================= MODAL ================= */
function openModal(movie) {
    modal.style.display = "flex";

    modalBody.innerHTML = `
        <h2>${movie.Title}</h2>
        <p><strong>Year:</strong> ${movie.Year}</p>
        <p><strong>Genre:</strong> ${movie.Genre}</p>
        <p><strong>Plot:</strong> ${movie.Plot}</p>
        <p><strong>IMDb Rating:</strong> ⭐ ${movie.imdbRating}</p>
    `;
}

closeModal.onclick = () => modal.style.display = "none";
window.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
};

searchBtn.addEventListener('click', searchMovies);
searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') searchMovies();
});
