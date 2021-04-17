import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { toPx, percentToPx, pxToPercent } from './helpers';
import { HoldDashboad, Hold, Crux } from './holds';
import { BetaDashboard, Beta } from './beta';
import { useDivSize, useKey } from './hooks';
import styles from './style';

function App(props) {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    const getRoutes = () => {
      axios.get('/routes')
        .then((res) => setRoutes(res.data))
        .catch((err) => console.error(err))
      }
    getRoutes();
    }, [])

  const renderRouteList = () => {
    return (
      <div>
        {routes.map(({ name, id }) => {
          return (
            <button
              id={id}
              onClick={handleRouteClick}
              key={name} >
              {name}
            </button> )
            })}
      </div> )
    }

  const handleRouteClick = (e) => {
    axios.get(`/routes/${e.target.id}`)
      .then((res) => setSelectedRoute(res.data))
      .catch((err) => console.error(err))
    }

  return (
    <div className='App' >
      <h1>Beta Builder</h1>
      {renderRouteList()}
      {selectedRoute ? <Content route={selectedRoute} /> : null}
    </div>
  )
}

function Content(props) {
  const [holds, setHolds] = useState([]);
  const [selectedHold, setSelectedHold] = useState(null);
  const [beta, setBeta] = useState([]);
  const [crux, setCrux] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.keyCode === 27) {
        setCrux(null);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return document.removeEventListener('keydown', handleKeyDown);
    }, [])

  useEffect(() => {
    setBeta([]);
    setHolds([]);
    }, [props.route])

  const renderRoute = (parent) => {
    let params = {};
    const route = props.route;
    if (parent) {
      params.name = route.name;
      params.image = route.img;
      params.crux= route.crux;
      params.cruxOpen = crux;
      params.style = {};
    } else {
      const crux = route.crux[crux];
      params.cruxOpen = null;
      params.name = crux;
      params.image = crux.image;
      params.alt = crux.alt;
      params.style = { width: '40%', marginTop: '5%' };
    }
    return <Route
              parent={parent}
              name={params.name}
              id={route._id}
              image={params.image}
              holds={holds}
              selectedHold={selectedHold}
              crux={params.crux}
              style={params.style}
              beta={beta}
              handleCruxClick={(name) => setCrux(name)}
              handleCloseClick={() => setCrux(null)}
              cruxOpen={params.cruxOpen}
              handleMouseMove={handleHoldMove}
              holds={holds.filter(({ parent }) => parent === route.name)}
              addHold={addHold}
              deleteHold={deleteHold}
              handleHoldNote={handleHoldNote}
              swapHoldPositions={swapHoldPositions}
              handleHoldMouseOver={handleHoldMouseOver} />
  }

  const addHold = (type, x, y, parent) => {
    const newHold = {
      id: nextHoldID(),
      type: type,
      coordinates: {x: x, y: y},
      parent: parent,
      note: '',
      position: nextHoldPosition(parent)
    };
    setHolds((holds) => [...holds, newHold]);
  }

  const nextHoldID = () => {
    //increment last id of all holds
    const ids = holds.map(({ id }) => id);
    return holds.length > 0 ? Math.max(...ids) + 1 : 0;
  }

  const nextHoldPosition = (parent) => {
    //increment last position of holds in parent
    const siblingPositions = holds
                              .filter((hold) => hold.parent === parent)
                              .map(({ position }) => position);
    return siblingPositions.length > 0 ? Math.max(...siblingPositions) + 1 : 0;
  }

  const deleteHold = (holdID) => {
    setHolds((holds) => holds.filter(({ id }) => id !== holdID) );
    shiftHoldPositions(holdID);
  }

  const shiftHoldPositions = (holdID) => {
    const position = holds.find(({ id }) => id === holdID).position;
    setHolds((holds) => holds.map((hold) => hold.position > position ? {...hold, position: hold.position - 1} : hold));
  }

  const handleHoldMove = (holdID, x, y) => {
    setHolds((holds) => holds.map((hold) => hold.id === holdID ? { ...hold, coordinates: {x: x, y: y} } : hold));
    }

  const handleHoldNote = (holdID, value) => {
    setHolds((holds) => holds.map((hold) => hold.id === holdID ? { ...hold, note: value } : hold))
  }

  const swapHoldPositions = (holdID, targetHoldID) => {
    const currentPosition = holds.find(({ id }) => id === holdID).position;
    const targetPosition = holds.find(({ id }) => id === targetHoldID).position;

    setHolds((holds) => {
      return (
        holds.map((hold) => {
          if (hold.id === holdID) {
            return {...hold, position: targetPosition}
          }
          if (hold.id === targetHoldID) {
            return {...hold, position: currentPosition}
          }
          return hold;
          })
          )
        })
      }

  const handleHoldMouseOver = (id, hovered) => hovered ? setSelectedHold(id) : setSelectedHold(null);

  const handleBetaClick = (e) => {
    const id = e.target.id;
    const routeBeta = props.route.beta.find(({ _id }) => _id === id);
    //don't render duplicate beta on Route
    if (!beta.find(({ _id }) => _id === id)) {
      setBeta((beta) => [...beta, routeBeta]);
    }
  }

  return (
    <div className='content'>
      {renderRoute(true)}
      {crux !== null ? renderRoute(false) : null}
      <div className='dashboards' >
        <HoldDashboad
          holds={holds.filter(({ parent }) => parent === props.route.name)}
          selectedHold={selectedHold}
          handleMouseOver={handleHoldMouseOver}
          handleNoteChange={handleHoldNote}
          handleDeleteClick={deleteHold}
          swapHoldPositions={swapHoldPositions} />
        <BetaDashboard beta={props.route.beta} handleBetaClick={handleBetaClick} />
      </div>
    </div>
    )
}

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

export default App;
