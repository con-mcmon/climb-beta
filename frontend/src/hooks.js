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

function useDivSize(ref) {
  const [divSize, setDivSize] = useState({ x: 0, y: 0 });
  const updateDivSize = () => {
    if (ref.current) {
      setDivSize({
        x: ref.current.offsetWidth,
        y: ref.current.offsetHeight
        })
      }
    }

  useEffect(() => updateDivSize(), []);
  useEffect(() => {
    window.addEventListener('resize', updateDivSize);
    return () => window.removeEventListener('resize', updateDivSize);
  })

  return divSize;
}

function useDivCenter(ref, coordinates) {
  const divSize = useDivSize(ref);
  
  const [center, setCenter] = useState({ x: 0, y: 0 });
  useEffect(() => {
    setCenter({
        x: coordinates.x - (divSize.x / 2),
        y: coordinates.y - (divSize.y / 2)
      });
  }, [coordinates, divSize])

  return center;
}

export { useDivCenter }
