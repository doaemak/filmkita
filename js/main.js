// Config
const CONFIG = {
  ITEMS_PER_PAGE: 12,
  API_BASE_URL: '/data/movies',
  ANIMATION_DURATION: 300
};

// State Management
const state = {
  movies: [],
  currentPage: 1,
  currentGenre: 'all',
  isLoading: false
};

// DOM Elements
const elements = {
  filmGrid: document.getElementById('filmGrid'),
  loadMoreBtn: document.getElementById('loadMoreBtn'),
  loadingMore: document.getElementById('loadingMore'),
  genreButtons: document.querySelectorAll('.genre-btn')
};

// Movie Loading & Display
async function loadMovies() {
  if (state.isLoading) return;

  try {
    state.isLoading = true;
    toggleLoading(true);

    const response = await fetch(`${CONFIG.API_BASE_URL}.json`);
    if (!response.ok) throw new Error('Failed to load movies');

    state.movies = await response.json();
    displayMovies();

  } catch (error) {
    console.error('Error:', error);
    showError('Failed to load movies');
  } finally {
    state.isLoading = false;
    toggleLoading(false);
  }
}

function displayMovies() {
  const trendingGrid = document.querySelector('.trending-grid');
  const newReleasesGrid = document.querySelector('.new-releases-grid');
  const filmGrid = document.querySelector('#filmGrid');
  
  trendingGrid.innerHTML = '';
  newReleasesGrid.innerHTML = '';
  
  const filteredMovies = filterMovies();
  const trendingMovies = filteredMovies.filter(m => m.trending).slice(0, 6);
  const newMovies = filteredMovies.sort((a,b) => new Date(b.releaseDate) - new Date(a.releaseDate)).slice(0, 6);
  
  trendingMovies.forEach(movie => {
    trendingGrid.appendChild(createMovieCard(movie));
  });
  
  newMovies.forEach(movie => {
    newReleasesGrid.appendChild(createMovieCard(movie));
  });
  
  // For category section
  const moviesToShow = filteredMovies.slice(0, state.currentPage * CONFIG.ITEMS_PER_PAGE);
  filmGrid.innerHTML = '';
  moviesToShow.forEach(movie => {
    filmGrid.appendChild(createMovieCard(movie));
  });
  
  updateLoadMoreButton(moviesToShow.length >= filteredMovies.length);
}

function createMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'film-card';
  card.setAttribute('data-aos', 'fade-up');

  card.innerHTML = `
    <a href="play.html?id=${movie.id}">
      <img src="assets/images/${movie.poster}" 
           alt="${movie.title}"
           loading="lazy" class="w-full aspect-[2/3] object-cover rounded-lg">
      <div class="film-info p-3">
        <h3 class="text-lg font-semibold">${movie.title}</h3>
        <p class="text-sm text-gray-400">${movie.genre.join(' • ')}</p>
      </div>
    </a>
  `;

  return card;
}

function filterMovies() {
  if (state.currentGenre === 'all') {
    return state.movies;
  }
  
  return state.movies.filter(movie => {
    // Periksa apakah genre adalah string atau array
    if (Array.isArray(movie.genre)) {
      // Jika array, periksa apakah ada genre yang cocok
      return movie.genre.some(g => 
        g.toLowerCase().includes(state.currentGenre.toLowerCase())
      );
    } else if (typeof movie.genre === 'string') {
      // Jika string, periksa apakah genre cocok
      return movie.genre.toLowerCase().includes(state.currentGenre.toLowerCase());
    }
    
    return false;
  });
}

function updateLoadMoreButton(hide) {
  elements.loadMoreBtn.style.display = hide ? 'none' : 'block';
}


// Event Handlers
function handleGenreChange(event) {
  state.currentGenre = event.target.dataset.genre;
  state.currentPage = 1;
  displayMovies();

  // Update active state
  elements.genreButtons.forEach(b => 
    b.classList.toggle('active', b === event.target));
}

function handleLoadMore() {
  state.currentPage++;
  displayMovies();
}

function toggleLoading(show) {
    if (elements.loadingMore) {
        elements.loadingMore.style.display = show ? 'flex' : 'none';
        elements.loadingMore.innerHTML = show ? `
            <div class="flex flex-col items-center">
                <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
                <p class="mt-4 text-gray-400">Memuat film...</p>
            </div>
        ` : '';
    }
}


// Error Handling (same as original)
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Event Listeners
function initializeEventListeners() {
  elements.genreButtons.forEach(btn => {
    btn.addEventListener('click', handleGenreChange);
  });

  elements.loadMoreBtn?.addEventListener('click', handleLoadMore);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadMovies();
  initializeEventListeners();
});