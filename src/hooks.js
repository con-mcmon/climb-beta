import { useState, useEffect } from 'react';

function useEscKey() {
  const [keyDown, setKeyDown] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.keyCode === 27) {
        setKeyDown(true);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    })

  return keyDown;
}
