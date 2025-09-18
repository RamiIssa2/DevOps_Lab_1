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

    // Get the message "Fail Update" since update failed
    await waitFor(() =>
      expect(screen.getByDisplayValue('Fail Update')).toBeInTheDocument()
    );
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
});
