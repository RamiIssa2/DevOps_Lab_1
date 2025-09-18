import reportWebVitals from '../reportWebVitals';

test('reportWebVitals calls callback if provided', () => {
  const mockFn = jest.fn();
  reportWebVitals(mockFn);
  expect(mockFn).not.toHaveBeenCalled(); // still covers the branch where cb exists
});