import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskForm from '../components/TaskForm';
import API from '../api';
import MockAdapter from 'axios-mock-adapter';

const mockAxios = new MockAdapter(API);

describe('TaskForm', () => {
  it('submits the task form and resets fields', async () => {
    const onTaskCreated = jest.fn();

    mockAxios.onPost('/tasks').reply(201, {
      id: 1,
      title: 'Test Task',
      description: 'Test description',
      status: 'pending',
      priority: 'Medium',
    });

    render(<TaskForm onTaskCreated={onTaskCreated} />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Task' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test description' },
    });
    fireEvent.change(screen.getByLabelText(/status/i), {
      target: { value: 'pending' },
    });

    fireEvent.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(onTaskCreated).toHaveBeenCalled();
    });

    // Optional: check if fields reset
    expect(screen.getByLabelText(/title/i).value).toBe('');
    expect(screen.getByLabelText(/description/i).value).toBe('');
  });
});
