import supabase from "../supabaseClient"
import { useEffect, useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from "../components/AuthContext";

export default function Home (){
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    //user logged in
    if(user && !isLoading){
      getuserData(user.id);
    }

    //when user logs out
    if(!user && !isLoading){
      setUserData(null);
    }
  }, [isLoading, user]);

  //(Supabase setup)
  async function getuserData(userId) {
    const { data, error } = await supabase.from("user_profiles").select().eq('id', userId).single();
    if (error) {
        console.log(error);
    }
    console.log(data);
    setUserData(data);
  }
  console.log(userData);


  async function navigateNewEntry(){
    navigate("/journal")
  }

  //link to mood tracker when that is set up
  async function navigateMoodTracker(){
    navigate("/moodtracker")
  }

  if(isLoading){
      return(
        <div className="status-container">
          <p>Loading...</p>
        </div>
      )
  }

  

  //function for displaying most recent journal entry as preview?

  //Inspirational Quote API?

    return(
      <>
        hewwo home
      <div className="home-content">
        {user ? (
          <div>
            <p>Welcome Back!</p>
            <h3>How are you feeling?</h3>
            <button onClick={navigateNewEntry}>Start New Entry</button>
            <button onClick={navigateMoodTracker}>Mood tracker</button>
          </div>
        ) : (
          <div>
            <p>Welcome!</p>
            <p>Already have an account? 
              <Link to="/Login">Login</Link></p>
            <p>Would you like to create an account?
              <Link to="/Signup">Signup</Link></p>
        </div>
        )}
      </div>
      </>
    )
}
