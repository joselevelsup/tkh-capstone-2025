import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import supabase from "../../supabaseClient";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const location = useLocation();
  const hideOnAuthPages = ["/login", "/signup"].includes(location.pathname);
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const isLoggedIn = user && !isLoading;

  // ✅ Don't show navbar on login/signup pages
  if (hideOnAuthPages) return null;

  // Log out function
  async function logOutUser(){
    const { error } = await supabase.auth.signOut({scope: 'local'});

    if(error){
      console.error("Error when logging out:", error)
    }else{
      console.log("Successful. Logging out.");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  }

  return (
    <nav className="bg-[#fefbfb] border-b border-[#e7d9d9] text-[#213547] font-serif">
      <ul className="flex justify-center gap-10 py-4 text-lg font-semibold">
        <li>
          <Link to="/" className="hover:text-[#b87d7d] transition">
            Home
          </Link>
        </li>
        <li>
          <Link to="/about" className="hover:text-[#b87d7d] transition">
            About
          </Link>
        </li>
        <li>
          <Link to="/journal" className="hover:text-[#b87d7d] transition">
            Journal
          </Link>
        </li>
        <li>
          <Link to="/achievement" className="hover:text-[#b87d7d] transition">
            Achievement
          </Link>
        </li>
        <li>
          {isLoggedIn ? (
            <button onClick={logOutUser} 
            className="mt-4 border border-red-500 bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition">
              Log Out</button>
          ) : (
            <>
            <li>
              <Link
                to="/login"
                className="bg-[#b87d7d]/80 text-white px-4 py-1 rounded-md hover:bg-[#a06d6d] transition"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/signup"
                className="border border-[#b87d7d] text-[#b87d7d] px-4 py-1 rounded-md hover:bg-[#b87d7d]/10 transition"
              >
                Signup
              </Link>
            </li>
            </>
          )}
        </li>
        
      </ul>
    </nav>
  );
}
