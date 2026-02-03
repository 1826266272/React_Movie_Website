import {Client , Databases, ID, Query} from 'appwrite';

const VITE_APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const VITE_DATABASE_ID = import.meta.env.VITE_DATABASE_ID;
const VITE_COLLECTION_ID = import.meta.env.VITE_COLLECTION_ID;
const VITE_APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

const client = new Client()
    .setEndpoint(VITE_APPWRITE_ENDPOINT)
    .setProject(VITE_APPWRITE_PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async(searchTerm, movie) => {

    //check if a seachTerm exists
    try{
        const result = await database.listDocuments(
            VITE_DATABASE_ID,
            VITE_COLLECTION_ID,
            [
                Query.equal("searchTerm", searchTerm)
            ]
        );

        if(result.documents.length > 0)
        {
            const doc = result.documents[0];
            
            await database.updateDocument(
                VITE_DATABASE_ID,
                VITE_COLLECTION_ID,
                doc.$id,
                {
                    count: doc.count + 1,
                }
            );
        }
        else
        {
            await database.createDocument(
                VITE_DATABASE_ID,
                VITE_COLLECTION_ID,
                ID.unique(),
                {
                    searchTerm: searchTerm,
                    count: 1,
                    movie_id: movie.id,
                    poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
                }
            );
        }
    }catch(error){
        console.error("Error updating search count:", error);
    }
}


export const getTrendingMovies = async() => {
    try{
        const result = await database.listDocuments(VITE_DATABASE_ID, VITE_COLLECTION_ID, 
            [
            Query.orderDesc("count"),
            Query.limit(5),
            ]);
        return result.documents;
    }catch(error){
        console.error("Error getting trending movies:", error);
    }
}