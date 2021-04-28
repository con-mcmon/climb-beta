import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './App.css';
import { HoldDashboad } from './holds';
import { BetaDashboard } from './beta';
import Route from './route';
import { useKey } from './hooks';

function Content(props) {
  const [holds, setHolds] = useState([]);
  const [selectedHold, setSelectedHold] = useState(null);
  const [renderedBeta, setRenderedBeta] = useState([]);
  const [crux, setCrux] = useState(null);

  const { routeId } = useParams();

  const escKeyDown = useKey(27);
  useEffect(() => {
    if (escKeyDown) {
      setCrux(null);
      }
    }, [escKeyDown])

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
              selectedHold={selectedHold}
              crux={params.crux}
              style={params.style}
              beta={renderedBeta}
              handleCruxClick={(name) => setCrux(name)}
              handleCloseClick={() => setCrux(null)}
              cruxOpen={params.cruxOpen}
              handleMouseMove={handleHoldMove}
              holds={holds}
              addHold={addHold}
              deleteHold={deleteHold}
              handleHoldNote={handleHoldNote}
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
    const positions = holds.map(({ position }) => position);
    return positions.length > 0 ? Math.max(...positions) + 1 : 0;
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

  const handleBetaClick = (rendered, id) => {
    if (!rendered) {
      const routeBeta = props.route.beta.find(({ _id }) => _id === id);
      setRenderedBeta((beta) => [...beta, routeBeta]);
    } else {
      setRenderedBeta((beta) => beta.filter(({ _id }) => _id !== id));
    }
  }

  return (
    <div className='content'>
      {renderRoute(true)}
      {crux !== null ? renderRoute(false) : null}
      <div className='dashboards' >
        <HoldDashboad
          routeId={props.route._id}
          holds={holds}
          selectedHold={selectedHold}
          handleMouseOver={handleHoldMouseOver}
          handleNoteChange={handleHoldNote}
          handleDeleteClick={deleteHold}
          swapHoldPositions={swapHoldPositions} />
        <BetaDashboard
          beta={props.route.beta}
          renderedBeta={renderedBeta}
          handleBetaClick={handleBetaClick} />
      </div>
    </div>
    )
}

export default Content;
