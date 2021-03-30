import { useRef, useState, useEffect } from 'react';
import { toPx } from './helpers';
import blackCircle from './content/images/circle-black.png';
import redCircle from './content/images/circle-red.png';

function TouchNode(props) {
  const [hovered, setHovered] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const handleMouseLeave = () => {
    setMouseDown(false);
    setHovered(false);
  }

  const [divSize, setDivSize] = useState({ x: 0, y: 0 });
  const div = useRef();
  const updateDivSize = () => {
    if (div.current) {
      setDivSize({
        x: div.current.offsetWidth,
        y: div.current.offsetHeight
        })
      }
    }
  useEffect(() => updateDivSize(), []);
  useEffect(() => {
    window.addEventListener('resize', updateDivSize);
    return () => window.removeEventListener('resize', updateDivSize);
  })

  const [center, setCenter] = useState({ x: 0, y: 0 });
  useEffect(() => {
    setCenter({
        x: props.coordinates.x - (divSize.x / 2),
        y: props.coordinates.y - (divSize.y / 2)
      });
  }, [props.coordinates, divSize])

  const handleMouseMove = (event) => {
    if (mouseDown) {
      const [newX, newY] = [props.coordinates.x + event.movementX, props.coordinates.y + event.movementY];
      const insideContainer = (newX > 0 && newX < props.containerDimensions.x) && (newY > 0 && newY < props.containerDimensions.y);
      if (insideContainer) {
        props.handleMouseMove(props.id, newX, newY)
      }
    }
  }

  const handleNoteChange = (e) => {
    props.handleNoteChange(props.id, e.target.value);
  }

  const renderDetails = () => {
    return (
      <div className='touch-node-details'>
        <span className='touch-node'>{`${props.id}:${props.type}`}</span>
        <input type="text" value={props.note} onChange={handleNoteChange} />
        <button className='touch-node' onClick={() => props.handleDeleteClick(props.id)}>Delete</button>
      </div>
      )
  }

  const style = () => {
    let style = {
      left:toPx(center.x),
      top:toPx(center.y)
    };
    const color = props.type.split('-')[0] === 'foot' ? '#00ffd5' : '#ffff00';
    style.borderColor = color;

    const opacity = (hovered || mouseDown || props.hovered) ? 1.0 : 0.5;
    style.opacity = opacity;
    return style
  }

  return (
    <div
      ref={div}
      className='touch-node'
      style={style()}
      onMouseMove={handleMouseMove}
      onMouseDown={() => setMouseDown(true)}
      onMouseUp={() => setMouseDown(false)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave} >
      {mouseDown ? <div className='touch-node-bubble'></div> : null}
      {hovered ? renderDetails() : null}
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
