import { useState,useEffect, use } from 'react';
import Search from './components/search';
import Spinner from './components/spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import { updateSearchCount } from './appWrite';
import { getTrendingMovies } from './appWrite';

const API_BASE_URL = "https://api.themoviedb.org/3/";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};
const App = () => {

  const[searchTerm, setSearchTerm] = useState("");
  const[fetchError, setFetchError] = useState(null);
  const[movieList, setMovieList] = useState([]);
  const[isLoading, setIsLoading] = useState(false);
  const[debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const[trendingMovies, setTrendingMovies] = useState([]);

  useDebounce(() =>setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setFetchError(null);
    
    try{
      const endpoint = query ?
      `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok){
        throw new Error("Cannot fetch movies");
      }

      const data =  await response.json();

      if(data.response === "False"){
        throw new Error(data.error || "fetch movies failed");
        setMovieList([]);
        return;
      }
      setMovieList(data.results || []);

      if(query && data.results.length > 0)
      {
        updateSearchCount(searchTerm, data.results[0]);
      }
    }
    catch(error){
      console.error("Error fetching movies:", error);
      setFetchError("Failed to fetch movies. Please try again later.");
    }
    finally{
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async() => {
    try{
      const trending = await getTrendingMovies();
      setTrendingMovies(trending);
    }catch(error){
      console.error("Error loading trending movies:", error);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <>
    <main>
      <div className='pattern'>

        <div className='wrapper'>
          <header>

            <img src="./hero.png" alt="Hero-banner"/>
            <h1>Find <span className="text-gradient">Movies</span> you can enjoy</h1>
            
            {trendingMovies.length > 0 && (
              <section className='trending'>
                <h2>Trending Movies</h2>
                <ul>
                  {trendingMovies.map((movie, index) => (
                    <li key={movie.$id}>
                      <p>{index + 1}</p>
                      <img 
                        src={movie.poster_url} 
                        alt={movie.title} 
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
            
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
            

          </header>

          <section className='all-movies'>
            <h2 className='mt-[40px]'>Recent Movies</h2>

            {isLoading ? (
              <Spinner/>
              ) : fetchError ? (
                <p className='text-red-500'>{fetchError}</p>
              ) :
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
            }
          </section>
        </div>

      </div>
    </main>
    
    </>
  );
}

export default App;