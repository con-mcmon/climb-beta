import { useRef, useState, useEffect } from 'react';
import { toPx } from './helpers';

const styles = {
  color: {
    foot: '#00ffd5',
    hand: '#ffff00'
  },
  opacity: {
    hovered: '1.0',
    notHovered: '0.3'
  }
}

function HoldDashboad(props) {
  const [draggedCard, setDraggedCard] = useState(null);

  const sortHolds = ( a, b ) => {
    if ( a.position < b.position ) {
      return -1;
    }
    if ( a.position > b.position ) {
      return 1;
    }
    return 0;
  }

  const renderHolds = () => {
    const sortedHolds = props.holds.sort(sortHolds);
    return sortedHolds.map(({ id, position, note, type }) => {
      return (
        <HoldCard
          id={id}
          position={position}
          key={id}
          note={note}
          type={type}
          hovered={id === props.selectedHold}
          handleMouseOver={props.handleMouseOver}
          handleNoteChange={props.handleNoteChange}
          handleDeleteClick={props.handleDeleteClick}
          setDraggedCard={(id) => setDraggedCard(id)}
          handleDrop={(id) => props.swapHoldPositions(draggedCard, id)} />
          )
        })
      }

  return (
    <div className='dashboard' >
      {renderHolds()}
    </div>
  )
}

function HoldCard(props) {
  const [hovered, setHovered] = useState(false);
  const handleMouseOver = (hovered) => {
    setHovered(hovered);
    props.handleMouseOver(props.id, hovered);
  }

  const [dragging, setDragging] = useState(false);
  const handleDragStart = () => {
    setDragging(true);
    props.setDraggedCard(props.id);
  }
  const handleDragEnd = () => {
    setDragging(false);
    props.setDraggedCard(null);
  }

  const [draggedOver, setDraggedOver] = useState(0);
  const handleDragEnter = (e) => {
    e.stopPropagation();
    setDraggedOver(true);
  }

  const handleDragLeave = (e) => {
    e.stopPropagation();
    setDraggedOver(false);
  }

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }

  const handleDrop = (e) => {
    setDraggedOver(false);
    props.handleDrop(props.id);
  }

  const [closeClickCount, setCloseClickCount] = useState(0);
  const handleCloseClick = () => {
    setCloseClickCount(1);
    if (closeClickCount === 1) {
      props.handleDeleteClick(props.id);
    }
  }

  useEffect(() => {
    let timeoutID;
    if (closeClickCount === 1) {
      timeoutID = setTimeout(() => setCloseClickCount(0), 1000);
    }
    return () => {
      clearTimeout(timeoutID);
    };
  }, [closeClickCount]);


  const handleNoteChange = (e) => {
    props.handleNoteChange(props.id, e.target.value);
  }

  const containerStyle = () => {
    let style = { };
    if (hovered || props.hovered) {
      style.backgroundColor = props.type.split('-')[0] === 'foot' ? styles.color.foot : styles.color.hand
    }
    if (draggedOver) {
      style.borderBottom = 'thick solid black';
    }
    return style;
  }

  const removePointerEvents = () => ({ pointerEvents: 'none' })

  const closeStyle = () => {
    let style = {};
    if (draggedOver) {
      style.pointerEvents = 'none';
    }
    if (closeClickCount === 1) {
      style.color = 'red';
    }
    return style;
  }

  return (
    <div
      className='hold-card'
      style={containerStyle()}
      onMouseEnter={() => handleMouseOver(true)}
      onMouseLeave={() => handleMouseOver(false)}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop} >
      <p
        className='hold-card-close'
        style={closeStyle()}
        onClick={handleCloseClick} >X</p>
      <p
        className='hold-card-position'
        style={draggedOver ? removePointerEvents() : null}>{props.position}</p>
      <p style={draggedOver ? removePointerEvents() : null}>{props.type}</p>
      <textarea
        style={draggedOver ? removePointerEvents() : null}
        rows={2}
        type='text'
        id='notes'
        value={props.note}
        onChange={handleNoteChange} />
    </div>
  )
}

function Hold(props) {
  const [hovered, setHovered] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const handleMouseOver = (hovered) => {
    setHovered(hovered);
    props.handleMouseOver(props.id, hovered);
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

  const renderDetails = () => {
    return (
      <div className='hold-details'>
        <span>{`${props.position}:${props.type}`}</span>
        <button onClick={() => props.handleDeleteClick(props.id)}>Delete</button>
      </div>
      )
  }

  const style = () => {
    let style = {
      left:toPx(center.x),
      top:toPx(center.y)
    };
    const color = props.type.split('-')[0] === 'foot' ? styles.color.foot : styles.color.hand;
    style.borderColor = color;
    style.opacity = (hovered || mouseDown || props.hovered) ? styles.opacity.hovered : styles.opacity.notHovered;
    return style
  }

  return (
    <div
      ref={div}
      className='hold'
      style={style()}
      onMouseMove={handleMouseMove}
      onMouseDown={() => setMouseDown(true)}
      onMouseUp={() => setMouseDown(false)}
      onMouseEnter={() => handleMouseOver(true)}
      onMouseLeave={() => handleMouseOver(false)} >
      {mouseDown ? <div className='hold-container'></div> : null}
      {hovered ? renderDetails() : null}
    </div>
    )
  }

function Crux(props) {
  const [hovered, setHovered] = useState(false);
  const style = () => {
    let style = { left:toPx(props.coordinates.x), top:toPx(props.coordinates.y) };
    style.opacity = hovered ? styles.opacity.hovered : styles.opacity.notHovered;
    style.color = '#1500ff';
    return style;
  }
  return (
    <span
      className='crux'
      style={style()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => props.handleClick(props.id)}>
      {`CRUX:${props.id + 1}`}</span>
    )
  }

export { HoldDashboad, Hold, Crux };
