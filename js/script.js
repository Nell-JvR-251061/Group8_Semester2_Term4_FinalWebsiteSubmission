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

const Movielist = [];


!async function () {
    const url_movies_p1 = 'https://api.themoviedb.org/3/trending/movie/week?api_key=<<166d5942d85ad990bb05234ea9e70f3a>>,language=en-US';
    const url_movies_p2 = 'https://api.themoviedb.org/3/trending/movie/week?api_key=<<166d5942d85ad990bb05234ea9e70f3a>>,language=en-US&page=2';
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNjZkNTk0MmQ4NWFkOTkwYmIwNTIzNGVhOWU3MGYzYSIsIm5iZiI6MTc1ODIwMjk3MS43MzYsInN1YiI6IjY4Y2MwYzViMzRjNjhlNmJhMDVlOGYwNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._Hhuwq1bS0hLn4rQIsTpjakNhYj859TtcPnJT3R-MT4'
        }
    };

    let data_p1 = await fetch(url_movies_p1, options)
        .then((response) => response.json())
        .then((result) => { return result })
        .catch((error) => console.log(error));

    //console.log(data_p1);

    let data_p2 = await fetch(url_movies_p2, options)
        .then((response) => response.json())
        .then((result) => { return result })
        .catch((error) => console.log(error));

    //console.log(data_p2);

    let data_all = data_p1.results.concat(data_p2.results);

    //console.log(data_all);

    for (i = 0; i < data_all.length; i++) {
        data_director = await fetch('https://api.themoviedb.org/3/movie/' + data_all[i].id + '/credits?api_key=<<166d5942d85ad990bb05234ea9e70f3a>>', options)
            .then((response) => response.json())
            .then((jsonData) => jsonData.crew.filter(({ job }) => job === 'Director'))
            .catch((error) => console.log(error));
        
        

        let title = data_all[i].original_title;
        let year = data_all[i].release_date.slice(0, 4);
        let genre = data_all[i].genre_ids;
        let image = "https://image.tmdb.org/t/p/original" + data_all[i].backdrop_path;
        let director = data_director[0].name;
        let rating = data_all[0].vote_average;

        Movielist.push(window["movie_" + i] = new Movie(title, year, genre, image, director, rating));

    }

}();

console.log(Movielist);