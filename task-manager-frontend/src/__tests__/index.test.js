import ReactDOM from 'react-dom/client';

jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn(),
  })),
}));

test('renders App without crashing', () => {
  require('../index.js'); // triggers code
  expect(ReactDOM.createRoot).toHaveBeenCalled();
});