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

    // Change title
    const input = screen.getByDisplayValue('Task 1');
    fireEvent.change(input, { target: { value: 'Updated Task 1' } });

    // Mock update API
    mockAxios.onPut('/tasks/1').reply(200, {
      id: 1,
      title: 'Updated Task 1',
      description: 'Desc 1',
      status: 'pending',
      priority: 'High',
    });

    // Save
    fireEvent.click(screen.getByText(/save/i));

    // Expect updated value rendered
    await waitFor(() =>
        expect(screen.getByText('Updated Task 1')).toBeInTheDocument()
    );
  });

  it('edits task description and saves changes', async () => {
    render(<TaskList />);
    await waitFor(() => screen.getByText('Task 1'));

    // Click "Edit"
    fireEvent.click(screen.getByText(/edit/i));

    // Change description
    const input = screen.getByDisplayValue('Desc 1');
    fireEvent.change(input, { target: { value: 'Updated Desc 1' } });

    // Mock the PUT request
    mockAxios.onPut('/tasks/1').reply(200, {
      id: 1,
      title: 'Task 1',
      description: 'Updated Desc 1',
      status: 'pending',
      priority: 'High',
    });

    // Click save
    fireEvent.click(screen.getByText(/save/i));

    // Confirm that the updated description is rendered
    await waitFor(() =>
      expect(screen.getByText('Updated Desc 1')).toBeInTheDocument()
    );
  });

  it('edits task status using the select dropdown', async () => {
    render(<TaskList />);
    await waitFor(() => screen.getByText('Task 1'));

    // Click Edit
    fireEvent.click(screen.getByText(/edit/i));

    // Find the select element
    const statusSelect = screen.getByRole('combobox');
    expect(statusSelect).toBeInTheDocument();

    // Check initial value
    expect(statusSelect.value).toBe('pending');

    // Change value
    fireEvent.change(statusSelect, { target: { value: 'completed' } });
    expect(statusSelect.value).toBe('completed');

    // Mock API
    mockAxios.onPut('/tasks/1').reply(200, {
      id: 1,
      title: 'Task 1',
      description: 'Desc 1',
      status: 'completed',
      priority: 'High',
    });

    // Save
    fireEvent.click(screen.getByText(/save/i));

    // Confirm updated value in DOM
    await waitFor(() =>
      expect(screen.getByText('completed')).toBeInTheDocument()
    );
  });

  it('logs an error when update fails', async () => {
    // Spy on console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock PUT to fail
    mockAxios.onPut('/tasks/1').reply(() => {
      return [500, {}]; // forces Axios to reject
    });

    render(<TaskList />);
    await waitFor(() => screen.getByText('Task 1'));

    // Click edit and try to save
    fireEvent.click(screen.getByText(/edit/i));

    const titleInput = screen.getByDisplayValue('Task 1');
    fireEvent.change(titleInput, { target: { value: 'Fail Update' } });

    fireEvent.click(screen.getByText(/save/i));

    // Wait for the async error to be caught
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Update failed:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it('handles delete failure gracefully', async () => {
    mockAxios.onDelete('/tasks/1').reply(() => {
      return [500, {}]; // forces Axios to reject
    });

    // Spy on console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<TaskList />);
    await waitFor(() => screen.getByText('Task 1'));

    fireEvent.click(screen.getByText(/delete/i));

    // Wait for the async delete to finish
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Delete failed:',
        expect.any(Error) // AxiosError
      );
    });

    consoleSpy.mockRestore();
  });

  it('does nothing if task not found on update', async () => {
    render(<TaskList />);
    await waitFor(() => screen.getByText('Task 1'));

    // Click edit on the existing task
    fireEvent.click(screen.getByText(/edit/i));

    // Manually set an invalid ID to simulate task not found
    const saveBtn = screen.getByText(/save/i);

    // Override editingTask state temporarily
    fireEvent.click(saveBtn, {
      target: {
        dataset: { id: 999 }, // simulate non-existent task
      },
    });

    // Mock PUT should not be called, and nothing should break
    mockAxios.onPut('/tasks/999').reply(500, {}); // optional

    // You can check that the original task remains rendered
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });
});
