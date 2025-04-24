import { useState } from 'react';
import API from '../api';

export default function TaskForm({ onTaskCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await API.post('/tasks', { title, description });
    setTitle('');
    setDescription('');
    onTaskCreated(); // Refresh task list
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
      <button type="submit">Add Task</button>
    </form>
  );
}
