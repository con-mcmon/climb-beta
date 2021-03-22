import React, { Component } from 'react';
import './App.css';
import routes from './content/routes';
import circle from './content/images/circle.png';
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
      coordinates: {
        x: 0,
        y: 0
      }
    }
  }

  handleMouseMove = (e) => {
    this.setState({
      coordinates: {
        x: e.clientX,
        y: e.clientY
      }});
    }

  render() {
    const { x, y } = this.state.coordinates;
    return (
      <div className="App" onMouseMove={this.handleMouseMove} >
        <h1>{ x } { y }</h1>
        <Route route={this.state.route} />
      </div>
    );
  }
}

class Route extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coordinates: {
        x: 0,
        y:0
      },
      imageWidth: 0,
      imageHeight: 0,
      onImage: false,
      touchNodes: [],
      toolBox: null,
      crux: null
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
    return this.props.route.crux.map(({ coords, image, alt }) => {
      const { x, y } = percentToPx(coords.x, coords.y, this.state.imageWidth, this.state.imageHeight);
      return <CruxNode
                coordinates={{ x:x, y:y }}
                image={image}
                alt={alt}
                key={alt} />
              })
            }

  renderTouchNodes = () => {
    return this.state.touchNodes.map(({ type, x, y }, index) => {
      return <TouchNode
                key={index}
                type={type}
                coordinates={{ x:x, y:y }}
                imageWidth={this.state.imageWidth}
                imageHeight={this.state.imageHeight} />
              })
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

  handleToolBoxClick = (type, x, y) => {
    const percentValues = pxToPercent(x, y, this.state.imageWidth, this.state.imageHeight);
    this.setState((prevState) => (
      {
        touchNodes: [...prevState.touchNodes, { type: type, x:percentValues.x, y:percentValues.y }],
        toolBox: null
      }
    ))
  }

  render() {
    return (
      <div>
        <div className='route' onMouseOver={this.handleMouseOver} >
          <img
            className='route'
            ref={this.image}
            onLoad={this.handleImageLoad}
            src={this.props.route.image}
            alt={this.props.route.alt}
            onMouseLeave={this.handleMouseLeave}
            onClick={this.handleClick} />
          {this.renderCruxNodes()}
          {this.renderTouchNodes()}
          {this.state.toolBox}
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
    window.addEventListener('resize', this.updateDivDimensions);
    this.updateDivDimensions();
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

  handleClick = () => this.setState({ clicked: true })

  render() {
    const { x, y } = this.shiftCenter();
    return (
      <div
        ref={this.div}
        className='touch-point'
        style={{ left:toPx(x), top:toPx(y) }} >
        <img
          src={blueCircle}
          type={this.props.type}
          className='touch-point'
          alt='icon'
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
          onClick={this.handleClick} />
        <span className='touch-point'>{this.state.hovered ? this.props.type : null}</span>
      </div>
      )
    }
  }

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

function CruxNode(props) {
  return (
    <img
      src={circle}
      alt={props.alt}
      className='crux-node'
      style={{ left:toPx(props.coordinates.x), top:toPx(props.coordinates.y) }} />
    )
}

export default App;
