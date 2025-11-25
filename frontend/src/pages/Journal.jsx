import React, {useState,useEffect,useRef,useCallback} from "react";
import {useNavigate} from "react-router-dom";
import supabase from "../supabaseClient";

export default function Journal() {
  const [user, setUser]= useState(null); 
  const [journals, setJournals]= useState([]);
  const [selectedJournal, setSelectedJournal]= useState(null);
  const [pages, setPages]= useState([]);
  const [selectedPage, setSelectedPage]= useState(null);
  const [entry, setEntry]= useState("");
  const [message, setMessage]= useState("");
  const [loading, setLoading]= useState(true);
  const [editorReady, setEditorReady]= useState(false);

  const guestEditorContainerRef= useRef(null);
  const authEditorContainerRef= useRef(null);
  const guestEditorRef= useRef(null);
  const authEditorRef= useRef(null);
  const lastAuthEvent= useRef(Date.now());

  const navigate= useNavigate();

  // ---------------------------------------------------
  // MOUNTING-check user, auth listener-sign in and out; then overtype loads
  // ---------------------------------------------------
  useEffect(() => {
    const initSession= async () => {
      try {
        const {data}= await supabase.auth.getSession();
        const currentUser= data?.session?.user || null;
        setUser(currentUser);
        setLoading(false);
        if (currentUser) await loadJournals(currentUser.id);
      } catch (err) {
        console.error("Init session error:", err);
      }
    };

    initSession();


// auth listener
    const {data: listener}= supabase.auth.onAuthStateChange((_event, session) => {
      const now= Date.now();
      if (now - lastAuthEvent.current < 1500) return;
      lastAuthEvent.current= now;

      const newUser= session?.user || null;
      setUser(newUser);

      if (newUser) loadJournals(newUser.id);
      else {
        setJournals([]);
        setPages([]);
        setSelectedJournal(null);
        setSelectedPage(null);
        setEntry("");
      }
    });

    return () => listener.subscription?.unsubscribe();
  }, []);

  // ---------------------------------------------------
  // SUPABASE database fetch-Journals & Pages
  // ---------------------------------------------------
  const loadJournals= useCallback(async (userId) => {
    try {
      const {data, error}= await supabase
        .from("journals")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      setJournals(data || []);
    } catch (err) {
      console.error("Load journals error:", err);
    }
  }, []);

// check for loading errors
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
      console.error("Load pages error:", err);
    }
  }, []);

  // ---------------------------------------------------
  // SUPABASE updates - crud / saving format
  // ---------------------------------------------------
  const handleCreateJournal= async () => {
    if (!user) return setMessage("🔒 Sign in first!");

    const newTitle= prompt("Enter journal name:");
    if (!newTitle) return;

    try {
      const {data, error}= await supabase
        .from("journals")
        .insert([{ user_id: user.id, title: newTitle }])
        .select();

      if (error) throw error;

      const newJournal= data?.[0];
      setJournals(prev => [...prev, newJournal]);
      setSelectedJournal(newJournal);
      setPages([]);
      setEntry("");

      setMessage("✅ Journal created!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Could not create journal.");
    }
  };

  const handleNewEntry = (showMessage = true) => {
    setSelectedPage(null);
    setEntry("");
    if (showMessage) setMessage("📝 New page started!");
  };

  const handleSaveToCloud= async () => {
    if (!user) return setMessage("Sign in to save!");
    if (!selectedJournal) return setMessage("Pick a journal first!");
    if (!entry.trim()) return setMessage("Nothing to save.");

    try {
      setMessage("☁ Uploading...");

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

      handleNewEntry(true);
      loadPages(selectedJournal.id);
    } catch (err) {
      console.error(err);
      setMessage("❌ Save failed.");
    }
  };

  const handleDeletePage= async (pageId) => {
    if (!pageId || !window.confirm("Delete this page?")) return;
    try {
      const { error } = await supabase
        .from("pages")
        .delete()
        .eq("id", pageId);

      if (error) throw error;

      setPages(prev => prev.filter(p => p.id !== pageId));

      if (selectedPage?.id === pageId) {
        setSelectedPage(null);
        setEntry("");
      }

      setMessage("🗑 Deleted.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Delete failed.");
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
    setSelectedPage(null);
    setEntry("");
    setMessage("👋 Logged out.");
  };

// ---------------------------------
// GO TO MOOD TRACKER
// ---------------------------------
  const handleTrackMood= () => navigate("/moodtracker");

  // ---------------------------------------------------
  // updated 11/21: OverType  reinitializes
  // Editor no longer disappears when switching between journals
  // ---------------------------------------------------
  useEffect(()=> {let rafId;
    setEditorReady(false);

    const initOverType= () => {
      if (document.hidden) return;

      const container= user
        ? authEditorContainerRef.current
        : guestEditorContainerRef.current;

      if (!container || !window.OverType) {rafId = requestAnimationFrame(initOverType);
        return;
      }

// Removes existing instance before creating a new one
      if (authEditorRef.current) {
        authEditorRef.current.destroy?.();
        authEditorRef.current = null;
      }
      if (guestEditorRef.current) {
        guestEditorRef.current.destroy?.();
        guestEditorRef.current = null;
      }

// the new instance
      const [editor]= window.OverType.init(container, {
        value: entry || "",
        toolbar: true,
        autoResize: true,
        minHeight: "300px",
        onChange: (val) => setEntry(val),
      });

      if (user) authEditorRef.current = editor;
      else guestEditorRef.current = editor;

      setEditorReady(true);
    };

    rafId = requestAnimationFrame(initOverType);

    return () => cancelAnimationFrame(rafId);
  }, [user, selectedJournal, selectedPage]);

  useEffect(() => {
    const editor = user ? authEditorRef.current : guestEditorRef.current;
    if (editor && editor.getValue() !== entry) editor.setValue(entry);
  }, [entry, user]);

  // ---------------------------------------------------
  // Loading icon if needed
  // ---------------------------------------------------
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
      <p style={{ color: "#4B6B46", fontWeight: "bold" }}>
        ⏳ Loading Editor...
      </p>
    </div>
  );

  // ---------------------------------------------------
  // STYLING
  // ---------------------------------------------------
  const sharedContainerStyle = {
    minHeight:"100vh",
    background:"linear-gradient(to bottom, #7B886F, #90A96E, #556B2F)",
    padding:"40px 20px",
    fontFamily:"'Averia Serif Libre', serif",
    color:"#111",
  };

  // ---------------------------------------------------
  // TIPS ON HOW TO USE
  // ---------------------------------------------------
  const tipMessage= (
    <div style={{
      margin:"10px 0",
      fontSize: "18px",
      color: "#4B6B46",
      textAlign:"center"
    }}>
      Tip: Write anything here! Use the toolbar’s <strong>View Mode</strong> to switch between{" "}
      <strong>Edit</strong>, <strong>Raw Markdown</strong>, and{" "}
      <strong>Preview</strong>. Return to “Normal Edit” to continue writing.
    </div>
  );

  // ---------------------------------------------------
  // NEW 11/21 example prompts
  // ---------------------------------------------------
  const promptBlock = (
    <div
      style={{
        margin: "15px 0",
        padding: "15px",
        background: "#EFEDE680",
        borderRadius: "10px",
        color: "#4B6B46",
        fontSize: "16px",
        lineHeight: "1.6",
      }}
    >
      <h3 style={{ marginBottom: "8px", fontWeight: "bold" }}>
        Need inspiration? Try these prompts:
      </h3>
      <ul style={{ paddingLeft: "20px", margin: 0 }}>
        <li>What’s one thing that went well today?</li>
        <li>How am I feeling emotionally right now?</li>
        <li>What’s been on my mind lately?</li>
        <li>What small win can I celebrate?</li>
        <li>What advice would my future self give me?</li>
      </ul>
    </div>
  );

  // ---------------------------------------------------
  // GUEST MODE
  // ---------------------------------------------------
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
          <h1
            style={{
              fontSize:"3rem",
              color: "#4B6B46",
              marginBottom: "20px"
            }}
          >
            Guest Journal Mode
          </h1>

          <p
            style={{
              color:"#B0346E",
              fontSize:"16",
              marginBottom: "20px"
            }}
          >
            You’re journaling as a guest. Your entries can be downloaded to your device. Sign up/login to unlock
            cloud sync and access past journals!
          </p>

          {tipMessage}
          {promptBlock}

          <div style={{position:"relative", marginBottom: "20px"}}>
            {!editorReady && <SpinnerOverlay />}
            <div
              ref={guestEditorContainerRef}
              id="guest-editor"
              style={{
                border:"1px solid #7C9E5B",
                borderRadius:"10px",
                background:"#fff",
                minHeight:"300px",
                padding:"10px"
              }}
            />
          </div>

          <div style={{display:"flex", justifyContent:"center", gap:"15px"}}>
            <button
              onClick={handleDownloadEntry}
              style={{
                background:"#7C9E5B",
                color:"#fff",
                padding:"12px 20px",
                borderRadius:"8px",
                fontSize:"16px",
                cursor:"pointer"
              }}
            >
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
                cursor:"pointer"
              }}
            >
              😊 Track My Mood
            </button>
          </div>

          {message && (
            <p style={{color:"#B0346E", marginTop:"15px"}}>
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------
  // AUTH MODE
  // ---------------------------------------------------
  return (
    <div style={sharedContainerStyle}>
      <div
        style={{
          maxWidth:"900px",
          margin:"0 auto",
          background:"#F9F9F4",
          borderRadius:"20px",
          padding:"30px",
          boxShadow:"0 10px 30px rgba(0,0,0,0.1)"
        }}
      >
        <header
          style={{
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center",
            marginBottom:"30px"
          }}
        >

     <h1 style={{fontSize:"3rem", color:"#4B6B46"}}>
      📝 My Journals
    </h1>

          <div style={{display:"flex", gap:"15px"}}>
            <button
              onClick={handleCreateJournal}
              style={{
                background:"#7C9E5B",
                color:"#fff",
                padding:"12px 20px",
                borderRadius:"8px",
                fontSize:"16px",
                cursor:"pointer"
              }}
            >
              + New Journal
            </button>

{/* logout bttn */}
            <button
              onClick={handleLogout}
              style={{
                background:"#FFA0AC",
                color:"#fff",
                padding:"12px 20px",
                borderRadius:"8px",
                fontSize:"16px",
                cursor:"pointer"
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <div style={{marginBottom:"20px"}}>
          <label
            htmlFor="journalSelect"
            style={{
              fontWeight:"bold",
              color:"#4B6B46",
              fontSize:"1.5rem"
            }}
          >
            Select Journal:
          </label>

          <select
            id="journalSelect"
            value={selectedJournal?.id || ""}
            onChange={(e) => {
              const j= journals.find(
                (jr)=> String(jr.id) === String(e.target.value)
              );

              setSelectedJournal(j || null);
              setSelectedPage(null);
              setEntry("");

              if (j) {
                loadPages(j.id);
                handleNewEntry(false);
              }
            }}
            style={{
              width:"100%",
              padding:"10px",
              fontSize:"16px",
              border:"solid #7C9E5B",
              borderRadius:"8px",
              marginTop:"8px"
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
            {promptBlock}

            <div style={{position:"relative", marginBottom:"20px"}}>
              {!editorReady && <SpinnerOverlay />}
              <div
                ref={authEditorContainerRef}
                id="auth-editor"
                style={{
                  border:"1px solid #7C9E5B",
                  borderRadius:"10px",
                  background:"#fff",
                  minHeight:"300px",
                  padding:"10px"
                }}
              />
            </div>

            <div style={{display:"flex", gap:"15px", marginBottom:"20px"}}>
              <button
                onClick={handleSaveToCloud}
                style={{
                  background:"#4B6B46",
                  color:"#fff",
                  padding:"12px 20px",
                  borderRadius:"8px",
                  fontSize:"16px",
                  cursor:"pointer"
                }}
              >
                ☁ Save to Supa-Cloud
              </button>

{/* new page bttn */}
              <button
                onClick={() => handleNewEntry(true)}
                style={{
                  background:"#7C9E5B",
                  color:"#fff",
                  padding:"12px 20px",
                  borderRadius:"8px",
                  fontSize:"16px",
                  cursor:"pointer"
                }}
              >
                New Page
              </button>

{/* Mood tracker bttn */}
              <button
                onClick={handleTrackMood}
                style={{
                  background:"#FFA0AC",
                  color:"#fff",
                  padding:"12px 20px",
                  borderRadius:"8px",
                  fontSize:"16px",
                  cursor:"pointer"
                }}
              >
                😊 Track My Mood
              </button>
            </div>

{/* page entries */}
            {pages.length > 0 && (
              <div
                style={{
                  background:"#dfcdcdff",
                  borderRadius:"10px",
                  padding:"20px",
                  boxShadow:"inset 0 4px 8px rgba(0,0,0,0.05)"
                }}
              >
                <h3
                  style={{
                    color:"#141e13ff",
                    fontWeight:"bold",
                    marginBottom:"10px"
                  }}
                >
                  📚 Pages in {selectedJournal.title}
                </h3>

                <ul
                  style={{
                    maxHeight:"300px",
                    overflowY:"auto",
                    listStyle:"none",
                    padding:0
                  }}
                >
                  {pages.map((p) => (
                    <li
                      key={p.id}
                      style={{
                        display:"flex",
                        justifyContent:"space-between",
                        alignItems:"center",
                        padding:"8px 0",
                        borderBottom:"1px solid #e0e0e0"
                      }}
                    >
                      <span
                        onClick={() => {
                          setSelectedPage(p);
                          setEntry(p.entry);
                        }}
                        style={{
                          color:"#141e13ff",
                          fontWeight:"500",
                          cursor:"pointer",
                          textDecoration:"underline"
                        }}
                      >
                        {new Date(p.created_at).toLocaleString()}
                      </span>

{/* delete */}
          <button
           onClick={() => handleDeletePage(p.id)}
             style={{
            background:"none",
             border:"none",
              color:"#fc0505ff",
             fontSize:"14px",
               cursor:"pointer"
                        }}
                      >
                        Delete!
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {message && (
          <p
            style={{
              color:"#B0346E",
              textAlign:"center",
              fontWeight:"bold",
              marginTop:"20px"
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
