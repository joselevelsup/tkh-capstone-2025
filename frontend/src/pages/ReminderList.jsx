import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

export default Reminder;
function Reminder({userId}){
    const [reminder, setReminder] = useState([]);
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [editingId, setEditingId] = useState(null);


    useEffect(() => {
        const fetchReminder = async () =>{
            const {data, error} = await supabase
            .from('reminder')
            .select('*')
            .eq('user_Id', userId);

            if(error){
                console.error('Error fetch reminder', error);
            } else {
                setReminder(data);
            }
        };
        fetchReminder();
    },[userId])

   const addReminder = async (e) => {
  e.preventDefault();

  const { data, error } = await supabase
    .from('reminder')
    .insert({
      title,
      due_date: dueDate,
      user_Id: userId
    })
    .select();

  console.log("Insert result:", data);
  console.error("Insert error:", error);

  if (error) {
    alert("Insert failed: " + error.message);
    return;
  }

  setReminder([...reminder, data[0]]);
  setTitle('');
  setDueDate('');
 };


        const startEdit = (reminder) =>{
            setEditingId(reminder.id);
            setTitle(reminder.title);
            setDueDate(reminder.due_date);
        };

        const saveEdit = async(e) =>{
            e.preventDefault();

            const {data, error} = await supabase
            .from('reminder')
            .update({
                title,
                due_date:dueDate
            })
            .eq('id', editingId)
            .select();

            if(error) console.error('Error editing reminder', error);
                else{
                    setReminder(
                        reminder.map((r)=> (r.id === editingId ? data[0]:r))
                    );
                    setEditingId(null);
                    setTitle('');
                    setDueDate('');
            }
        };

        const deleteReminder = async (id) =>{
            const {error} = await supabase
            .from ('reminder')
            .delete()
            .eq('id', id);

            if (error) console.error('Error deleting reminder:', error);
            else{
                setReminder(reminder.filter((r)=> r.id !== id ));
            }
        };

    return (
    <div className='bg-rose-400 max-h-100' >
    <div className="max-w-xl mx-auto p-6 bg-red-200 shadow rounded space-y-6">
      <h2 className="text-2xl font-semibold font-(family-name:--sveria-serif-libre) text-rose-800">Your Reminders</h2>
      <form onSubmit={editingId ? saveEdit : addReminder} className="space-y-4">
        <input
          type="text"
          placeholder="Reminder title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
         className="w-full p-2 border border-rose-700 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"

        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
         className="w-full p-2 border border-rose-700 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"

        />

      <div className="flex gap-3">
        <button type="submit"
        className="px-4 py-2 bg-emerald-300 text-white rounded hover:bg-blue-700 transition"
          >
          {editingId ? 'Save Changes' : 'Add Reminder'}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setTitle('');
              setDueDate('');
            }}
           className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        )}
        </div>
      </form>

      <ul className="space-y-3">
        {reminder.map((r) => (
          <li key={r.id}
          className="flex justify-between items-center p-3 border rounded bg-green-100"
          >
           <span className="text-gray-800">
          <span className="font-medium">{r.title}</span> —{" "}
          <span className="text-gray-600">Due: {r.due_date}</span>
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => startEdit(r)}
            className="px-3 py-1 text-sm bg-yellow-200 text-gray-600 rounded hover:bg-yellow-400 transition"
          >
            Edit
          </button>
          <button
            onClick={() => deleteReminder(r.id)}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </li>
        ))}
      </ul>
    </div>
    </div>
  );
}