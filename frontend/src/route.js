import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { toPx, percentToPx, pxToPercent } from './helpers';
import { Hold, Crux } from './holds';
import { Beta } from './beta';
import { useDivSize, useKey } from './hooks';

function Route(props) {
  const [toolBox, setToolbox] = useState(null);

  const escKeyDown = useKey(27);
  useEffect(() => {
    if (escKeyDown) {
      setToolbox(null);
      }
    }, [escKeyDown])

  const image = useRef();
  const imageDimensions = useDivSize(image);

  const handleImageLoad = (e) => {
    imageDimensions.x = e.target.width;
    imageDimensions.y = e.target.height;
  }

  const renderCruxs = () => {
    return props.crux.map(({ coords }, index) => {
      const { x, y } = percentToPx(coords.x, coords.y, imageDimensions.x, imageDimensions.y);
      return <Crux
                coordinates={{ x:x, y:y }}
                key={index}
                id={index}
                handleClick={props.handleCruxClick} />
              })
            }

  //Hold
  const renderHolds = () => {
    return props.holds.map(({ id, type, coordinates, note, position }) => {
        const coords = percentToPx(coordinates.x, coordinates.y, imageDimensions.x, imageDimensions.y);
        return <Hold
                  key={id}
                  id={id}
                  position={position}
                  hovered={props.selectedHold === id}
                  type={type}
                  coordinates={{ x:coords.x, y:coords.y }}
                  note={note}
                  containerDimensions={{ x: imageDimensions.x, y: imageDimensions.y}}
                  handleMouseMove={handleMouseMove}
                  handleMouseOver={props.handleHoldMouseOver}
                  handleDeleteClick={deleteHold} /> })
    }

  const deleteHold = (id) => props.deleteHold(id);

  const handleMouseMove = (id, xCoord, yCoord) => {
    const { x, y } = pxToPercent(xCoord, yCoord, imageDimensions.x, imageDimensions.y);
    props.handleMouseMove(id, x, y);
  }

  const swapHoldID = (id, down) => props.swapHoldID(id, down);

  //Beta
  const renderBeta = () => props.beta.map(({ _id, holds }) => <Beta id={_id} holds={holds} key={_id} imageDimensions={imageDimensions} />);

  //ToolBox
  const handleClick = (e) => {
    setToolbox(
      <ToolBox
        coordinates={{ x:e.nativeEvent.offsetX, y:e.nativeEvent.offsetY }}
        handleClick={handleToolBoxClick}
        handleCloseClick={() => setToolbox(null)} /> )
      }

  const handleToolBoxClick = (type, xCoord, yCoord) => {
    const { x, y } = pxToPercent(xCoord, yCoord, imageDimensions.x, imageDimensions.y);
    props.addHold(type, x, y, props.name);
    setToolbox(null);
  }

  const handleUploadBetaClick = () => {
    axios.post(`/beta/${props.id}`, props.holds)
      .then((res) => console.log(res))
      .catch((err) => console.error(err))
  }

  return (
    <div className='route' style={props.style} >
      <img
        ref={image}
        onLoad={handleImageLoad}
        src={props.image}
        alt={props.name}
        onClick={handleClick} />
      {props.crux ? renderCruxs() : null}
      {renderHolds()}
      {renderBeta()}
      {toolBox}
      {!props.parent ? <button onClick={props.handleCloseClick}>Close</button> : null}
      <button onClick={handleUploadBetaClick}>Upload Beta</button>
    </div>
    )
  }

function ToolBox(props) {
  const { x, y } = props.coordinates;
  const handleClick = (e) => {
    props.handleClick(e.target.value, x, y);
  }

  return (
    <div className='tool-box' style={{ left:toPx(x), top:toPx(y) }}>
      <button onClick={handleClick} value={'foot-right'}>Right Foot</button>
      <button onClick={handleClick} value={'foot-left'}>Left Foot</button>
      <button onClick={handleClick} value={'hand-right'}>Right Hand</button>
      <button onClick={handleClick} value={'hand-left'}>Left Hand</button>
      <button onClick={() => props.handleCloseClick()}>Exit</button>
    </div>
  )
}

export { Route };
