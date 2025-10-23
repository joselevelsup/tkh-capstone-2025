import supabase from "../supabaseClient"
import { useEffect, useState } from "react";

export default function Home (){
    const [userData, setUserData] = useState([]);

  useEffect(() => {
    getuserData();
  }, []);

  async function getuserData() {
    const { data, error } = await supabase.from("user_profiles").select();
    if (error) {
        console.log(error);
    }
    console.log(data);
    setUserData(data);
  }
  console.log(userData);

    return(
        <>
        hewwo home
        </>
    )
}
