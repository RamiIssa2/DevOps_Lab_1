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

  const handleDelete = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div>
      <h2>Task List</h2>
      <table>
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>Priority</th>
          <th>Delete</th>
        </tr>
        {tasks.map(task => (
          <tr key={task.id}>
            <td>{task.title}</td>
            <td>{task.description}</td>
            <td>{task.priority}</td>
            <td class="delete_td">
              <button onClick={() => handleDelete(task.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}
