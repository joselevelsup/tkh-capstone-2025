import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
console.log(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
export default function App() {
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    getuserData();
  }, []);

  async function getuserData() {
    const { data } = await supabase.from("user_profiles").select();
    setUserData(data);
  }
  console.log(userData);

  return (
    <ul>
      {userData.map((user) => (
        <li key={user.name}>{user.name}</li>
      ))}
    </ul>
  );
}