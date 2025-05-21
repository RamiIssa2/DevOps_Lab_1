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
      <div class="title_input">
        <label for="title">Title:</label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
      </div>
      <div class="description_input">
        <label for="description">Description:</label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
      </div>
      <button type="submit">Add Task</button>
    </form>
  );
}
