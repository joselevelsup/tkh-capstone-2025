import supabase from "../supabaseClient"
import { useEffect, useState } from "react";
import { useNavigate, Link } from 'react-router-dom';

export default function Home (){
    const navigate = useNavigate();
    const [userData, setUserData] = useState([]);

  useEffect(() => {
    getuserData();
  }, []);

  //(Supabase setup)
  async function getuserData() {
    const { data, error } = await supabase.from("user_profiles").select();
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

  //Different welcome message depending on logged in or not??
  async function welcomeMessage(){
    const { data: {user} } = await supabase.auth.getUser();
    //if user is logged in
    if (user) {
      <div>
        <h1>Welcome back!</h1>
        <h3>How are you feeling today?</h3>
      </div>
    } else {
      <div>
        <h1>Welcome!</h1>
        <h3>Sign up or log in to get started.</h3>
      </div>
    }
  }

  //link to mood tracker when that is set up

  //function for displaying most recent journal entry as preview?

  //Inspirational Quote API?

    return(
        <>
        hewwo home
        <p>Nourish You. Start your journal today.</p>
        <h1>Welcome!</h1>
        <h3>How are you feeling?</h3>
        <button onClick={navigateNewEntry}>Start New Entry</button>
        </>
    )
}
