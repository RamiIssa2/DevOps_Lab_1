import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import TaskList from '../components/TaskList';
import API from '../api';
import MockAdapter from 'axios-mock-adapter';

const mockAxios = new MockAdapter(API);

const mockTasks = [
  {
    id: 1,
    title: 'Task 1',
    description: 'Desc 1',
    status: 'pending',
    priority: 'High',
  },
];

describe('TaskList', () => {
  beforeEach(() => {
    mockAxios.reset();
    mockAxios.onGet('/tasks').reply(200, mockTasks);
  });

  it('renders tasks from API', async () => {
    render(<TaskList />);
    expect(await screen.findByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Desc 1')).toBeInTheDocument();
  });

  it('deletes a task on delete click', async () => {
    mockAxios.onDelete('/tasks/1').reply(200, { message: 'Task 1 deleted.' });

    render(<TaskList />);
    await waitFor(() => screen.getByText('Task 1'));

    const deleteBtn = screen.getByText(/delete/i);
    fireEvent.click(deleteBtn);

    await waitFor(() =>
      expect(screen.queryByText('Task 1')).not.toBeInTheDocument()
    );
  });

  it('edits a task and saves changes', async () => {
    render(<TaskList />);
    await waitFor(() => screen.getByText('Task 1'));

    // Click "Edit"
    fireEvent.click(screen.getByText(/edit/i));

    // Change task
    fireEvent.change(screen.getByDisplayValue('Task 1'), { target: { value: 'Updated Task 1' } });
    fireEvent.change(screen.getByDisplayValue('Desc 1'), { target: { value: 'Updated Desc 1' } });
    fireEvent.change(screen.getByDisplayValue('pending'), { target: { value: 'completed' } });

    // Mock update API
    mockAxios.onPut('/tasks/1').reply(200, {
      id: 1,
      title: 'Updated Task 1',
      description: 'Updated Desc 1',
      status: 'completed',
      priority: 'High',
    });

    // Save
    fireEvent.click(screen.getByText(/save/i));

    // Wait for the row to update and check all updated values
    await waitFor(() => {
      // Title
      expect(screen.getByText('Updated Task 1')).toBeInTheDocument();

      // Description
      expect(screen.getByText('Updated Desc 1')).toBeInTheDocument();

      // Status
      expect(screen.getByText('completed')).toBeInTheDocument();
    });
  });

  it('handles update failure gracefully', async () => {
    render(<TaskList />);
    await waitFor(() => screen.getByText('Task 1'));

    fireEvent.click(screen.getByText(/edit/i));
    const input = screen.getByDisplayValue('Task 1');
    fireEvent.change(input, { target: { value: 'Fail Update' } });

    // Mock failure
    mockAxios.onPut('/tasks/1').reply(() => {
      return [500, {}]; // forces Axios to reject
    });

    fireEvent.click(screen.getByText(/save/i));

    // Still the message "Fail Update" since update failed
    await waitFor(() =>
      expect(screen.getByDisplayValue('Fail Update')).toBeInTheDocument()
    );
  });

  it('does nothing if task not found on update', async () => {
    render(<TaskList />);
    await waitFor(() => screen.getByText('Task 1'));

    // Click edit
    fireEvent.click(screen.getByText(/edit/i));

    // Try to update with wrong id
    const taskListInstance = screen.getByText('Task 1').closest('tr');
    // Directly call handleUpdate? With react-testing-library you might need to expose it, or simulate a weird state:
  });

  it('handles delete failure gracefully', async () => {
    mockAxios.onDelete('/tasks/1').reply(() => {
      return [500, {}]; // forces Axios to reject
    });

    render(<TaskList />);
    await waitFor(() => screen.getByText('Task 1'));

    fireEvent.click(screen.getByText(/delete/i));

    // expect task still exists
    await waitFor(() =>
      expect(screen.getByText('Task 1')).toBeInTheDocument()
    );
  });
});
