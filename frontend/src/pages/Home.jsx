import supabase from "../supabaseClient"
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { useAuth } from "../components/AuthContext";

export default function Home (){
  const { user, isLoading } = useAuth();
  const [userData, setUserData] = useState([null]);
  const [recentEntry, setRecentEntry] = useState(null);
  const [previewText, setPreviewText] = useState("Loading entry content...");

  useEffect(() => {
    async function fetchAllData(){
      //user logged in
    if(user && !isLoading){
      await getuserData(user.id);
      await fetchMostRecentEntry(user.id)
    }

    //when user logs out
    if(!user && !isLoading){
      setUserData(null);
      setRecentEntry(null);
    }
    };
    fetchAllData();
  }, [isLoading, user]);

  //new useEffect for getting journal content
  useEffect(() => {
    if(recentEntry?.storage_path){
      async function fetchJournalContent(){
        setPreviewText("Loading entry content...");
        //get object's signed url
        const { urlData, urlError} = await supabase.storage.from("journal-pages").createSignedUrl(recentEntry.storage_path, 60)

        if(urlError){
          console.log("Error when getting signed URL:", urlError);
          setPreviewText("Error loading content.");
          return;
        }
        const resp = await fetch(urlData.signedUrl);
        const text = await resp.text();
        console.log("This is the text fetched:",text);

        setPreviewText(text); //actual content of journal's body text
      }
      fetchJournalContent();
    } 
  }, [recentEntry]);

  //(Supabase setup)
  async function getuserData(userId) {
    const { data, error } = await supabase.from("user_profiles").select().eq('id', userId).single();
    if (error) {
        console.log(error);
    }
    console.log('The data is: ', data);
    setUserData(data);
  }
  console.log('The set user data is: ',userData);

  if(isLoading){
      return(
        <div className="status-container">
          <p>Loading...</p>
        </div>
      )
  }

  //function for displaying most recent journal entry as preview?
  async function fetchMostRecentEntry(userId){
    try {
      const { data, error } = await supabase.from('pages').select('id, journal_id, entry, storage_path, created_at')
      //sorts by date and limits to only one
      .eq('user_id', userId).order('created_at', {ascending: false}).limit(1);

      if(error){
        console.log("Error fetching recent entry:", error);
        return null;
      }
      console.log("Most recent entry: ", data);
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.log("API call failed:", error)
      return null;
    }
  }

    return(
      <div className="home-content">
        {user ? (
          <div className="flex flex-col min-h-screen gap-3 items-center bg-[#fdebebff] font-serif text-[#213547] px-4 py-4">
            <h1 className="text-sm !m-0 p-0 font-semibold">Welcome Back!</h1>
            <h2 className="text-lg !m-0 p-0 font-semibold">How are you feeling?</h2>
            <div className="flex flex-row gap-6 font-semibold">
              <Link to="/journal" className="border border-[#7b886f] bg-[#b4dc7f]/80 px-4 py-1 rounded-md hover:bg-[#ffa0ac]/80 transition">
              Start New Entry</Link>
              <Link to="moodtracker" className="border border-[#7b886f] bg-[#b4dc7f]/80 px-4 py-1 rounded-md hover:bg-[#ffa0ac]/80 transition">
              Mood tracker</Link>
            </div> 

            <div className="mt-8 w-full max-w-md p-4 border border-[#7b886f] bg-[#FFFFFF] rounded-lg shadow-lg">
                    {recentEntry ? (
                        <>
                            <h3>Most Recent Entry: {recentEntry.entry}</h3>
                            <p className="text-sm text-gray-600">
                                {new Date(recentEntry.created_at).toLocaleDateString()}
                            </p>
                            <p>{previewText.substring(0, 150)}...</p>
                            <Link to={`/journal/${recentEntry.id}`}>Read Full Entry</Link>
                        </>
                    ) : (
                        // Message if the user is logged in but has no entries yet
                        <p className="text-center italic">
                            You haven't made any entries yet. Start one now!
                        </p>
                    )}
                </div>
            </div>
        ) : (
          <div className="flex flex-col min-h-screen gap-3 items-center bg-[#fdebebff] font-serif text-[#213547] px-4 py-4">
            <h1 className="text-sm font-semibold">Welcome!</h1>
            <h2 className="text-lg font-semibold">Already have an account? 
              <Link to="/Login" className="font-semibold text-[#b87d7d] hover:underline"> Login</Link></h2>
            <h2 className="text-lg !m-0 font-semibold">Would you like to create an account?
              <Link to="/Signup" className="font-semibold text-[#b87d7d] hover:underline"> Sign up</Link></h2>

            <div className="flex flex-row">
              {/*Reminder: Credit for question-mark-circle jsx -> heroicons.com */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#b87d7d" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
              </svg>
              <h3><Link to="/About"
            className="font-semibold text-[#b87d7d] hover:underline">
              Click to Learn More About Color Me Happy!</Link></h3>
            </div>
            
          </div>
        )}
      </div>
    )
}
