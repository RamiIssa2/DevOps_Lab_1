import { useState } from 'react';
import API from '../api';

export default function TaskForm({ onTaskCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!['pending', 'completed'].includes(status)) {
      alert('Status must be "pending" or "completed".');
      return;
    }
    const res = await API.post('/tasks', { title, description, status });
    setTitle('');
    setDescription('');
    setStatus('pending');
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
      <div className="status_input">
        <label for="status">Status:</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <button type="submit">Add Task</button>
    </form>
  );
}
