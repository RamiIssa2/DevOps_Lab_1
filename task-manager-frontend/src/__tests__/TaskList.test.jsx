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
});
