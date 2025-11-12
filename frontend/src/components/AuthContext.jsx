import React, {useContext, createContext, useState, useEffect} from "react";
import supabase from "../supabaseClient";

const AuthContext = createContext();

export default function AuthProvider({ children }){
    const [user, setUser] = useState();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() =>{
        //Initial check for current session
        supabase.auth.getSession().then(({ data }) => {
        setUser(data.session.user ?? null);
        setIsLoading(false);
        });

        // Listener set up
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
        });

        // Clean up the listener on unmount
        return () => {
        authListener?.subscription.unsubscribe();
        };
    }, []);

    return(
        <AuthContext.Provider value={{user, isLoading}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
};