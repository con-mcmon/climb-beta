import React, { Component, useRef, useState, useEffect } from 'react';
import './App.css';
import routes from './content/routes';
import blackCircle from './content/images/circle-black.png';
import redCircle from './content/images/circle-red.png';
import blueCircle from './content/images/circle-blue.png';

function toPx(num) {
  return num + 'px';
}

function percentToPx(x, y, imageWidth, imageHeight) {
  return {
    x: (x / 100) * imageWidth,
    y: (y / 100) * imageHeight
  }
}

function pxToPercent(x, y, imageWidth, imageHeight) {
  return {
    x: (x / imageWidth) * 100,
    y: (y / imageHeight) * 100
  }
}

class App extends Component {
  constructor(props) {
    super();
    this.state = {
      route: routes.churningInTheWake,
      crux: null,
      nodes: [],
      coordinates: {
        x: 0,
        y: 0
      }
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

  handleMouseMove = (e) => {
    this.setState({
      coordinates: {
        x: e.clientX,
        y: e.clientY
      }});
    }

  handleTouchNodeMove = (nodeID, x, y) => {
    this.setState((prevState) => ({ nodes: prevState.nodes.map((node) => node.id === nodeID ? { ...node, x: x, y: y} : node) }))
  }

  renderRoute = (parent) => {
    let params = {};
    if (parent) {
      const route = this.state.route;
      params.name = 'main';
      params.image = route.image;
      params.alt = route.alt;
      params.crux= route.crux;
      params.style = {};
    } else {
      const crux = this.state.route.crux[this.state.crux];
      params.name = this.state.crux;
      params.image = crux.image;
      params.alt = crux.alt;
      params.style = { width: '40%', marginTop: '10%' };
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
              handleMouseMove={this.handleTouchNodeMove}
              addNode={this.addNode}
              touchNodes={this.state.nodes} />
  }

  handleCruxNodeClick = (name) => this.setState({ crux: name });

  handleCruxCloseClick = () => this.setState({ crux: null });

  addNode = (type, x, y, parent) => {
    this.setState((state) => ({ nodes: [...state.nodes, { id: state.nodes.length, type: type, x: x, y: y, parent: parent }] }));
  }

  render() {
    const { x, y } = this.state.coordinates;
    return (
      <div className="App" onMouseMove={this.handleMouseMove} >
        <h1>{ x } { y }</h1>
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
      imageWidth: 0,
      imageHeight: 0,
      onImage: false,
      toolBox: null,
    }
    this.image = React.createRef();
  }

  componentDidMount = () => {
    window.addEventListener('resize', this.updateImageDimensions);
  }

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.updateImageDimensions);
  }

  updateImageDimensions = () => {
    this.setState({
      imageWidth: this.image.current.width,
      imageHeight: this.image.current.height });
  }

  renderCruxNodes = () => {
    return this.props.crux.map(({ coords }, index) => {
      const { x, y } = percentToPx(coords.x, coords.y, this.state.imageWidth, this.state.imageHeight);
      return <CruxNode
                coordinates={{ x:x, y:y }}
                key={index}
                id={index}
                handleClick={this.props.handleCruxNodeClick} />
              })
            }

  renderTouchNodes = () => {
    return this.props.touchNodes
      .filter(({ parent }) => parent === this.props.name)
      .map(({ id, type, x, y }) => {
        const coords = percentToPx(x, y, this.state.imageWidth, this.state.imageHeight);
        return <TouchNode
                  key={id}
                  id={id}
                  type={type}
                  coordinates={{ x:coords.x, y:coords.y }}
                  containerDimensions={{ x: this.state.imageWidth, y: this.state.imageHeight}}
                  handleMouseMove={this.handleMouseMove} /> })
    }

  handleImageLoad = (e) => {
    this.setState({
      imageWidth: e.target.width,
      imageHeight: e.target.height });
  }

  handleMouseMove = (id, xCoord, yCoord) => {
    const { x, y } = pxToPercent(xCoord, yCoord, this.state.imageWidth, this.state.imageHeight);
    this.props.handleMouseMove(id, x, y);
  }

  handleClick = (e) => {
    this.setState({ toolBox: <ToolBox
                                coordinates={{ x:e.nativeEvent.offsetX, y:e.nativeEvent.offsetY }}
                                handleClick={this.handleToolBoxClick} /> });
  }

  handleToolBoxClick = (type, xCoord, yCoord) => {
    const { x, y } = pxToPercent(xCoord, yCoord, this.state.imageWidth, this.state.imageHeight);
    this.props.addNode(type, x, y, this.props.name);
    this.setState({ toolBox: null });
  }

  render() {
    return (
      <div className='route-container' >
        <div className='route' style={this.props.style} onDragEnd={this.handleDragEnd} >
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
      </div>
      )
    }
  }

// {this.state.onImage ? <ImageZoom coordinates={{ x:this.state.coordinates.x, y:this.state.coordinates.y }} /> : null}
// function ImageZoom(props) {
//   return (
//     <div className='image-zoom' style={{ left:props.coordinates.x + 'px', top:props.coordinates.y + 'px' }}>
//     </div>
//   )
// }

function ToolBox(props) {
  const [x, y] = [props.coordinates.x, props.coordinates.y];
  const handleClick = (e) => props.handleClick(e.target.value, x, y);

  return (
    <div className='tool-box' style={{ left:toPx(x), top:toPx(y) }}>
      <button onClick={handleClick} value={'rightFoot'}>Right Foot</button>
      <button onClick={handleClick} value={'leftFoot'}>Left Foot</button>
      <button onClick={handleClick} value={'rightHand'}>Right Hand</button>
      <button onClick={handleClick} value={'leftHand'}>Left Hand</button>
    </div>
  )
}

class TouchNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hovered: false,
      mouseDown: false,
      divWidth: 0,
      divHeight: 0
    }
    this.div = React.createRef();
  }

  componentDidMount = () => {
    this.updateDivDimensions();
    window.addEventListener('resize', this.updateDivDimensions);
  }

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.updateDivDimensions);
  }

  updateDivDimensions = () => {
    this.setState({
      divWidth: this.div.current.offsetWidth,
      divHeight: this.div.current.offsetHeight })
  }

  shiftCenter = () => {
    return {
      x: this.props.coordinates.x - (this.state.divWidth / 2),
      y: this.props.coordinates.y - (this.state.divHeight / 2)
    };
  }

  handleMouseEnter = () => this.setState({ hovered: true });

  handleMouseLeave = () => {
    this.setState({
      mouseDown: false,
      hovered: false
    });
  }

  handleMouseMove = (event) => {
    if (this.state.mouseDown) {
      const [x, y] = [this.props.coordinates.x + event.movementX, this.props.coordinates.y + event.movementY];
      const insideContainer = (x > 0 && x < this.props.containerDimensions.x) && (y > 0 && y < this.props.containerDimensions.y);
      if (insideContainer) {
        this.props.handleMouseMove(this.props.id, this.props.coordinates.x + event.movementX, this.props.coordinates.y + event.movementY)
      }
    }
  }

  render() {
    const { x, y } = this.shiftCenter();
    return (
      <div
        ref={this.div}
        className='touch-node'
        style={{ left:toPx(x), top:toPx(y) }}
        onMouseMove={this.handleMouseMove}
        onMouseDown={() => this.setState({ mouseDown: true }) }
        onMouseUp={ () => this.setState({ mouseDown: false }) }
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave} >
        <img
          src={blueCircle}
          className='touch-node'
          alt='touch node' />
        <span className='touch-node'>{this.state.hovered ? this.props.type : null}</span>
      </div>
      )
    }
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

export default App;
