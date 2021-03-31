import { useRef, useState, useEffect } from 'react';
import { toPx } from './helpers';
import blackCircle from './content/images/circle-black.png';
import redCircle from './content/images/circle-red.png';

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

function TouchNodeDashboad(props) {
  const renderNodes = () => props.nodes.map(({ id, note, type, parent }) => <TouchNodeDetail
                                                                              id={id}
                                                                              note={note}
                                                                              type={type}
                                                                              hovered={id === props.selectedNode}
                                                                              handleMouseOver={props.handleMouseOver}
                                                                              handleNoteChange={props.handleNoteChange}
                                                                              handleDeleteClick={props.handleDeleteClick} />);
  return (
    <div className='dashboard' >
      {renderNodes()}
    </div>
  )
}

function TouchNodeDetail(props) {
  const [hovered, setHovered] = useState(false);
  const handleMouseOver = (hovered) => {
    setHovered(hovered);
    props.handleMouseOver(props.id, hovered);
  }

  const handleNoteChange = (e) => {
    props.handleNoteChange(props.id, e.target.value);
  }

  const style = () => {
    if (hovered || props.hovered) {
      return {
        backgroundColor: props.type.split('-')[0] === 'foot' ? styles.color.foot : styles.color.hand
      }
    }
  }

  return (
    <div
      className='touch-node-info'
      onMouseEnter={() => handleMouseOver(true)}
      onMouseLeave={() => handleMouseOver(false)}
      style={style()} >
      <img
        className='touch-node-info'
        //get close button icon
        src={redCircle}
        alt='exit'
        onClick={() => props.handleDeleteClick(props.id)} />
      <p className='touch-node-info id'>{props.id}</p>
      <p className='touch-node-info'>{props.type}</p>
      <label for='notes'>Notes</label>
      <input className='touch-node-info' type='text' id='notes' value={props.note} onChange={handleNoteChange} />
    </div>
  )
}

function TouchNode(props) {
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
      <div className='touch-node-details'>
        <span className='touch-node'>{`${props.id}:${props.type}`}</span>
        <button className='touch-node' onClick={() => props.handleDeleteClick(props.id)}>Delete</button>
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

    const opacity = (hovered || mouseDown || props.hovered) ? styles.opacity.hovered : styles.opacity.notHovered;
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
      onMouseEnter={() => handleMouseOver(true)}
      onMouseLeave={() => handleMouseOver(false)} >
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

export { TouchNodeDashboad, TouchNode, CruxNode };
