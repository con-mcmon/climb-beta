import { Component, createRef, useState, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { toPx, percentToPx, pxToPercent } from './helpers';
import { HoldDashboad, Hold, Crux } from './holds';
import { BetaDashboard, Beta } from './beta';
import { useDivCenter } from './hooks';
import styles from './style';

class App extends Component {
  constructor(props) {
    super();
    this.state = {
      routes: [],
      route: null,
      crux: null,
      holds: [],
      beta: []
    }
  }

  componentDidMount = () => {
    this.getRoutes();
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount = () => {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  getRoutes = () => {
    axios.get('/routes')
      .then((res) => this.setState({ routes: res.data }))
      .catch((err) => console.error(err))
  }

  handleKeyDown = (e) => {
    if (e.keyCode === 27) {
      this.setState({ crux: null });
    }
  }

  renderRoute = (parent) => {
    let params = {};
    const route = this.state.route;
    if (parent) {
      params.name = route.name;
      params.image = route.img;
      params.crux= route.crux;
      params.cruxOpen = this.state.crux;
      params.style = {};
    } else {
      const crux = route.crux[this.state.crux];
      params.cruxOpen = null;
      params.name = this.state.crux;
      params.image = crux.image;
      params.alt = crux.alt;
      params.style = { width: '40%', marginTop: '5%' };
    }
    return <Route
              parent={parent}
              name={params.name}
              image={params.image}
              holds={this.state.holds}
              beta={this.state.beta}
              crux={params.crux}
              style={params.style}
              handleCruxClick={this.handleCruxClick}
              handleCloseClick={this.handleCruxCloseClick}
              cruxOpen={params.cruxOpen}
              handleMouseMove={this.handleHoldMove}
              holds={this.state.holds.filter(({ parent }) => parent === route.name)}
              addHold={this.addHold}
              deleteHold={this.deleteHold}
              handleHoldNote={this.handleHoldNote}
              swapHoldPositions={this.swapHoldPositions} />
  }

  handleCruxClick = (name) => this.setState({ crux: name });

  handleCruxCloseClick = () => this.setState({ crux: null });

  //Hold
  addHold = (type, x, y, parent) => {
    const newHold = {
      id: this.nextHoldID(),
      type: type,
      coordinates: {x: x, y: y},
      parent: parent,
      note: '',
      position: this.nextHoldPosition(parent)
    };
    this.setState((state) => ({ holds: [...state.holds, newHold] }));
  }

  nextHoldID = () => {
    //increment last id of all holds
    const ids = this.state.holds.map(({ id }) => id);
    return this.state.holds.length > 0 ? Math.max(...ids) + 1 : 0;
  }

  nextHoldPosition = (parent) => {
    //increment last position of holds in parent
    const siblingPositions = this.state.holds
                              .filter((hold) => hold.parent === parent)
                              .map(({ position }) => position);
    return siblingPositions.length > 0 ? Math.max(...siblingPositions) + 1 : 0;
  }

  deleteHold = (holdID) => {
    this.setState((state) => ({ holds: state.holds.filter(({ id }) => id !== holdID) }));
    this.shiftHoldPositions(holdID);
  }

  shiftHoldPositions = (holdID) => {
    const position = this.state.holds.find(({ id }) => id === holdID).position;
    this.setState((state) => ({ holds: state.holds.map((hold) => hold.position > position ? {...hold, position: hold.position - 1} : hold) }));
  }

  handleHoldMove = (holdID, x, y) => {
    this.setState((prevState) => ({
      holds: prevState.holds.map((hold) => hold.id === holdID ? { ...hold, coordinates: {x: x, y: y} } : hold)
      }))
    }

  handleHoldNote = (holdID, value) => {
    this.setState((prevState) => ({ holds: prevState.holds.map((hold) => hold.id === holdID ? { ...hold, note: value } : hold) }))
  }

  swapHoldPositions = (holdID, targetHoldID) => {
    const currentPosition = this.state.holds.find(({ id }) => id === holdID).position;
    const targetPosition = this.state.holds.find(({ id }) => id === targetHoldID).position;

    this.setState((prevState) => {
      const holds = prevState.holds;
      return {
        holds: holds.map((hold) => {
          if (hold.id === holdID) {
            return {...hold, position: targetPosition}
          }
          if (hold.id === targetHoldID) {
            return {...hold, position: currentPosition}
          }
          return hold;
          })
        }
      })
    }

  renderRouteList = () => {
    const routes = this.state.routes.map(({ name, id }) => {
      return (
        <button
          id={id}
          onClick={this.handleRouteClick}
          key={name} >
          {name}
        </button> )
      })

    return (
      <div>
        {routes}
      </div> )
    }

  handleRouteClick = (e) => {
    axios.get(`/routes/${e.target.id}`)
      .then((res) => this.setState({ route: res.data, beta: [], crux: null }))
      .catch((err) => console.error(err))
  }

  handleUploadBetaClick = () => {
    const holds = this.state.holds.filter((hold) => hold.parent === this.state.route.name);
    axios.post(`/beta/${this.state.route._id}`, holds)
      .then((res) => console.log(res))
      .catch((err) => console.error(err))
  }

  handleBetaClick = (e) => {
    const id = e.target.id;
    const beta = this.state.route.beta.find(({ _id }) => _id === id);
    if (!this.state.beta.find(({ _id }) => _id === id)) {
      this.setState((state) => ({ beta: [...state.beta, beta] }));
    }
  }

  render() {
    const route = this.state.route;
    return (
      <div className='App' >
        <h1>Beta Builder</h1>
        {this.renderRouteList()}
        {route ? <BetaDashboard beta={this.state.route.beta} handleBetaClick={this.handleBetaClick} /> : null}
        {route ? <button onClick={this.handleUploadBetaClick}>Upload Beta</button> : null}
        {route ? this.renderRoute(true) : null}
        {this.state.crux !== null ? this.renderRoute(false) : null}
      </div>
    );
  }
}

class Route extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageDimensions: {
        x: 0,
        y:0
      },
      onImage: false,
      toolBox: null,
      hold: null
    }
    this.image = createRef();
  }

  componentDidMount = () => {
    window.addEventListener('resize', this.updateImageDimensions);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.updateImageDimensions);
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  updateImageDimensions = () => this.setState({ imageDimensions: { x: this.image.current.width, y: this.image.current.height } });

  handleKeyDown = (e) => {
    if (e.keyCode === 27) {
      this.closeToolBox();
    }
  }

  renderCruxs = () => {
    return this.props.crux.map(({ coords }, index) => {
      const { x, y } = percentToPx(coords.x, coords.y, this.state.imageDimensions.x, this.state.imageDimensions.y);
      return <Crux
                coordinates={{ x:x, y:y }}
                key={index}
                id={index}
                handleClick={this.props.handleCruxClick} />
              })
            }

  //Hold
  renderHolds = () => {
    return this.props.holds.map(({ id, type, coordinates, note, position }) => {
        const coords = percentToPx(coordinates.x, coordinates.y, this.state.imageDimensions.x, this.state.imageDimensions.y);
        return <Hold
                  key={id}
                  id={id}
                  position={position}
                  hovered={this.state.hold === id}
                  type={type}
                  coordinates={{ x:coords.x, y:coords.y }}
                  note={note}
                  containerDimensions={{ x: this.state.imageDimensions.x, y: this.state.imageDimensions.y}}
                  handleMouseMove={this.handleMouseMove}
                  handleMouseOver={this.handleHoldMouseOver}
                  handleDeleteClick={this.deleteHold} /> })
    }

  deleteHold = (id) => this.props.deleteHold(id);

  handleImageLoad = (e) => this.setState({ imageDimensions: { x:  e.target.width, y: e.target.height } });

  handleMouseMove = (id, xCoord, yCoord) => {
    const { x, y } = pxToPercent(xCoord, yCoord, this.state.imageDimensions.x, this.state.imageDimensions.y);
    this.props.handleMouseMove(id, x, y);
  }

  handleHoldMouseOver = (id, hovered) => hovered ? this.setState({ hold: id }) : this.setState({ hold: null })

  handleHoldNote = (id, value) => this.props.handleHoldNote(id, value);

  swapHoldID = (id, down) => this.props.swapHoldID(id, down);

  //Beta
  renderBeta = () => this.props.beta.map(({ _id, holds }) => <Beta id={_id} holds={holds} key={_id} imageDimensions={this.state.imageDimensions} />);

  //ToolBox
  handleClick = (e) => {
    this.setState({ toolBox: <ToolBox
                                coordinates={{ x:e.nativeEvent.offsetX, y:e.nativeEvent.offsetY }}
                                handleClick={this.handleToolBoxClick}
                                handleCloseClick={this.closeToolBox} /> });
  }

  handleToolBoxClick = (type, xCoord, yCoord) => {
    const { x, y } = pxToPercent(xCoord, yCoord, this.state.imageDimensions.x, this.state.imageDimensions.y);
    this.props.addHold(type, x, y, this.props.name);
    this.setState({ toolBox: null });
  }

  closeToolBox = () => this.setState({ toolBox: null });

  renderHoldDashboard = () => {
    if (this.props.cruxOpen === null) {
      return (
        <HoldDashboad
          holds={this.props.holds}
          selectedHold={this.state.hold}
          handleMouseOver={this.handleHoldMouseOver}
          handleNoteChange={this.handleHoldNote}
          handleDeleteClick={this.deleteHold}
          addHold={this.props.addHold}
          swapHoldPositions={this.props.swapHoldPositions} />
        )
    }
    return null;
  }

  render() {
    return (
      <div className='content'>
        <div className='route-container' >
          <div className='route' style={this.props.style} >
            <img
              ref={this.image}
              onLoad={this.handleImageLoad}
              src={this.props.image}
              alt={this.props.name}
              onMouseOver={ () => this.setState({ onImage: true }) }
              onMouseLeave={ () => this.setState({ onImage: false }) }
              onClick={this.handleClick} />
            {this.props.crux ? this.renderCruxs() : null}
            {this.renderHolds()}
            {this.renderBeta()}
            {this.state.toolBox}
            {!this.props.parent ? <button onClick={this.props.handleCloseClick}>Close</button> : null}
          </div>
        </div>
        {this.renderHoldDashboard()}
      </div>
      )
    }
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
