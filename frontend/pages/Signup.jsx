import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
// (demo) reminder: do "npm install --save @supabase/supabase-js"
import { createClient } from "@supabase/supabase-js";

// (demo) Make sure to do .env for these
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function Signup(){
    const navigate = useNavigate();
    // const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alert, showAlert] = useState({
        message: "",
        show: false
    });

    const signupUser = async (values) => {
        const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        data: {
            username: values.username
        }
        });

        if(error){
            showAlert({
                show: true,
                message: error.message
            })
        } else {
            navigate("/");      
        }
    }

    return(
        <div>
            <h2>Sign Up</h2>
            <h3>Nourish You. Start your journal today.</h3>
            <form onSubmit={handleSubmit(signupUser)}>
                <div>
                    <h4>Username</h4>
                    <input></input>
                </div>
                <div>
                    <h4>Email</h4>
                    <input></input>
                </div>
                <div>
                    <h4>Password</h4>
                    <input></input>
                </div>
                <div>
                    <h4>Confirm Password</h4>
                    <input></input>
                </div>
            </form>
            <button type="submit">Create Account</button>
            <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    );
}