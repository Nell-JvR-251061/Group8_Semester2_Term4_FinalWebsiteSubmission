// <------------------------------------Thedza's code-------------------------------------->

function SelectMovie(title) {

    const selected = [...Movielist].find((m) => m.title === title);
    if (selected) {
        localStorage.setItem("selectedMovie", JSON.stringify(selected));
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    //Stops execution if not on single movie page
    if (!window.location.href.includes("single_movie_page.html")) {
        return;
    }

    //"window.location.search" gets the parts of the URL after the "?" symbol
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id");

    // Validates movie ID presence
    if (!movieId) {
        console.error("No movie ID found in URL");
        return;
    }

    // Fetches movie details from TMDB API
    const apiKey = "4b4dde0c583839c051377f3889d8a80f";
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`;
    const creditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`;

    try {
        const [movieRes, creditsRes] = await Promise.all([
            fetch(url),
            fetch(creditsUrl),
        ]);
        const movieData = await movieRes.json();
        const creditsData = await creditsRes.json();

        // Extracts necessary details
        // Director is optional based on final design
        // If director is not found, defaults to "Unknown"
        const director =
            creditsData.crew.find((c) => c.job === "Director")?.name || "Unknown";
        const image =
            "https://image.tmdb.org/t/p/original" + movieData.backdrop_path;
        const rating = Math.round(movieData.vote_average * 10) / 10;

        // Populates the page with movie details
        $(".media-hero img").attr("src", image);
        $(".overlay-card h2").text(movieData.original_title);
        $(".overlay-card p.text-muted").text(` Rating: ${rating} / 10`);
        $(".overlay-card .smptext.mb-3").text(movieData.overview);

        let check = JSON.parse(localStorage.getItem('watchlist'));
        if (check === null) {
            $(".overlay-card").append(`<div id="toAdd" ><button class="btn btn-outline-dark w-100" onclick="AddToWatchlist('${movieData.original_title}')">Save for Later</button></div>`);
        }
        else if (check.includes(movieData.original_title)) {
            $(".overlay-card").append(`<div id="alreadyAdded" class="w-100">Already on your watchlist</div>`);
        }
        else {
            $(".overlay-card").append(`<div id="toAdd" ><button class="btn btn-outline-dark w-100" onclick="AddToWatchlist('${movieData.original_title}')">Save for Later</button></div>`);
        }

    } catch (err) {
        console.error("Error loading movie details:", err);
    }
});

// Clears the movie list page for new content
function ClearMovieList() {
    $("#movieCards").html(``);
}

// Populates and displays the movie list based on current filters and sort
function RenderMovies() {
    let listToRender = [...Movielist]; // Start with a copy of the original list (the "..." spread operator creates a shallow copy)

    // Apply Filtering
    if (currentGenre && currentGenre !== "Clear Filter") {
        listToRender = listToRender.filter((movie) => {
            return movie.genre.includes(currentGenre);
        });
    }

    // Apply Search Filter
    if (currentSearch.trim() !== "") {
        listToRender = listToRender.filter((movie) => {
            return movie.title.toLowerCase().includes(currentSearch) ||
                movie.genre.toLowerCase().includes(currentSearch) ||
                movie.director.toLowerCase().includes(currentSearch);
        });
    }

    // Apply Sorting
    switch (currentSort) {
        case "az":
            listToRender.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case "za":
            listToRender.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case "newest":
            listToRender.sort((a, b) => b.year - a.year);
            break;
        case "oldest":
            listToRender.sort((a, b) => a.year - b.year);
            break;
        case "high":
            listToRender.sort((a, b) => b.rating - a.rating);
            break;
        case "low":
            listToRender.sort((a, b) => a.rating - b.rating);
            break;
        case null:
            // No sort applied, keep original list order after filtering
            break;
    }

    // Render Movies
    ClearMovieList();
    listToRender.forEach((movie) => {
        $("#movieCards").append(`
             <div class ="col-xl-3 col-lg-6 col-12">
                <a href="single_movie_page.html?id=${movie.id}">
                    <div class="card list-card">
                        <img src="${movie.image}" class="card-img-top list-card-img-top" alt="...">
                        <h5 class="card-title list-card-title">${movie.title} (${movie.year})</h5>
                        <div class="card-body list-card-body">
                            <h5 class="card-title list-card-title">${movie.title} (${movie.year})</h5>
                            <h6>${movie.genre}</h6>
                            <div class="d-flex flex-row justify-content-between">
                                <p class="card-text">Director: ${movie.director}</p>
                                <p class="card-text">Rating: ${movie.rating}</p>
                            </div>
                        </div>
                    </div>
                </a>
             </div>
         `);
    });
}

function SortMovies(type) {
    currentSort = type;

    if (type === null) {
        $("#sortDropdown").html(`Sort by`);
    } else {
        switch (type) {
            case "az":
                $("#sortDropdown").html("Title: A → Z");
                break;
            case "za":
                $("#sortDropdown").html("Title: Z → A");
                break;
            case "newest":
                $("#sortDropdown").html("Year: Newest");
                break;
            case "oldest":
                $("#sortDropdown").html("Year: Oldest");
                break;
            case "high":
                $("#sortDropdown").html("Rating: High → Low");
                break;
            case "low":
                $("#sortDropdown").html("Rating: Low → High");
                break;
        }
    }

    RenderMovies(); // Use the unified rendering function
}// Note: The original rendering logic from the old SortMovies is removed here since it's now in RenderMovies

// Search bar live filter
$("#searchBar").on("input", function (e) {
    currentSearch = e.target.value.toLowerCase();
    RenderMovies();
});

// Live Global Search
$("#searchBar").on("input", (e) => {
    const query = e.target.value.trim().toLowerCase();

    if (query.length === 0) {
        ExitSearchMode();
        return;
    }

    // Enter Search Mode
    searchMode = true;
    $('#searchBackBtn').removeClass('d-none');

    // Show loading feedback
    $("#movieCards").html(`<p class="text-center mt-5">Searching TMDB...</p>`);

    // Debounce to avoid API spam
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => SearchTMDB(query), 400);
});

async function SearchTMDB(query) {
    const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=en-US`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization:
                    "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNjZkNTk0MmQ4NWFkOTkwYmIwNTIzNGVhOWU3MGYzYSIsIm5iZiI6MTc1ODIwMjk3MS43MzYsInN1YiI6IjY4Y2MwYzViMzRjNjhlNmJhMDVlOGYwNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._Hhuwq1bS0hLn4rQIsTpjakNhYj859TtcPnJT3R-MT4",
            },
        });

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            $("#movieCards").html(`<p class="text-center mt-5">No results found for "${query}"</p>`);
            return;
        }

        RenderSearchResults(data.results);
    } catch (err) {
        console.error(`Search error for query "${query}":`, err);
        if (err && err.response && err.response.status) {
            console.error(`Response status: ${err.response.status}`);
        }
        $("#movieCards").html(`<p class="text-center mt-5 text-danger">Error fetching results for "${query}"</p>`);
    }
}

function RenderSearchResults(results) {
    ClearMovieList();

    results.forEach((movie) => {
        const image = movie.backdrop_path
            ? "https://image.tmdb.org/t/p/original" + movie.backdrop_path
            : "https://placehold.co/600x400?text=No+Image";

        const rating = movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : "N/A";

        $("#movieCards").append(`
            <div class="col-xl-3 col-lg-6 col-12">
                <a href="single_movie_page.html?id=${movie.id}">
                    <div class="card list-card">
                        <img src="${image}" class="card-img-top list-card-img-top" alt="${movie.title}">
                        <h5 class="card-title list-card-title">${movie.original_title} (${movie.release_date ? movie.release_date.slice(0, 4) : "?"})</h5>
                        <div class="card-body list-card-body">
                            <p class="card-text">Rating: ${rating}</p>
                        </div>
                    </div>
                </a>
            </div>
        `);
    });
}

function ExitSearchMode() {
    if (!searchMode) return;

    searchMode = false;
    $('#searchBackBtn').addClass('d-none');
    $("#searchBar").val("");

    DisplayMovies(); // restore default movie list
}

