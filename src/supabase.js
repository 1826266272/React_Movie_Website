import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const updateSearchCount = async (searchTerm, movie) => {
  try {
    // check if search term exists
    const { data, error } = await supabase
      .from("searches")
      .select("*")
      .eq("searchTerm", searchTerm)
      .maybeSingle  ();

    if (data) {
      // update count
      await supabase
        .from("searches")
        .update({ count: data.count + 1 })
        .eq("id", data.id);
    } else {
      // create new record
      await supabase.from("searches").insert([
        {
          searchTerm: searchTerm,
          count: 1,
          movie_id: movie.id,
          poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
        },
      ]);
    }
  } catch (error) {
    console.error("Error updating search count:", error);
  }
};

export const getTrendingMovies = async () => {
  try {
    const { data, error } = await supabase
      .from("searches")
      .select("*")
      .order("count", { ascending: false })
      .limit(5);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error getting trending movies:", error);         
  }
};
