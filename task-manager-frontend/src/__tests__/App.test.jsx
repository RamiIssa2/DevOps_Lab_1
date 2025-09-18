import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders Task Manager header', () => {
  render(<App />);
  expect(screen.getByText(/task manager/i)).toBeInTheDocument();
});