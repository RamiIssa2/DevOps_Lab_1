import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import './App.css';

function App() {
  return (
    <div>
      <h1>Task Manager</h1>
      <TaskForm onTaskCreated={() => window.location.reload()} />
      <TaskList />
    </div>
  );
}

export default App;
