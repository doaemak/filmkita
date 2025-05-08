// State
const state = {
  movies: [],
  currentPage: 1,
  moviesPerPage: 12,
  currentGenre: 'all'
};

// DOM Elements
const elements = {
  filmGrid: document.getElementById('filmGrid'),
  loadMoreBtn: document.getElementById('loadMoreBtn'),
  loadingMore: document.getElementById('loadingMore'),
  genreButtons: document.querySelectorAll('.genre-btn'),
  searchInput: document.getElementById('searchInput')
};

// API Functions
async function loadMovies() {
  try {
    toggleLoading(true);
    
    // Fetch dari data/movies.json
    const response = await fetch('data/movies.json');
    
    if (!response.ok) {
      throw new Error('Gagal memuat data film');
    }
    
    const movies = await response.json();
    state.movies = movies;
    
    // Cek untuk film dengan banyak episode
    for (const movie of movies) {
      if (movie.hasEpisodes) {
        try {
          // Jika film punya episode, ambil data tambahan dari /data/movies/{id}.json
          const episodeResponse = await fetch(`data/movies/${movie.id}.json`);
          if (episodeResponse.ok) {
            const episodeData = await episodeResponse.json();
            // Simpan data episode ke film
            movie.episodes = episodeData.episodes;
            console.log(`Loaded episodes for ${movie.title}`);
          }
        } catch (episodeError) {
          console.error(`Error loading episodes for movie ${movie.id}:`, episodeError);
        }
      }
    }
    
    // Initialize display after data is loaded
    displayMovies();
    
    toggleLoading(false);
  } catch (error) {
    console.error('Error:', error);
    showError('Gagal memuat data film. Silakan coba lagi nanti.');
    toggleLoading(false);
  }
}

// Display Functions
function displayMovies() {
  // Filter movies based on current genre
  const filteredMovies = filterMovies();
  
  // Get the movies for the current page
  const startIndex = 0;
  const endIndex = state.currentPage * state.moviesPerPage;
  const moviesToShow = filteredMovies.slice(startIndex, endIndex);
  
  // Clear the film grid if first page
  if (state.currentPage === 1) {
    elements.filmGrid.innerHTML = '';
  }
  
  // Create and append movie cards
  moviesToShow.forEach(movie => {
    const card = createMovieCard(movie);
    elements.filmGrid.appendChild(card);
  });
  
  updateLoadMoreButton(moviesToShow.length >= filteredMovies.length);
}

function createMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'film-card';
  card.setAttribute('data-aos', 'fade-up');
  
  // Pasikan genre ada dan bisa ditampilkan dengan benar
  let genreText = '';
  if (Array.isArray(movie.genre)) {
    genreText = movie.genre.join(' • ');
  } else if (typeof movie.genre === 'string') {
    genreText = movie.genre;
  }
  
  // Rating bintang (jika ada)
  let ratingHTML = '';
  if (movie.rating) {
    const stars = Math.round(movie.rating * 2) / 2; // Bulatkan ke 0.5 terdekat
    ratingHTML = `
      <div class="flex items-center mt-1">
        <div class="flex mr-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-yellow-400">
            <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
          </svg>
        </div>
        <span class="font-medium text-sm">${movie.rating.toFixed(1)}</span>
      </div>
    `;
  }
  
  // Tahun (jika ada)
  const yearHTML = movie.year ? `<span class="text-xs px-2 py-1 bg-black/30 rounded-md">${movie.year}</span>` : '';

  // Fallback image for missing poster
  const posterPath = movie.poster ? 
    (`assets/images/${movie.poster}`) : 
    ('https://via.placeholder.com/300x450?text=No+Poster');
  
  card.innerHTML = `
    <a href="play.html?id=${movie.id}">
      <div class="relative overflow-hidden rounded-t-lg">
        <img src="${posterPath}" 
             alt="${movie.title}"
             loading="lazy" class="w-full aspect-[2/3] object-cover transition-transform duration-700"
             onerror="this.onerror=null; this.src='https://via.placeholder.com/300x450/1e1e1e/a0a0a0?text=Film+Kita';">
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <button class="bg-primary hover:bg-primary-light text-white rounded-full p-2 transform translate-y-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
          </button>
        </div>
      </div>
      <div class="film-info p-3">
        <div class="flex justify-between items-start">
          <h3 class="text-base font-semibold mb-1">${movie.title}</h3>
          ${yearHTML}
        </div>
        <p class="text-sm text-gray-400">${genreText}</p>
        ${ratingHTML}
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