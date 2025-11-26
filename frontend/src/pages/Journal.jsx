import React, {useState,useEffect,useRef,useCallback} from "react";
import {useNavigate} from "react-router-dom";
import supabase from "../supabaseClient";

export default function Journal() {
  // User & guest (null)
  const [user, setUser]= useState(null); 
  const [journals, setJournals]= useState([]);
  const [selectedJournal, setSelectedJournal]= useState(null);
  const [pages, setPages]= useState([]);
  const [selectedPage, setSelectedPage]= useState(null);
  const [entry, setEntry]= useState("");
  const [message, setMessage]= useState("");
  // Loading the editor UI
  const [loading, setLoading]= useState(true);
  const [editorReady, setEditorReady]= useState(false);

  // overtype
  const guestEditorContainerRef= useRef(null);
  const authEditorContainerRef= useRef(null);
  const guestEditorRef= useRef(null);
  const authEditorRef= useRef(null);
  const lastAuthEvent= useRef(Date.now());

  // bttns nav
  const navigate= useNavigate();

  // ---------------------------------
  // MOUNTING-check user, auth listener-sign in and out; then overtype loads
  // ---------------------------------

  useEffect(() => {const initSession= async () => {
      try {
        const {data}= await supabase.auth.getSession();
        const currentUser= data?.session?.user || null;
        setUser(currentUser);
        setLoading(false);
        if (currentUser) await loadJournals(currentUser.id);
      } catch (err) {
        console.error("Error initializing session:", err);
      }
    };
    initSession();

    // auth listener
    const {data: listener}= supabase.auth.onAuthStateChange((_event, session) => {
      const now= Date.now();
      if (now - lastAuthEvent.current < 1500) return;
      lastAuthEvent.current = now;

      const newUser= session?.user || null;
      setUser(newUser);

      if (newUser) loadJournals(newUser.id);
      else {
        setJournals([]);
        setPages([]);
        setSelectedJournal(null);
      }
    });

    return () => listener.subscription?.unsubscribe();
  }, []);

  // ---------------------------------
  // SUPABASE database fetch-Journals & Pages
  // ---------------------------------
  const loadJournals= useCallback(async (userId) => {
    try {
      const {data, error}= await supabase
        .from("journals")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      setJournals(data || []);
    } 
    catch (err) {
      console.error("Error loading journals:", err);
    }
  }, []);


  const loadPages = useCallback(async (journalId) => {
    try {
      const {data, error}= await supabase
        .from("pages")
        .select("*")
        .eq("journal_id", journalId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPages(data || []);
    } catch (err) {
      console.error("Error loading pages:", err);
    }
  }, []);


  // ---------------------------------
  // SUPABASE updates - crud / saving format
  // ---------------------------------
  
  const handleCreateJournal= async () => {
    if (!user) return setMessage("🔒 Sign in to create and save journals!");
    const newTitle= prompt("Enter journal name (i.e., Finance, Relationship):");
    if (!newTitle) return;
    
    try {
      const {data, error}= await supabase
        .from("journals")
        .insert([{ user_id: user.id, title: newTitle }])
        .select();

      if (error) throw error;
      const newJournal= data?.[0];
      if (newJournal) {
        setJournals((prev)=> [...prev, newJournal]);
        setSelectedJournal(newJournal);
        setPages([]);
        setMessage("✅ Journal created!");
      }


    } catch (err) {
      console.error("Error creating journal:", err);
      setMessage("❌ Failed to create journal.");
    }
  };

  const handleNewEntry= () => {
    setSelectedPage(null);
    setEntry("");
    setMessage("📝 New page started!");
  };


  const handleSaveToCloud= async () => {
    if (!user) return setMessage("You’re in guest mode. Sign in to save!");
    if (!selectedJournal) return setMessage("Please select a journal first.");
    if (!entry.trim()) return setMessage("Nothing to save.");


    try {
      setMessage("☁ Uploading to Supa-Cloud...");
      const safeEntry= entry.trim();
      const folder= selectedJournal.title.toLowerCase().replace(/\s+/g, "-");
      const fileName= `${Date.now()}.txt`;
      const filePath= `${user.id}/${folder}/${fileName}`;
      const file= new Blob([safeEntry], { type: "text/plain" });

      const {error: uploadError}= await supabase.storage
        .from("journal-pages")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;


      if (selectedPage) {
        await supabase
          .from("pages")
          .update({ entry: safeEntry, storage_path: filePath })
          .eq("id", selectedPage.id);
        setMessage("✅ Page updated!");
      } else {
        await supabase
          .from("pages")
          .insert({
            user_id: user.id,
            journal_id: selectedJournal.id,
            entry: safeEntry,
            storage_path: filePath,
          });
        setMessage("✅ Page saved!");
      }

      handleNewEntry();
      loadPages(selectedJournal.id);
    } 
    catch (err) {
      console.error("Error saving entry:", err);
      setMessage("❌ " + err.message);
    }
  };

  const handleDeletePage= async (pageId) => {
    if (!pageId || !window.confirm("Delete this page?")) return;
    try {
      const { error } = await supabase.from("pages").delete().eq("id", pageId);
      if (error) throw error;

      setPages((prev)=> prev.filter((p) => p.id !== pageId));
      setMessage("🗑 Page deleted");
    } catch (err) {
      console.error("Error deleting page:", err);
      setMessage("❌ Failed to delete page.");
    }
  };


  
  // ---------------------------------
  // SAVE LOCALLY
  // ---------------------------------
  const handleDownloadEntry= () => {
    if (!entry.trim()) return setMessage("Write something first!");
    const blob= new Blob([entry], { type: "text/plain" });
    const link= document.createElement("a");
    link.href= URL.createObjectURL(blob);
    link.download= "journal-entry.txt";
    link.click();
    URL.revokeObjectURL(link.href);
    setMessage("✅ Entry downloaded!");
  };

  
  // ---------------------------------
  // LOGOUT
  // ---------------------------------
  const handleLogout= async () => {
    await supabase.auth.signOut();
    setUser(null);
    setJournals([]);
    setPages([]);
    setSelectedJournal(null);
    setMessage("👋 Logged out successfully.");
  };


  // ---------------------------------
  // GO TO MOOD TRACKER
  // ---------------------------------
  const handleTrackMood= () => navigate("/moodtracker");


  // ---------------------------------
  // Overtype things..2 editors / 2 instances - for guest & auth 
  // ---------------------------------
  useEffect(()=> {
    let rafId;

    const initOverType= () => {
      if (document.hidden) return;

      const container= user
        ? authEditorContainerRef.current
        : guestEditorContainerRef.current;

      if (!container || !window.OverType) {
        rafId = requestAnimationFrame(initOverType);
        return;
      }

      if ((user && authEditorRef.current) || (!user && guestEditorRef.current)) return;

      const [editor]= window.OverType.init(container, {
        value: entry || "",
        toolbar: true,
        autoResize: true,
        minHeight: "300px",
        onChange:(val) => setEntry(val),
      });

      if (user) authEditorRef.current= editor;
      else guestEditorRef.current= editor;

      setEditorReady(true);
    };

    rafId= requestAnimationFrame(initOverType);
    return () => cancelAnimationFrame(rafId);
  }, [user]);


  // Keep OverType editor synced with state - visual text w/ entry variable
  useEffect(() => {
    const editor = user ? authEditorRef.current: guestEditorRef.current;
    if (editor && editor.getValue() !== entry) editor.setValue(entry);
  }, [entry, user]);


  
  // ---------------------------------
  // May not need. LOADING MESSAGE FOR THE UX
  // ---------------------------------
  const SpinnerOverlay = () => (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(255,255,255,0.6)",
        borderRadius: "10px",
        zIndex: 10,
      }}
    >
      <p style={{ color: "#4B6B46", fontWeight: "bold" }}>⏳ Loading Editor...</p>
    </div>
  );



// ---------------------------------
  // STYLING
  // ---------------------------------

// background, padding, fonts for guest and auth
  const sharedContainerStyle = {
    minHeight:"100vh",
    background:"linear-gradient(to bottom, #7B886F, #90A96E, #556B2F)",
    padding:"40px 20px",
    fontFamily:"'Averia Serif Libre', serif",
    color:"#111",
  };


  // ---------------------------------
  // TIPS ON HOW TO USE
  // ---------------------------------
  
  const tipMessage= (
    <div style={{margin:"10px 0", fontSize: "18px",color: "#4B6B46",textAlign:"center"}}>
      Tip: Write anything here! Use the toolbar’s <strong>View Mode</strong> to switch between{" "}
      <strong>Edit</strong>, <strong>Raw Markdown</strong>, and{" "}
      <strong>Preview</strong>. Return to “Normal Edit” to continue writing.
    </div>
  );


  // ---------------------------------
  // GUEST MODE
  // ---------------------------------
  if (!user && !loading) {
    return (
      <div style={sharedContainerStyle}>
        <div
          style={{
            background: "#F9F9F4",
            borderRadius: "20px",
            padding: "30px",
            maxWidth: "600px",
            width: "100%",
            margin: "0 auto",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >


      <h1 style={{fontSize:"3rem",color: "#4B6B46",marginBottom: "20px"}}>
      Guest Journal Mode
      </h1>
          <p style={{ color:"#B0346E",fontSize:"16", marginBottom: "20px"}}>
            You’re journaling as a guest. Your entries are stored locally. Sign up to unlock
            cloud sync and access past journals!
          </p>

        {tipMessage}

        <div style={{position:"relative",marginBottom: "20px"}}>
          {!editorReady && <SpinnerOverlay />}
          <div
          ref={guestEditorContainerRef}
          id="guest-editor"
          style={{
          border:"1px solid #7C9E5B",
          borderRadius: "10px",
          background: "#fff",
          minHeight: "300px",
          padding: "10px",}}
            />
          </div>


{/* For Buttons */}
        <div style={{display:"flex",justifyContent:"center", gap: "15px",}}>
          <button
          onClick={handleDownloadEntry}
          style={{
          background:"#7C9E5B",
          color:"#fff",
          padding:"12px 20px",
          borderRadius:"8px",
         fontSize:"16px",
          cursor:"pointer",
        }}>

        💾 Save Locally
            
        </button>
            
            
      <button
        onClick={handleTrackMood}
        style={{
          background:"#FFA0AC",
          color:"#fff",
          border:"none",
          padding:"12px 20px",
          borderRadius:"8px",
          fontSize:"16px",
          cursor:"pointer",
              }}
            >

              😊 Track My Mood
            </button>
          </div>

{/* MESSAGES - LIKE MUST WRITE SOMETHING  */}
          {message&&<p style={{color:"#B0346E",marginTop:"15px"}}>{message}</p>}
        </div>
      </div>
    );
  }


  // ---------------------------------
  // AUTHENTICATED
  // ---------------------------------
  return (
    <div style={sharedContainerStyle}>
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#F9F9F4",
          borderRadius: "20px",
          padding: "30px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >

    <header
      style={{
      display: "flex",
      justifyContent:"space-between",
      alignItems:"center",
      marginBottom: "30px",
      }}
      >
          
          
    <h1 style={{fontSize:"3rem", color: "#4B6B46"}}>📝 My Journals</h1>
    <div style={{display:"flex", gap: "15px"}}>
    <button
    onClick={handleCreateJournal}
    style={{
    background: "#7C9E5B",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    }}
    >

    + New Journal
    </button>
    <button
    onClick={handleLogout}
    style={{
    background:"#FFA0AC",
    color:"#fff",
    padding:"12px 20px",
    borderRadius:"8px",
    fontSize:"16px",
    cursor:"pointer",
    }}
    >
    Logout
    </button>

    </div>
    </header>



    <div style={{marginBottom: "20px"}}>
    <label htmlFor="journalSelect" style={{fontWeight: "bold", color: "#4B6B46",fontSize:"1.5rem"}}>
    Select Journal:
    </label>
    

    <select
    id="journalSelect"
    value={selectedJournal?.id || ""}
    onChange={(e) => {
    const j= journals.find((j) => j.id === e.target.value);
    setSelectedJournal(j || null);
    if (j) loadPages(j.id);
    handleNewEntry();
    }}

// dropdown style
    style={{
    width:"100%",
    padding:"10px",
    fontSize:"16px",
    border:"solid #7C9E5B",
    borderRadius:"8px",
    marginTop:"8px",
    }}
    >


    <option value="">-- Choose a Journal --</option>
      {journals.map((j)=> (
        <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>


      {selectedJournal && (
        <>
        {tipMessage}

        <div style={{ position: "relative", marginBottom: "20px"}}>
          {!editorReady && <SpinnerOverlay />}
          <div
          ref={authEditorContainerRef}
          id="auth-editor"
          style={{
          border: "1px solid #7C9E5B",
          borderRadius: "10px",
          background: "#fff",
          minHeight: "300px",
          padding: "10px",
          }}
          />
          </div>

            <div style={{display: "flex", gap: "15px", marginBottom: "20px"}}>
              <button
                onClick={handleSaveToCloud}
                style={{
                  background: "#4B6B46",
                  color: "#fff",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >


         ☁ Save to Supa-Cloud
          </button>

    {/* New page bttn */}
          <button
          onClick={handleNewEntry}
            style={{
                  background: "#7C9E5B",
                  color: "#fff",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                New Page
              </button>

 {/* mood bttn */}
      <button
      onClick={handleTrackMood}
        style={{
        background: "#FFA0AC",
        color: "#fff",
          padding: "12px 20px",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
          }}
        >
          😊 Track My Mood
        </button>
        

    {/* PAGE ENTRIES */}    
    </div>
      {pages.length > 0 && (
        <div
        style={{
        background: "#dfcdcdff",
        borderRadius: "10px",
        padding: "20px",
        boxShadow: "inset 0 4px 8px rgba(0,0,0,0.05)",
        }}
          >
      <h3 style={{color: "#141e13ff", fontWeight: "bold", marginBottom: "10px"}}>
      📚 Pages in {selectedJournal.title}
      </h3>
      
      <ul
        style={{
        maxHeight:"300px",
        overflowY:"auto",
        listStyle:"none",
        padding: 0,
          }}
          >

        {pages.map((p) => (
          <li
          key={p.id}
          style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems:"center",
          padding:"8px 0",
          borderBottom:"1px solid #e0e0e0",
          }}
          >

          <span
            onClick={() => {
            setSelectedPage(p);
            setEntry(p.entry);
            }}
            style={{
           color: "#141e13ff",
            fontWeight: "500",
           cursor: "pointer",
            textDecoration: "underline",
             }}
            >

        {new Date(p.created_at).toLocaleString()}
          </span>

      <button
          onClick={() => handleDeletePage(p.id)}
          style={{
          background:"none",
          border:"none",
          color:"#fc0505ff",
          fontSize: "14px",
         cursor: "pointer",
        }}
        
        title="Delete page"> 
         Delete! </button>
            </li>
            ))}
                </ul>
              </div>
            )}
          </>
        )}

        {message && (<p style={{color:"#B0346E",textAlign:"center",fontWeight:"bold"}}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}