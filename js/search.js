
// Fungsi pencarian film
function searchMovies(query) {
    const searchTerm = query.toLowerCase().trim();
    const filteredMovies = movies.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm) ||
        movie.genre.some(g => g.toLowerCase().includes(searchTerm))
    );
    displayMovies(filteredMovies);
}

// Event listener untuk input pencarian
document.querySelectorAll('#searchInput, #mobileSearchInput').forEach(input => {
    input.addEventListener('input', (e) => searchMovies(e.target.value));
});

// Filter berdasarkan genre
document.querySelectorAll('.genre-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        const genre = e.target.dataset.genre;
        if (genre === 'all') {
            displayMovies(movies);
        } else {
            const filtered = movies.filter(movie => 
                movie.genre.includes(genre.charAt(0).toUpperCase() + genre.slice(1))
            );
            displayMovies(filtered);
        }
    });
});
