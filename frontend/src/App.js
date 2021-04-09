import { Component, createRef } from 'react';
import axios from 'axios';
import './App.css';
import { toPx, percentToPx, pxToPercent } from './helpers';
import { TouchNodeDashboad, TouchNode, CruxNode } from './nodes';
import routes from './content/routes';

class App extends Component {
  constructor(props) {
    super();
    this.state = {
      route: routes.churningInTheWake,
      crux: null,
      nodes: [],
    }
  }

  componentDidMount = () => {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount = () => {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (e) => {
    if (e.keyCode === 27) {
      this.setState({ crux: null });
    }
  }

  renderRoute = (parent) => {
    let params = {};
    if (parent) {
      const route = this.state.route;
      params.name = 'main';
      params.image = route.image;
      params.alt = route.alt;
      params.crux= route.crux;
      params.cruxOpen = this.state.crux;
      params.style = {};
    } else {
      const crux = this.state.route.crux[this.state.crux];
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
              alt={params.alt}
              crux={params.crux}
              style={params.style}
              handleCruxNodeClick={this.handleCruxNodeClick}
              handleCloseClick={this.handleCruxCloseClick}
              cruxOpen={params.cruxOpen}
              handleMouseMove={this.handleTouchNodeMove}
              addNode={this.addNode}
              deleteNode={this.deleteNode}
              touchNodes={this.state.nodes}
              handleTouchNodeNote={this.handleTouchNodeNote}
              swapTouchNodePositions={this.swapTouchNodePositions} />
  }

  handleCruxNodeClick = (name) => this.setState({ crux: name });

  handleCruxCloseClick = () => this.setState({ crux: null });

  //TouchNode
  addNode = (type, x, y, parent) => {
    const newNode = { id: this.nextTouchNodeID(), type: type, x: x, y: y, parent: parent, note: '', position: this.nextTouchNodePosition(parent) };
    this.setState((state) => ({ nodes: [...state.nodes, newNode] }));
  }

  nextTouchNodeID = () => {
    //increment last id of all nodes
    const ids = this.state.nodes.map(({ id }) => id);
    return this.state.nodes.length > 0 ? Math.max(...ids) + 1 : 0;
  }

  nextTouchNodePosition = (parent) => {
    //increment last position of nodes in parent
    const siblingPositions = this.state.nodes
                              .filter((node) => node.parent === parent)
                              .map(({ position }) => position);
    return siblingPositions.length > 0 ? Math.max(...siblingPositions) + 1 : 0;
  }

  deleteNode = (nodeID) => {
    this.setState((state) => ({ nodes: state.nodes.filter(({ id }) => id !== nodeID) }));
    this.shiftNodePositions(nodeID);
  }

  shiftNodePositions = (nodeID) => {
    const position = this.state.nodes.find(({ id }) => id === nodeID).position;
    this.setState((state) => ({ nodes: state.nodes.map((node) => node.position > position ? {...node, position: node.position - 1} : node) }));
  }

  handleTouchNodeMove = (nodeID, x, y) => {
    this.setState((prevState) => ({ nodes: prevState.nodes.map((node) => node.id === nodeID ? { ...node, x: x, y: y} : node) }))
  }

  handleTouchNodeNote = (nodeID, value) => {
    this.setState((prevState) => ({ nodes: prevState.nodes.map((node) => node.id === nodeID ? { ...node, note: value } : node) }))
  }

  swapTouchNodePositions = (nodeID, targetNodeID) => {
    const currentPosition = this.state.nodes.find(({ id }) => id === nodeID).position;
    const targetPosition = this.state.nodes.find(({ id }) => id === targetNodeID).position;

    this.setState((prevState) => {
      const nodes = prevState.nodes;
      return {
        nodes: nodes.map((node) => {
          if (node.id === nodeID) {
            return {...node, position: targetPosition}
          }
          if (node.id === targetNodeID) {
            return {...node, position: currentPosition}
          }
          return node;
          })
        }
      })
    }

  handleUploadRouteClick = () => {
    axios.post('/routes', {
      name: 'churning in the wake',
      alt: this.state.route.alt,
      nodes: this.state.nodes
      })
      .then((res) => console.log(res))
      .catch((err) => console.error(err))
  }

  render() {
    return (
      <div className='App' >
        <h1>Beta Builder</h1>
        <button onClick={this.handleUploadRouteClick}>Upload Route</button>
        {this.renderRoute(true)}
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
      touchNode: null
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

  renderCruxNodes = () => {
    return this.props.crux.map(({ coords }, index) => {
      const { x, y } = percentToPx(coords.x, coords.y, this.state.imageDimensions.x, this.state.imageDimensions.y);
      return <CruxNode
                coordinates={{ x:x, y:y }}
                key={index}
                id={index}
                handleClick={this.props.handleCruxNodeClick} />
              })
            }

  //TouchNode
  childTouchNodes = () => this.props.touchNodes.filter(({ parent }) => parent === this.props.name);

  renderTouchNodes = () => {
    return this.childTouchNodes().map(({ id, type, x, y, note, position }) => {
        const coords = percentToPx(x, y, this.state.imageDimensions.x, this.state.imageDimensions.y);
        return <TouchNode
                  key={id}
                  id={id}
                  position={position}
                  hovered={this.state.touchNode === id}
                  type={type}
                  coordinates={{ x:coords.x, y:coords.y }}
                  note={note}
                  containerDimensions={{ x: this.state.imageDimensions.x, y: this.state.imageDimensions.y}}
                  handleMouseMove={this.handleMouseMove}
                  handleMouseOver={this.handleTouchNodeMouseOver}
                  handleDeleteClick={this.deleteTouchNode} /> })
    }

  deleteTouchNode = (id) => this.props.deleteNode(id);

  handleImageLoad = (e) => this.setState({ imageDimensions: { x:  e.target.width, y: e.target.height } });

  handleMouseMove = (id, xCoord, yCoord) => {
    const { x, y } = pxToPercent(xCoord, yCoord, this.state.imageDimensions.x, this.state.imageDimensions.y);
    this.props.handleMouseMove(id, x, y);
  }

  handleTouchNodeMouseOver = (id, hovered) => hovered ? this.setState({ touchNode: id }) : this.setState({ touchNode: null })

  handleTouchNodeNote = (id, value) => this.props.handleTouchNodeNote(id, value);

  swapTouchNodeID = (id, down) => this.props.swapTouchNodeID(id, down);

  //ToolBox
  handleClick = (e) => {
    this.setState({ toolBox: <ToolBox
                                coordinates={{ x:e.nativeEvent.offsetX, y:e.nativeEvent.offsetY }}
                                handleClick={this.handleToolBoxClick}
                                handleCloseClick={this.closeToolBox} /> });
  }

  handleToolBoxClick = (type, xCoord, yCoord) => {
    const { x, y } = pxToPercent(xCoord, yCoord, this.state.imageDimensions.x, this.state.imageDimensions.y);
    this.props.addNode(type, x, y, this.props.name);
    this.setState({ toolBox: null });
  }

  closeToolBox = () => this.setState({ toolBox: null });

  renderTouchNodeDashboard = () => {
    if (this.props.cruxOpen === null) {
      return (
        <TouchNodeDashboad
          nodes={this.childTouchNodes()}
          selectedNode={this.state.touchNode}
          handleMouseOver={this.handleTouchNodeMouseOver}
          handleNoteChange={this.handleTouchNodeNote}
          handleDeleteClick={this.deleteTouchNode}
          addNode={this.props.addNode}
          swapNodePositions={this.props.swapTouchNodePositions} />
        )
    }
    return null;
  }

  render() {
    return (
      <div className='route-container' >
        <div className='route' style={this.props.style} >
          <img
            className='route'
            ref={this.image}
            onLoad={this.handleImageLoad}
            src={this.props.image}
            alt={this.props.alt}
            onMouseOver={ () => this.setState({ onImage: true }) }
            onMouseLeave={ () => this.setState({ onImage: false }) }
            onClick={this.handleClick} />
          {this.props.crux ? this.renderCruxNodes() : null}
          {this.renderTouchNodes()}
          {this.state.toolBox}
          {!this.props.parent ? <button onClick={this.props.handleCloseClick}>Close</button> : null}
        </div>
        {this.renderTouchNodeDashboard()}
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
      <button className='tool-box' onClick={handleClick} value={'foot-right'}>Right Foot</button>
      <button className='tool-box' onClick={handleClick} value={'foot-left'}>Left Foot</button>
      <button className='tool-box' onClick={handleClick} value={'hand-right'}>Right Hand</button>
      <button className='tool-box' onClick={handleClick} value={'hand-left'}>Left Hand</button>
      <button className='tool-box' onClick={() => props.handleCloseClick()}>Exit</button>
    </div>
  )
}

export default App;
