// Movie object constructor
class Movie {
    constructor(id, title, year, genre, image, director, rating, description) {
        this.id = id;
        this.title = title;
        this.year = year;
        this.genre = genre;
        this.image = image;
        this.director = director;
        this.rating = rating;
        this.description = description;
    }
}

// Clean data arrays declaration
var Movielist = [];
var AvailableGenres = [];

// Current filter and sort selections
let currentGenre = null;
let currentSort = null;
let currentSearch = "";

!(async function () {
    // URLs and option information being stored for ease of use
    const url_movies_p1 =
        "https://api.themoviedb.org/3/trending/movie/week?api_key=<<166d5942d85ad990bb05234ea9e70f3a>>,language=en-US";
    const url_movies_p2 =
        "https://api.themoviedb.org/3/trending/movie/week?api_key=<<166d5942d85ad990bb05234ea9e70f3a>>,language=en-US&page=2";
    const url_genre_codes =
        "https://api.themoviedb.org/3/genre/movie/list?api_key=<<166d5942d85ad990bb05234ea9e70f3a>>,language=en-US";
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNjZkNTk0MmQ4NWFkOTkwYmIwNTIzNGVhOWU3MGYzYSIsIm5iZiI6MTc1ODIwMjk3MS43MzYsInN1YiI6IjY4Y2MwYzViMzRjNjhlNmJhMDVlOGYwNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._Hhuwq1bS0hLn4rQIsTpjakNhYj859TtcPnJT3R-MT4",
        },
    };

    let getGenres = [];

    // Gets the code list for the genres
    let genreCodes = await fetch(url_genre_codes, options)
        .then((response) => response.json())
        .then((result) => {
            return result;
        })
        .catch((error) => console.log(error));
    // Flattens the genre code array -- .flat() gave errors?
    genreCodes = genreCodes.genres;

    // Gets first page of movies(20)
    let data_p1 = await fetch(url_movies_p1, options)
        .then((response) => response.json())
        .then((result) => {
            return result;
        })
        .catch((error) => console.log(error));

    // Gets second page of movies(20)
    let data_p2 = await fetch(url_movies_p2, options)
        .then((response) => response.json())
        .then((result) => {
            return result;
        })
        .catch((error) => console.log(error));

    // Concatenates and flattens the two movie arrays into a new array
    let data_all = data_p1.results.concat(data_p2.results);
    console.log(data_all);

    //Loop constructs movie objects and pushes them into our clean data array
    for (i = 0; i < data_all.length; i++) {
        // Finds the director of the movie via an API call and stores the returned value
        data_director = await fetch(
            "https://api.themoviedb.org/3/movie/" +
            data_all[i].id +
            "/credits?api_key=<<166d5942d85ad990bb05234ea9e70f3a>>",
            options
        )
            .then((response) => response.json())
            .then((jsonData) => jsonData.crew.filter(({ job }) => job === "Director"))
            .catch((error) => console.log(error));

        // Loops through the genre id list to match the movies's genre code and stores the returned string values
        genreUpdate = data_all[i].genre_ids.map((element) => {
            for (r = 0; r < genreCodes.length; r++) {
                if (element == genreCodes[r].id) {
                    getGenres.push(genreCodes[r].name);
                    return genreCodes[r].name;
                }
            }
        });

        // Preps variables
        let title = data_all[i].original_title;
        let year = data_all[i].release_date.slice(0, 4);
        let genre = genreUpdate.join(" / ");
        let image =
            "https://image.tmdb.org/t/p/original" + data_all[i].backdrop_path;
        let director = data_director[0].name;
        let rating = Math.round(data_all[i].vote_average * 10) / 10;
        let description = data_all[i].overview;

        // Pushes new movie object to clean Movie list
        Movielist.push(
            (window["movie_" + i] = new Movie(
                data_all[i].id,
                title,
                year,
                genre,
                image,
                director,
                rating,
                description
            ))
        );
    }
    console.log(Movielist);

    AvailableGenres = new Set(getGenres.sort());
    DisplayMovies();
    LoadMainPageImages();
    AddGenresToDropdown();
})();

// Clears the movie list page for new content
function DisplayMovies() {
    currentGenre = null; // reset filter
    $("#listDropdown").html(`Filter by Genre`);
    RenderMovies(); // unified rendering function
}

// Adds available genres to the genre dropdown filter on the movie list page
function AddGenresToDropdown() {
    AvailableGenres.forEach((element) => {
        $("#genre-filter").append(`
            <li><a class="dropdown-item" onclick="FilterByGenre('${element}')">${element}</a></li>
        `);
    });
}

// Displays movies on the movie list page based on the user's selection
function FilterByGenre(genre) {
    currentGenre = genre;
    $("#listDropdown").html(genre);
    RenderMovies();
}

// Populates the main page with images and titles
function LoadMainPageImages() {
    for (let i = 0; i < 4; i++) {
        if (i == 0) {
            $("#header-carousel").append(`
                <div class="carousel-item active">
                    <img src="${Movielist[i].image}" class="d-block w-100" alt="...">
                    <div class="overlay-text">${Movielist[i].title}</div>
                </div>
            `);
        } else {
            $("#header-carousel").append(`
                <div class="carousel-item">
                    <img src="${Movielist[i].image}" class="d-block w-100" alt="...">
                    <div class="overlay-text">${Movielist[i].title}</div>
                </div>
            `);
        }
    }

    for (let i = 0; i < 10; i++) {
        $("#top-10-movies").append(`
                <a class="card" href="pages/single_movie_page.html">
                    <img src="${Movielist[i].image
            }" class="card-img-top" alt="Movie 1">
                    <div class="card-body">
                        <h5 class="card-title">${i + 1} - ${Movielist[i].title
            }</h5>
                        <p class="card-text">${Movielist[i].description}</p>
                    </div>
                </a>
        `);
    }
}

function SelectMovie(title) {
    const selected = Movielist.find((m) => m.title === title);
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
             <div class ="col-md-3">
                <a href="single_movie_page.html?id=${movie.id}">
                    <div class="card list-card">
                        <img src="${movie.image}" class="card-img-top list-card-img-top" alt="...">
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

// Displays movies on the movie list page based on the user's selection
function FilterByGenre(genre) {
    currentGenre = genre;
    $("#listDropdown").html(genre);
    RenderMovies();
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
}

// Search bar live filter
document.getElementById("searchBar").addEventListener("input", function (e) {
    currentSearch = e.target.value.toLowerCase();
    RenderMovies();
});


// Note: The original rendering logic from the old SortMovies is removed here since it's now in RenderMovies
