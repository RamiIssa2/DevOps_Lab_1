import { useEffect, useState } from 'react';
import API from '../api';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    const res = await API.get('/tasks');
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div>
      <h2>Task List</h2>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <strong>{task.title}</strong> — {task.description} — <em>{task.priority}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
