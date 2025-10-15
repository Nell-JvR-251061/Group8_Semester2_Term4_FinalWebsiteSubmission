// Movie object constructor
class Movie {
    constructor(title, year, genre, image, director, rating) {
        this.title = title;
        this.year = year;
        this.genre = genre;
        this.image = image;
        this.director = director;
        this.rating = rating;
    }
}

// Clean data array declaration
const Movielist = [];


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
        let rating = Math.round(data_all[i].vote_average * 10)/10;

        // Pushes new movie object to clean Movie list
        Movielist.push(window["movie_" + i] = new Movie(title, year, genre, image, director, rating));

    }

    //DisplayMovies();

}();

// Displays all the movies as cards
function DisplayMovies() {
    Movielist.forEach(movie => {
        document.getElementById('movieCards').innerHTML += `
             <div class ="col-md-3">
                 <div class="card">
                     <img src="${movie.image}" class="card-img-top" alt="...">
                     <div class="card-body">
                         <h5 class="card-title">${movie.title} (${movie.year})</h5>
                         <h6>${movie.genre}</h6>
                         <div class="d-flex flex-row justify-content-between">
                            <p class="card-text">Director: ${movie.director}</p>
                            <p class="card-text">Rating: ${movie.rating}</p>
                         </div>
                     </div>
                 </div>
            
             </div>

         `;
    });
}

