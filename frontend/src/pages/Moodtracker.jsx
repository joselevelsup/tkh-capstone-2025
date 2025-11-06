import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";
import HappyImg from "./images/Happy.png";
import ExcitedImg from "./images/Excited.png";
import AngryImg from "./images/Anger.png";
import ConfusedImg from "./images/Confused.png";
import SadImg from "./images/Sad.png";
import RageImg from "./images/Rage.png";
import NervousImg from "./images/Nervous.png";
import IndiffImg from "./images/Indifferent.png";
import "./moodtracker.css";

export default function Moodtracker() {
  const moods = ["happy", "sad", "angry", "excited", "rage", "confused", "nervous", "indifferent"];
  const moodImages = {
    happy: HappyImg,
    sad: SadImg,
    angry: AngryImg,
    excited: ExcitedImg,
    rage: RageImg,
    confused: ConfusedImg,
    nervous: NervousImg,
    indifferent: IndiffImg,
  };

  const today = new Date().toISOString().split("T")[0];

  const [selectedMood, setSelectedMood] = useState("");
  const [note, setNote] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [todayMood, setTodayMood] = useState("");
  const [pastMoods, setPastMoods] = useState([]);

  useEffect(() => {
    const loadMood = async () => {
      const { data, error } = await supabase
        .from("moods")
        .select("*")
        .eq("date", today)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching today's mood:", error);
        return;
      }

      if (data) {
        setSelectedMood(data.mood);
        setNote(data.note || "");
        setTodayMood(data.mood);
        document.body.classList.add(data.mood);
      }
    };

    loadMood();
  }, [today]);

  useEffect(() => {
    const loadPastMoods = async () => {
      const { data, error } = await supabase
        .from("mood")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching past mood:", error);
        return;
      }

      setPastMoods(data || []);
    };

    loadPastMoods();
  }, [saveMessage]); // reload when a new entry is saved

  // Update body color/theme
  useEffect(() => {
    document.body.classList.remove(...moods);
    if (selectedMood) document.body.classList.add(selectedMood);
  }, [selectedMood]);

 const handleSave = async () => {
  if (!selectedMood) {
    alert("Please select a mood.");
    return;
  }

  const { data, error } = await supabase
    .from("mood")
    .upsert({
      date: today,
      mood: selectedMood,
      note,
    });

  if (error) {
    console.error("Error saving mood:", error);
    setSaveMessage(`Error saving mood 😢 (${error.message})`);
    return;
  }

  setTodayMood(selectedMood);
  setSaveMessage("Your mood has been saved!");
};


  // Auto-hide save message
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  const loadPastFiles = async () => {
  const { data, error } = await supabase.storage.from("mood-entry").list("", {
    limit: 100,
    sortBy: { column: "name", order: "desc" },
  });

  if (error) {
    console.error("Error listing mood files:", error);
    return;
  }

  console.log("Mood files:", data); // [{ name: '2025-11-04.json' }, ...]
};

const viewMoodFile = async (fileName) => {
  const { data, error } = await supabase.storage
    .from("mood-entry")
    .download(fileName);
  if (data) {
    const text = await data.text();
    const json = JSON.parse(text);
    console.log(json);
  }
};


  return (
    <div className="container">
      <h1>Mood Tracker</h1>
      <p>Track your daily mood</p>

      <div className="mood-selector">
        {moods.map((mood) => (
          <button
            key={mood}
            className={`mood-btn ${selectedMood === mood ? "selected" : ""}`}
            onClick={() => setSelectedMood(mood)}
          >
            <img src={moodImages[mood]} alt={mood} />
          </button>
        ))}
      </div>

      <textarea
        id="note"
        placeholder="Add a note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button id="save-btn" onClick={handleSave}>Save</button>

      <h2>Your mood today</h2>
      <div id="today-mood">
        {todayMood ? (
          <p>
            Your mood: <span>{todayMood}</span>
          </p>
        ) : (
          <p>No mood logged yet for today.</p>
        )}
      </div>

      {saveMessage && <div id="save-message">{saveMessage}</div>}

      {/* 🕓 Past Mood Entries Section */}
      <div className="past-moods">
        <h2>Past Mood Entries</h2>
        {pastMoods.length === 0 ? (
          <p>No past entries yet.</p>
        ) : (
          <ul>
            {pastMoods.map((entry) => (
              <li key={entry.date}>
                <strong>{entry.date}</strong> — {entry.mood}
                {entry.note && <p className="note">📝 {entry.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
