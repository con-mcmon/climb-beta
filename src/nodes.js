import React, { useRef, useState, useEffect } from 'react';
import { toPx } from './helpers';
import blackCircle from './content/images/circle-black.png';
import redCircle from './content/images/circle-red.png';
import blueCircle from './content/images/circle-blue.png';

function TouchNode(props) {
  const [hovered, setHovered] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const div = useRef();

  useEffect(() => {
    setCenter({
        x: props.coordinates.x - (div.current.offsetWidth / 2),
        y: props.coordinates.y - (div.current.offsetHeight / 2)
      })
  }, [props.coordinates])

  const handleMouseLeave = () => {
    setMouseDown(false);
    setHovered(false);
  }

  const handleMouseMove = (event) => {
    if (mouseDown) {
      const [x, y] = [props.coordinates.x + event.movementX, props.coordinates.y + event.movementY];
      const insideContainer = (x > 0 && x < props.containerDimensions.x) && (y > 0 && y < props.containerDimensions.y);
      if (insideContainer) {
        props.handleMouseMove(props.id, x, y)
      }
    }
  }

  return (
    <div
      ref={div}
      className='touch-node'
      style={{ left:toPx(center.x), top:toPx(center.y) }}
      onMouseMove={handleMouseMove}
      onMouseDown={() => setMouseDown(true)}
      onMouseUp={() => setMouseDown(false)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave} >
      <img
        src={blueCircle}
        className='touch-node'
        alt='touch node' />
      <span className='touch-node'>{hovered ? props.type : null}</span>
    </div>
    )
  }

function CruxNode(props) {
  const [hovered, setHovered] = useState(false);
  const { x, y } = props.coordinates;
  return (
    <img
      src={hovered ? redCircle : blackCircle}
      alt='crux node'
      className='crux-node'
      style={{ left:toPx(x), top:toPx(y) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => props.handleClick(props.id)} />
    )
  }

export { TouchNode, CruxNode };
