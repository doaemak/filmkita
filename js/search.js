// Search functionality for the movie application

// DOM Elements
const searchInput = document.getElementById('searchInput');
const filmGrid = document.getElementById('filmGrid');

// State
let searchTimeout;
let movies = [];

// Fetch movies data if not already available from main.js
async function loadMoviesForSearch() {
  if (window.state && window.state.movies && window.state.movies.length > 0) {
    // Use movies from main.js state if available
    movies = window.state.movies;
    return;
  }
  
  try {
    const response = await fetch('data/movies.json');
    
    if (!response.ok) {
      throw new Error('Failed to load movie data for search');
    }
    
    movies = await response.json();
  } catch (error) {
    console.error('Error loading movies for search:', error);
    showSearchError('Gagal memuat data untuk pencarian');
  }
}

// Search function
function searchMovies(query) {
  if (!query || query.trim() === '') {
    // If search is cleared, reload original display if main.js is handling it
    if (window.displayMovies) {
      window.state.currentGenre = 'all';
      window.state.currentPage = 1;
      window.displayMovies();
      return;
    }
    
    // Otherwise show all movies
    displaySearchResults(movies);
    return;
  }
  
  query = query.toLowerCase().trim();
  
  const results = movies.filter(movie => {
    // Search by title
    if (movie.title.toLowerCase().includes(query)) {
      return true;
    }
    
    // Search by genre if it's an array
    if (Array.isArray(movie.genre) && movie.genre.some(g => g.toLowerCase().includes(query))) {
      return true;
    }
    
    // Search by genre if it's a string
    if (typeof movie.genre === 'string' && movie.genre.toLowerCase().includes(query)) {
      return true;
    }
    
    // Search in description
    if (movie.description && movie.description.toLowerCase().includes(query)) {
      return true;
    }
    
    // Search by year (convert to string first)
    if (movie.year && String(movie.year).includes(query)) {
      return true;
    }
    
    return false;
  });
  
  displaySearchResults(results);
}

// Display search results
function displaySearchResults(results) {
  // If main.js is handling the display, update its state and use its display function
  if (window.displayMovies && window.state) {
    window.state.searchResults = results;
    window.state.isSearching = true;
    window.displayMovies();
    return;
  }
  
  // Otherwise display results directly
  if (!filmGrid) return;
  
  // Clear the grid
  filmGrid.innerHTML = '';
  
  if (results.length === 0) {
    filmGrid.innerHTML = `
      <div class="col-span-full text-center py-8">
        <p class="text-gray-400 text-lg">Tidak ada film yang cocok dengan pencarian Anda</p>
        <button class="mt-4 px-4 py-2 bg-primary rounded-lg hover:bg-primary-light transition"
                onclick="clearSearch()">
          Tampilkan Semua Film
        </button>
      </div>
    `;
    return;
  }
  
  // Use createMovieCard from main.js if available
  if (window.createMovieCard) {
    results.forEach(movie => {
      const card = window.createMovieCard(movie);
      filmGrid.appendChild(card);
    });
    return;
  }
  
  // Fallback to basic card creation
  results.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'film-card';
    
    // Basic genre display
    let genreText = '';
    if (Array.isArray(movie.genre)) {
      genreText = movie.genre.join(' • ');
    } else if (typeof movie.genre === 'string') {
      genreText = movie.genre;
    }
    
    card.innerHTML = `
      <a href="play.html?id=${movie.id}">
        <img src="assets/images/${movie.poster}" 
             alt="${movie.title}"
             loading="lazy" class="w-full aspect-[2/3] object-cover rounded-lg">
        <div class="film-info p-3">
          <h3 class="text-lg font-semibold">${movie.title}</h3>
          <p class="text-sm text-gray-400">${genreText}</p>
          ${movie.year ? `<p class="text-xs mt-1">${movie.year}</p>` : ''}
        </div>
      </a>
    `;
    
    filmGrid.appendChild(card);
  });
}

// Clear search
function clearSearch() {
  if (searchInput) {
    searchInput.value = '';
  }
  
  // Reset state for main.js if available
  if (window.state) {
    window.state.isSearching = false;
    window.state.currentGenre = 'all';
    window.state.currentPage = 1;
    window.displayMovies();
  } else {
    // Otherwise just display all movies
    displaySearchResults(movies);
  }
}

// Show search error
function showSearchError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 3000);
}

// Initialize search
function initializeSearch() {
  if (!searchInput) return;
  
  // Load movie data
  loadMoviesForSearch();
  
  // Add event listener with debounce
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    
    // Clear existing timeout
    clearTimeout(searchTimeout);
    
    // Set new timeout to avoid too many searches during typing
    searchTimeout = setTimeout(() => {
      searchMovies(query);
    }, 300);
  });
  
  // Handle pressing enter in the search field
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      clearTimeout(searchTimeout);
      searchMovies(e.target.value);
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeSearch);