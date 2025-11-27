import React from "react";

export default function About() {
  const teamMembers= [
    {name: "Dominique Bullard", 
      avatar: "d-avatar.png"
    },
    
    {
      name: "Mya Walker",
      linkedin: "https://www.linkedin.com/in/mya-walker/",
      avatar: "m-avatar.png",
    },

    {
      name: "Elijah Reed",
      email: "ejreed328@gmail.com",
      linkedin: "https://www.linkedin.com/in/elijah-reed-0b0b42351/",
      avatar: "e-avatar.png",
    },
    
    {
      name: "Pauriany Segarra",
      email: "pauriany@gmail.com",
      linkedin: "https://www.linkedin.com/in/pauriany",
      avatar: "p-avatar.png",
    },
  ];

  /* -----------------------------------------------------------------------
      about us animation
  ----------------------------------------------------------------------- */
  const animatedAbout = ["A", "b", "o", "u", "t", "\u00A0", "U", "s"].map(
    (letter, i) => (
      <span
        key={i}
        style={{
          opacity: 0,
          animation: `fadeInLetter 0.6s ease forwards`,
          animationDelay: `${i * 0.25}s`,
          display: "inline-block",
        }}
      >
        {letter}
      </span>
    )
  );

  const animationStyles = `
    @keyframes fadeInLetter {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;

  /* -----------------------------------------------------------------------
    section styles, matching journal page style
  ----------------------------------------------------------------------- */
  const sectionBaseStyle= {
    borderLeft:"6px solid #3c2d34ff",
    paddingLeft:"20px",
  };

  return (
    <div
      className="min-h-screen flex justify-center px-6 py-12"
      style={{
        background:"linear-gradient(to bottom, #fdebebff, #556B2F, #d9d8aeff)",
        fontFamily:"'Averia Serif Libre', serif",
      }}
    >
    <style>{animationStyles}</style>

<div className="max-w-5xl w-full bg-[#FFFFFF] rounded-2xl p-10 shadow-xl">
      <div className="flex flex-col items-center mb-12">
          
  {/* glow for icon */}
          <div className="relative mb-6">
            <div className="absolute inset-0 blur-2xl" style={{background:
                "radial-gradient(circle, rgba(255,200,100,0.45), rgba(0,0,0,0))",
              }}
            />
  {/* reuse icon from the public folder */}
            <img 
              src="/color-me-happy-icon.png"
              className="w-56 h-auto relative drop-shadow-xl"
              alt="Color Me Happy Logo"
            />
          </div>

  {/* About Us animated letters */}
          <h1
            className="text-6xl font-bold text-center"
            style={{color: "#333" }}
          >
            {animatedAbout}
          </h1>
        </div>

  {/* About */}
        <section className="mb-16 rounded-xl" style={sectionBaseStyle}>
          <p className="text-xl text-[#141e13]">
            Color Me Happy is a supportive journaling space designed to help you
            slow down, check in with yourself, and care for your well-being
            through writing and gentle reflection.
          </p>
        </section>

  {/* Purpose */}
        <section className="mb-16 rounded-xl" style={sectionBaseStyle}>
          <h2
            className="text-3xl font-semibold mb-4"
            style={{color: "#4B6B46" }}
          >
            Purpose
          </h2>
          <p className="text-xl text-[#141e13]">
            This project blends emotional wellness with hands-on full-stack
            development. Our mission is to support mental health by promoting
            reflection, positive habits, and emotional awareness.
          </p>
        </section>

{/* Objectives */}
        <section className="mb-20 rounded-xl" style={sectionBaseStyle}>
          <h2
            className="text-3xl font-semibold mb-4"
            style={{color: "#4B6B46" }}
          >
            Objectives
          </h2>
          <ul className="text-xl text-[#656] space-y-2">
            <li>🧠 Build journaling and reflection routines</li>
            <li>🧠 Help users notice emotional patterns</li>
            <li>🧠 Provide reminders for consistency</li>
          </ul>
        </section>

{/* Team Section */}
    <h2 className="text-3xl text-center font-semibold mb-10" style={{ color: "#333"}}
        >
          Meet the Team
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {teamMembers.map((member, i) => (
            <div key={i} className="text-center flex flex-col items-center">


{/* add avatar 11/25 */} 
{member.avatar && ( <div className="w-28 h-28 rounded-full overflow-hidden shadow-sm mb-3"> <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" /> </div> )}

       <p className="text-xl font-semibold text-[#141e13]">
        {member.name}
        </p>

        {member.email && (
           <a
          href={`mailto:${member.email}`}
          className="text-sm underline text-[#4B6B46] mt-1"
         >
           {member.email}
              </a>
              )}

  {(member.linkedin) && (
    <div className="flex gap-3 mt-2 text-[#4B6B46]">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      className="underline text-sm"
                    >
                      LinkedIn
                    </a>
                  )}
                 
                
                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
