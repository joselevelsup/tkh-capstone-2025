import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import supabase from "../supabaseClient"

export default function Signup(){
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [alert, showAlert] = useState({
        message: "",
        show: false,
        isError: false
    });
    const [loading, setLoading] = useState(false);

//Create profile in "user_profiles" table on Supabase
    async function createUserProfile(userId){
        const { error } = await supabase 
            .from('user_profiles')
            .insert([
                //insert foreign key and date timestamp
                { user_id: userId, created_at: new Date() }
            ]);

        if (error){
            console.error("Error when creating profile:", error);
            return { success: false, error };
        }
        return { success: true };
    }

    async function signupUser(e){
        e.preventDefault();
        // Clear previous alerts
        showAlert({ message: "", show: false, isError: false }); 
        setLoading(true);

        // Making sure password matches when confirming password
        if (password !== confirmPassword) {
            showAlert({
                show: true,
                isError: true,
                message: "Passwords do not match. Please try again."
            });
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if(error){
            setLoading(false);
            showAlert({
                show: true,
                isError: true,
                message: error.message || "An error occurred during signup"
            })
            console.log("signup error:", error);
            return;
        }

        const user = data?.user;
        if(user){
            //create relational link in user_profiles
            const userProfile = await createUserProfile(user.id);

            setLoading(false);

            if(userProfile.success){
                // Success: Auth user created and new profile row created
                showAlert({
                    show: true,
                    isError: false,
                    // Note: Supabase sign up requires email confirmation by default, but we have it turned off
                    message: "Account created!"
                });

                console.log("user signed up:", user);
                navigate("/");

                // Clear fields after success
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            }else{
                showAlert({
                    show: true,
                    isError: true,
                    message: "Account created but profile setup failed. Please contact support."
                    });
            }
        }
    }

    //Alert for if there is an error or success when sign up
    function SignupAlert() {
        if (!alert.show) return null;

        const baseClass = "p-3 mb-4 rounded-lg shadow-md flex items-center justify-between transition-opacity duration-300";
        const alertColor = alert.isError 
            ? "bg-red-100 border border-red-400 text-red-700" 
            : "bg-green-100 border border-green-400 text-green-700";

        return (
            <div className={`${baseClass} ${alertColor}`}>
                <p className="flex-grow">{alert.message}</p>
                <button 
                    onClick={() => showAlert({ message: "", show: false, isError: false })} 
                    className={`ml-4 text-lg font-bold p-1 rounded-full ${alert.isError ? 'hover:bg-red-200' : 'hover:bg-green-200'}`}
                    aria-label="Close Alert">
                    X
                </button>
            </div>
        );
    }

    return(
        <div className="flex min-h-screen items-center justify-center bg-[#fefbfb] font-serif text-[#213547] px-4 py-4">
            <div className="w-full max-w-md rounded-2xl border border-[#eadede] bg-white/80 p-10 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <h2 className="mb-2 text-center text-3xl font-bold leading-tight">Sign Up to track your{" "}  
                <span className="rounded-md bg-[#e8caca]/60 px-2">Journaling</span></h2>

                <div className="flex justify-center mb-2">
                    {/*Reminder: Credit for book-open jsx -> heroicons.com */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                </div>
            <SignupAlert />
            <form onSubmit={signupUser} className="space-y-3">

                <div className="flex flex-col space-y-1">
                    <label htmlFor="email" className="flex flex-col text-sm font-semibold">Email</label>
                    <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="janedoe@example.com" disabled={loading}
                    className="mt-1 rounded-md border border-neutral-300 bg-neutral-100 px-3 py-2 text-[15px] outline-none focus:ring-1 focus:ring-[#b87d7d] placeholder-gray-500">
                    </input>
                </div>

                <div className="flex flex-col space-y-1">
                    <label htmlFor="password" className="flex flex-col text-sm font-semibold">Password</label>
                    <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="pass123" disabled={loading}
                    className="mt-1 rounded-md border border-neutral-300 bg-neutral-100 px-3 py-2 text-[15px] outline-none focus:ring-1 focus:ring-[#b87d7d] placeholder-gray-500">
                    </input>
                </div>

                <div className="flex flex-col space-y-1">
                    <label htmlFor="confirmPassword" className="flex flex-col text-sm font-semibold">Confirm Password</label>
                    <input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="pass123" disabled={loading}
                    className="mt-1 rounded-md border border-neutral-300 bg-neutral-100 px-3 py-2 text-[15px] outline-none focus:ring-1 focus:ring-[#b87d7d] placeholder-gray-500">
                    </input>
                </div>

                <div className="pt-2">
                <button type="submit"  disabled={loading}
                    className="mt-2 w-full rounded-md bg-[#b87d7d]/90 py-2 font-bold text-white transition hover:bg-[#a06d6d] disabled:opacity-60">
                    {loading ? "..." : 'Create Account'}
                    </button> 
                </div>  
            </form>
            <p className="mt-3 text-center text-sm">Nourish You. Start your journal today.</p>
            <p className="mt-2 text-center text-sm text-gray-600">Already have an account? 
                <Link to="/login" className="font-semibold text-[#b87d7d] hover:underline"> Login</Link></p>
            </div>
        </div>
    );
}