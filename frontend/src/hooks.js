import { useState, useEffect } from 'react';

function useKey(code) {
  const [keyDown, setKeyDown] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.keyCode === code) {
        setKeyDown(true);
      }
    }
    const handleKeyUp = (e) => {
      if (e.keyCode === code) {
        setKeyDown(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    }
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

  useEffect(() => {
    updateDivSize();
    window.addEventListener('resize', updateDivSize);
    return () => window.removeEventListener('resize', updateDivSize);
    }, [])

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

function useClicked(ref) {
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const handleClick = (event) => {
        if (ref.current && ref.current.contains(event.target)) {
          setClicked(true);
        } else {
          setClicked(false);
        }
      }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
    }, [ref]);

  return clicked;
}

export { useDivSize, useDivCenter, useKey, useClicked }
