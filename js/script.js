// Movie object constructor
class Movie {
    constructor(title, year, genre, image, director, rating, description) {
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


!async function () {
    // URLs and option information being stored for ease of use
    const url_movies_p1 = 'https://api.themoviedb.org/3/trending/movie/week?api_key=<<166d5942d85ad990bb05234ea9e70f3a>>,language=en-US';
    const url_movies_p2 = 'https://api.themoviedb.org/3/trending/movie/week?api_key=<<166d5942d85ad990bb05234ea9e70f3a>>,language=en-US&page=2';
    const url_genre_codes = 'https://api.themoviedb.org/3/genre/movie/list?api_key=<<166d5942d85ad990bb05234ea9e70f3a>>,language=en-US'
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNjZkNTk0MmQ4NWFkOTkwYmIwNTIzNGVhOWU3MGYzYSIsIm5iZiI6MTc1ODIwMjk3MS43MzYsInN1YiI6IjY4Y2MwYzViMzRjNjhlNmJhMDVlOGYwNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._Hhuwq1bS0hLn4rQIsTpjakNhYj859TtcPnJT3R-MT4'
        }
    };

    let getGenres = [];


    // Gets the code list for the genres
    let genreCodes = await fetch(url_genre_codes, options)
        .then((response) => response.json())
        .then((result) => { return result })
        .catch((error) => console.log(error));
    // Flattens the genre code array -- .flat() gave errors?
    genreCodes = genreCodes.genres;


    // Gets first page of movies(20)
    let data_p1 = await fetch(url_movies_p1, options)
        .then((response) => response.json())
        .then((result) => { return result })
        .catch((error) => console.log(error));

    // Gets second page of movies(20)
    let data_p2 = await fetch(url_movies_p2, options)
        .then((response) => response.json())
        .then((result) => { return result })
        .catch((error) => console.log(error));

    // Concatenates and flattens the two movie arrays into a new array
    let data_all = data_p1.results.concat(data_p2.results);
    console.log(data_all);


    //Loop constructs movie objects and pushes them into our clean data array
    for (i = 0; i < data_all.length; i++) {
        // Finds the director of the movie via an API call and stores the returned value
        data_director = await fetch('https://api.themoviedb.org/3/movie/' + data_all[i].id + '/credits?api_key=<<166d5942d85ad990bb05234ea9e70f3a>>', options)
            .then((response) => response.json())
            .then((jsonData) => jsonData.crew.filter(({ job }) => job === 'Director'))
            .catch((error) => console.log(error));

        // Loops through the genre id list to match the movies's genre code and stores the returned string values
        genreUpdate = data_all[i].genre_ids.map(element => {
            for (r = 0; r < genreCodes.length; r++) {
                if (element == genreCodes[r].id) {
                    getGenres.push(genreCodes[r].name);
                    return genreCodes[r].name;
                }
            }
        })

        // Preps variables 
        let title = data_all[i].original_title;
        let year = data_all[i].release_date.slice(0, 4);
        let genre = genreUpdate.join(' / ');
        let image = "https://image.tmdb.org/t/p/original" + data_all[i].backdrop_path;
        let director = data_director[0].name;
        let rating = Math.round(data_all[i].vote_average * 10) / 10;
        let description = data_all[i].overview;

        // Pushes new movie object to clean Movie list
        Movielist.push(window["movie_" + i] = new Movie(title, year, genre, image, director, rating, description));

    }
    console.log(Movielist);

    AvailableGenres = new Set(getGenres.sort());
    DisplayMovies();
    LoadMainPageImages();
    AddGenresToDropdown();

}();

// Clears the movie list page for new content
function ClearMovieList() {
    $('#movieCards').html(``);
}

// Populates the movie list page
function DisplayMovies() {
    ClearMovieList();

    $("#listDropdown").html(`Filter by Genre`);

    Movielist.forEach(movie => {
        $('#movieCards').append(`
            
             <div class ="col-md-3">
                <a href="single_movie_page.html">
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

// Adds available genres to the genre dropdown filter on the movie list page
function AddGenresToDropdown() {
    AvailableGenres.forEach(element => {
        $('#genre-filter').append(`
            <li><a class="dropdown-item" onclick="FilterByGenre('${element}')">${element}</a></li>
        `);
    });
}

// Displays movies on the movie list page based on the user's selection
function FilterByGenre(genre) {
    $('#listDropdown').html(`${genre}`);

    let newList = Movielist.filter(movie => {
        return movie.genre.includes(genre) == true;
    });

    ClearMovieList();

    newList.forEach(movie => {
        $('#movieCards').append(`
             <div class ="col-md-3">
                <a href="single_movie_page.html">
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

function LoadMainPageImages() {
    for (let i = 0; i < 4; i++) {
        if (i == 0) {
            $('#header-carousel').append(`
                <div class="carousel-item active">
                    <img src="${Movielist[i].image}" class="d-block w-100" alt="...">
                    <div class="overlay-text">${Movielist[i].title}</div>
                </div>
            `);
        }
        else {
            $('#header-carousel').append(`
                <div class="carousel-item">
                    <img src="${Movielist[i].image}" class="d-block w-100" alt="...">
                    <div class="overlay-text">${Movielist[i].title}</div>
                </div>
            `);
        }
    }

    for (let i = 0; i < 10; i++) {
        $('#top-10-movies').append(`
                <a class="card" href="pages/single_movie_page.html">
                    <img src="${Movielist[i].image}" class="card-img-top" alt="Movie 1">
                    <div class="card-body">
                        <h5 class="card-title">${i + 1} - ${Movielist[i].title}</h5>
                        <p class="card-text">${Movielist[i].description}</p>
                    </div>
                </a>
        `);
    }

}

document.addEventListener("DOMContentLoaded", () => {
  const baseRow = document.querySelector(".base-row");
  const allRows = document.querySelectorAll(".poster-row:not(.base-row)");

  if (!baseRow) return;

  const posters = Array.from(baseRow.querySelectorAll("img")).map(img => img.src);

  function shuffle(array) {
    return array
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  allRows.forEach(row => {
    const shuffled = shuffle(posters);
    row.innerHTML = shuffled.map(src => `<img src="${src}" alt="">`).join("");
  });
});
