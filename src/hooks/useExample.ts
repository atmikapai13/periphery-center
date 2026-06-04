import { useState, useEffect } from 'react';

// Example custom hook
function useExample(initialValue) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    // Example effect
    console.log('Value changed:', value);
  }, [value]);

  return [value, setValue];
}

export default useExample;
