import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import supabase from "../src/supabaseClient";

export default function Journal() {
  const [entry, setEntry]= useState("");
  const [message, setMessage]= useState("");
  const [pastEntries, setPastEntries]= useState([]);
  const navigate= useNavigate();



  // User selects “Save to Cloud”
  async function handleSave() {
    try {if (!entry.trim()) {setMessage("Cannot save an empty entry!");
        return;}

      //Loading message
 setMessage("Saving your entry to cloud...");
 //removes extra spaces
      const safeEntry = entry.trim();

//saving file and name
      const fileName= `entry-${Date.now()}.txt`;
      const filePath= `test1/${fileName}`;

//blob = binary large object-turn it into an uploadable file
      const file= new Blob([safeEntry], {type:"text/plain"});

// go to stoarge bucket! upsert=replace
const {data,error}= await supabase.storage.from("journal-pages").upload(filePath, file, { upsert: true });

      if (error) {
        console.error("Storage upload error:", error);
        setMessage("❌ Could not save entry, please try again: " + error.message);
        return;
      }

//message to user
      setMessage(`✅ Saved to Supa-Cloud!: ${fileName}`);
   setEntry("");} 
   catch (err) {
      console.error(err);
      setMessage("❌ Unexpected error: "+ err.message);
    }
  }


  // click to get past entry..FIRST FOLDER FOR STORAGE BUCKET = TEST1
  async function fetchPastEntries() {
    try {const {data, error} = await supabase.storage.from("journal-pages").list("test1");
      if (error) {console.error("Error fetching past entries:", error);
        setMessage("❌ Could not load past entries: " + error.message);
        return;}


    //click to see entry--takes user to their past entry
      const entriesWithUrl = data.map((file) => ({
        name: file.name, url: `https://noaluqpffmzdnbrkfipl.supabase.co/storage/v1/object/public/journal-pages/test1/${file.name}`,
      }));

      setPastEntries(entriesWithUrl);
    } catch (err) {
      console.error(err);
      setMessage("❌ Unexpected error, please try again: " + err.message);
    }
  }


  //New entry function
  function handleNew() {setEntry("");setMessage("📝 New journal entry started!");
  }

  //View achievements function
  function handleViewAchievements() {
    navigate("/achievement");}




  return (
    <div
      style={{
        backgroundColor: "#7B886F",
        minHeight: "100vh", 
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        fontFamily: "Averia Serif Libre, serif",
        color: "#fff",
        padding: "40px 0",
      }}
    >
      <div
        style={{
          backgroundColor: "#DDE0D0",
          color: "#000000ff",
          padding: "30px",
          width: "90%",
          maxWidth: "700px",
          borderRadius: "20px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
        }}
      >
        <h1>📝My Journal</h1>

        <textarea
          placeholder="Write anything here..."
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          style={{
            width: "100%",
            height: "150px",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #aaa",
            resize: "vertical",
          }}
        />



        {/* Bttns */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "15px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handleSave}
            style={{
              backgroundColor: "#4B6B46",
              color: "#fff",
              borderRadius: "10px",
            }}
          >Save to "Supa-Cloud"</button>

          <button
            onClick={handleNew}
            style={{
              backgroundColor: "#7C9E5B",
              color: "#fff",
              borderRadius: "10px",
            }}
          >New Entry</button>

          <button
            onClick={fetchPastEntries}
            style={{
              backgroundColor: "#FEFFA5",
              color: "#b0346eff",
              borderRadius: "12px",
            }}
          >Show Past Entries</button>
        </div>


        {/* Message to user */}
        {message && (
          <p
            style={{
              color: "#d01414ff",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >{message}</p>
        )}


        {/*Past Entries-added the dynamic dims for the list*/}
        {pastEntries.length > 0 && (
          <div
            style={{
              marginTop: "20px",
              backgroundColor: "#f9f9f9",
              borderRadius: "10px",
              padding: "15px",
            }}>


 {/* past entries list */}

<h4>My Past Entries:</h4>
    <ul style={{paddingLeft:"20px"}}>
      {pastEntries.map((file) => (
      <li key={file.name} style={{ marginBottom: "5px" }}>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{color: "#4B6B46", textDecoration:"underline" }}>
                    {file.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

    <div style={{textAlign:"center"}}>
          <h3>The more you reflect, the greater the reward!</h3>

<button onClick={handleViewAchievements}
            style={{
              backgroundColor: "#FEFFA5",
              color: "#b0346eff",
              borderRadius: "12px",
            }}>View Achievements</button>
        </div>
      </div>
    </div>
  );
}
