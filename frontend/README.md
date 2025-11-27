# Color Me Happy

Color Me Happy is a mindful journaling application with built-in mood tracking and a meditation timer 🧘🏽‍♀️. Users can journal as guests using local browser storage or create accounts with Supabase authentication.  

Built as part of The Knowledge House 2025 Capstone.

---

## Features

- Rich text journaling (headings, lists, bold, quotes, links)
- Mood selection with each entry
- Meditation timer with presets and optional audio
- Local storage for guest users
- Supabase authentication and storage for registered users
- Markdown Edit / Raw / Preview modes

---

## Tech Stack

- React (Vite)
- React Router v6
- Tailwind CSS
- Supabase Auth
- Local Storage (guest mode)
- Overtype dev (text-editor for Guest and Auth)
- Optional audio upload + external music links

---

## Color Palette
#F8DADA  Background
#F4EAF3  Soft Accent
#2F3141  Primary Text
#E6A5BD  Highlight
#E8D3F7  Meditation Panel
### Color inspiration for overall project
<img width="1600" height="1200" alt="palette (5)" src="https://github.com/user-attachments/assets/7ff83b74-5027-4919-8c01-a70de4e0f167" />


## Technologies / Credit
### Heroicons (Outline Set)
Color Me Happy uses **Heroicons Outline** for UI icons such as the **question mark icon** (Home page) and the **open-book icon** (Sign-Up & Login pages).  
Documentation & icons: https://heroicons.com/outline

![Home Page](public/home.png)
![Sign Up Page](public/signup.png)
![Login Page](public/login.png)
![Guest Journal Page](public/guestjournal.png)
![Journal One](public/journal1.png)
![Reminders](public/reminders.png)
![Meditation Timer](public/mediationtimer.png)
![Achievement Page](public/achievement.png)
### Overtype Editor
Color Me Happy uses the **Overtype rich-text editor** for journaling and markdown editing.  
Overtype provides Edit, Raw Markdown, and Preview modes for a smooth writing experience.

Documentation: https://overtype.dev  
CDN Script used inside `index.html`:
<script src="https://unpkg.com/overtype/dist/overtype.min.js"></script>
### Team Avatars created by Dominique Bullard
- Logo concept designed using AI-assisted tools.
---

## UI Previews
- Home Page<img width="2439" height="1167" alt="color me happy-home page" src="https://github.com/user-attachments/assets/208f404f-5de0-4660-abb9-380daf0433c3" />
- Journal Page<img width="1901" height="1180" alt="color-me-happy-journalpage" src="https://github.com/user-attachments/assets/7e24b4ee-fab4-4048-89b9-de81a065790f" />
- Meditation Timer<img width="1265" height="1011" alt="color-me-happy-medtimer" src="https://github.com/user-attachments/assets/d859841b-b459-431f-b629-c5ca9f6ed5a3" />
- Mood Tracker<img width="1395" height="1173" alt="color-me-happy-moodtracker" src="https://github.com/user-attachments/assets/118820ee-240f-4aba-8488-017d82d48aed" />

---

## Setup

Create a `.env` file in the project root:

VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here

---

Install and run:
npm install
npm run dev
npm install canvas-confetti

---

## Contributors

Developed by **The Knowledge House 2025 Web Development Cohort — Frontenders**  
- Mya Walker  
- Pauriany Segarra  
- Dominique Bullard  
- Elijah Reed  

---

## Credits
Icons used in this project are from [Heroicons](https://heroicons.com/), including:
- Question Mark Icon on Home Page
- Open Book Icon on Signup Page