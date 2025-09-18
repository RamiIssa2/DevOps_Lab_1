import ReactDOM from 'react-dom/client';

// Mock App to avoid rendering the full tree
jest.mock('../App', () => () => <div>Mocked App</div>);

// Mock reportWebVitals so it doesn’t actually run
jest.mock('../reportWebVitals', () => jest.fn());

// Mock createRoot to prevent actual rendering
const mockRender = jest.fn();
jest.spyOn(ReactDOM, 'createRoot').mockImplementation(() => ({
  render: mockRender,
}));

// Add a root div to the document so getElementById works
beforeAll(() => {
  const root = document.createElement('div');
  root.setAttribute('id', 'root');
  document.body.appendChild(root);
});

test('renders App without crashing', () => {
  require('../index.js'); // Import after mocks are set
  expect(ReactDOM.createRoot).toHaveBeenCalled();
  expect(mockRender).toHaveBeenCalled();
});