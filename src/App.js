import React, { Component } from 'react';
import './App.css';
import routes from './content/routes';
import blackCircle from './content/images/circle-black.png';
import redCircle from './content/images/circle-red.png';
import blueCircle from './content/images/circle-blue.png';
import rightHand from './content/images/hand-right.png';
import leftHand from './content/images/hand-left.png';
import rightFoot from './content/images/foot-right.png';
import leftFoot from './content/images/foot-left.png';

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
    if(e.keyCode === 27) {
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
              addNode={this.addNode}
              touchNodes={this.state.nodes} />
  }

  handleCruxNodeClick = (name) => this.setState({ crux: name });

  handleCruxCloseClick = () => this.setState({ crux: null });

  addNode = (type, x, y, parent) => {
    this.setState((prevState) => ({ nodes: [...prevState.nodes, { type: type, x:x, y:y, parent:parent }] }));
  }

  render() {
    const { x, y } = this.state.coordinates;
    const route = this.state.route;
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
      toolBox: null
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
                name={index}
                handleClick={this.props.handleCruxNodeClick} />
              })
            }

  renderTouchNodes = () => {
    return this.props.touchNodes
      .filter(({ parent }) => parent === this.props.name)
      .map(({ type, x, y }, index) => {
        return <TouchNode
                  key={index}
                  type={type}
                  coordinates={{ x:x, y:y }}
                  imageWidth={this.state.imageWidth}
                  imageHeight={this.state.imageHeight} /> })
    }

  handleImageLoad = (e) => {
    this.setState({
      imageWidth: e.target.width,
      imageHeight: e.target.height });
  }

  handleMouseOver = (e) => this.setState({ onImage: true });

  handleMouseLeave = (e) => this.setState({ onImage: false });

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
        <div className='route' style={this.props.style} >
          <img
            className='route'
            ref={this.image}
            onLoad={this.handleImageLoad}
            src={this.props.image}
            alt={this.props.alt}
            onMouseLeave={this.handleMouseLeave}
            onMouseOver={this.handleMouseOver}
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

class ToolBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enabled: false
    }
    this.x = props.coordinates.x;
    this.y = props.coordinates.y;
  }

  handleClick = (e) => this.props.handleClick(e.target.value, this.x, this.y);

  render() {
    return (
      <div className='tool-box' style={{ left:toPx(this.x), top:toPx(this.y) }}>
        <button onClick={this.handleClick} value={'rightFoot'}>Right Foot</button>
        <button onClick={this.handleClick} value={'leftFoot'}>Left Foot</button>
        <button onClick={this.handleClick} value={'rightHand'}>Right Hand</button>
        <button onClick={this.handleClick} value={'leftHand'}>Left Hand</button>
      </div>
    )
  }
}

class TouchNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hovered: false,
      clicked: false,
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
    const clickLocation = percentToPx(this.props.coordinates.x, this.props.coordinates.y, this.props.imageWidth, this.props.imageHeight);
    return {
      x: clickLocation.x - (this.state.divWidth / 2),
      y: clickLocation.y - (this.state.divHeight / 2)
    };
  }

  handleMouseEnter = () => this.setState({ hovered: true });

  handleMouseLeave = () => this.setState({ hovered: false });

  handleClick = () => this.setState({ clicked: true });

  render() {
    const { x, y } = this.shiftCenter();
    return (
      <div
        ref={this.div}
        className='touch-node'
        style={{ left:toPx(x), top:toPx(y) }} >
        <img
          src={blueCircle}
          type={this.props.type}
          className='touch-node'
          alt='icon'
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
          onClick={this.handleClick} />
        <span className='touch-node'>{this.state.hovered ? this.props.type : null}</span>
      </div>
      )
    }
  }

class CruxNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hovered: false,
      clicked: false,
    }
  }

  handleMouseEnter = () => this.setState({ hovered: true });

  handleMouseLeave = () => this.setState({ hovered: false });

  handleClick = () => this.props.handleClick(this.props.name);

  render() {
    return (
      <img
        src={this.state.hovered ? redCircle : blackCircle}
        alt='Crux Node'
        className='crux-node'
        style={{ left:toPx(this.props.coordinates.x), top:toPx(this.props.coordinates.y) }}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onClick={this.handleClick} />
      )
  }
}

export default App;
