import { useEffect, useState } from 'react';
import API from '../api';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [updatedDescription, setUpdatedDescription] = useState('');
  const [updatedStatus, setUpdatedStatus] = useState('');

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

  const handleEditClick = (task) => {
    setEditingTask(task.id);
    setUpdatedTitle(task.title);
    setUpdatedDescription(task.description);
    setUpdatedStatus(task.status);
  };

  const handleUpdate = async (id) => {
    try {
      // Fetch the original task so we keep existing values
      const originalTask = tasks.find(task => task.id === id);

      const res = await API.put(`/tasks/${id}`, {
        title: updatedTitle,
        description: updatedDescription,
        status: updatedStatus,
        priority: originalTask.priority || 'Medium'
      });
      setTasks(tasks.map(task => task.id === id ? res.data : task));
      setEditingTask(null);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  return (
    <div>
      <h2>Task List</h2>
      <table>
        <colgroup>
          <col style={{ width: '20%' }} />
          <col style={{ width: '40%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '10%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td>
                {editingTask === task.id ? (
                  <input value={updatedTitle} onChange={e => setUpdatedTitle(e.target.value)} />
                ) : (
                  task.title
                )}
              </td>
              <td>
                {editingTask === task.id ? (
                  <textarea value={updatedDescription} onChange={e => setUpdatedDescription(e.target.value)} />
                ) : (
                  task.description
                )}
              </td>
              <td>
                {editingTask === task.id ? (
                  <select value={updatedStatus} onChange={e => setUpdatedStatus(e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                ) : (
                  task.status
                )}
              </td>
              <td>{task.priority}</td>
              <td className="actions_td">
                {editingTask === task.id ? (
                  <button className="save_btn" onClick={() => handleUpdate(task.id)}>Save</button>
                ) : (
                  <button className="edit_btn" onClick={() => handleEditClick(task)}>Edit</button>
                )}
                <button className="delete_btn" onClick={() => handleDelete(task.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
