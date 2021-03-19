import { Component } from 'react';
import './App.css';
import churningInTheWake from './content/images/churning-in-the-wake.jpg';
import circle from './content/images/circle.png';
import rightHand from './content/images/hand-right.png';
import leftHand from './content/images/hand-left.png';
import rightFoot from './content/images/foot-right.png';
import leftFoot from './content/images/foot-left.png';

class App extends Component {
  constructor(props) {
    super();
    this.state = {
      image: churningInTheWake,
      onImage: false,
      coordinates: {
        x: 0,
        y: 0
      },
      icons: [],
      toolBox: false
    }
  }

  handleMouseOver = (e) => {
    this.setState({ onImage: true });
  }

  handleMouseLeave = (e) => {
    console.log('mouse out');
    this.setState({ onImage: false });
  }

  handleClick = (e) => {
    this.setState({ toolBox: <ToolBox coordinates={{ x:e.clientX, y:e.clientY }} handleClick={this.handleToolBoxClick} /> });
  }

  handleToolBoxClick = (value, x, y) => {
    this.setState((prevState) => (
      {
        icons: [...prevState.icons, <Icon value={value} coordinates={{ x:x, y:y }} key={[x.toString(), y.toString()].join(',')} /> ],
        toolBox: false
      }
    ))
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
      <div className="App" onMouseMove={this.handleMouseMove}>
        <h1>{ x } { y }</h1>
        <img
          src={this.state.image}
          alt="churning in the wake"
          onMouseOver={this.handleMouseOver}
          onMouseLeave={this.handleMouseLeave}
          onClick={this.handleClick} />
        {this.state.onImage ? <ImageZoom coordinates={{ x:this.state.coordinates.x, y:this.state.coordinates.y }} /> : null}
        {this.state.icons}
        {this.state.toolBox}
      </div>
    );
  }
}

function ImageZoom(props) {
  return (
    <div className='image-zoom' style={{ left:props.coordinates.x + 'px', top:props.coordinates.y + 'px' }}>
    </div>
  )
}

function Icon(props) {
  const x = props.coordinates.x + 'px';
  const y = props.coordinates.y + 'px';

  let icon;
  switch (props.value) {
    case 'rightFoot':
      icon = rightFoot;
      break;
    case 'leftFoot':
      icon = leftFoot;
      break;
    case 'rightHand':
      icon = rightHand;
      break;
    case 'leftHand':
      icon = leftHand;
      break;
    default:
      icon = null;
      break;
  }
  return <img src={icon} className='icon' alt='icon' style={{ left:x, top:y }} />;
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
      <div className='tool-box' style={{ left:this.x + 'px', top:this.y + 'px' }}>
        <button onClick={this.handleClick} value={'rightFoot'}>Right Foot</button>
        <button onClick={this.handleClick} value={'leftFoot'}>Left Foot</button>
        <button onClick={this.handleClick} value={'rightHand'}>Right Hand</button>
        <button onClick={this.handleClick} value={'leftHand'}>Left Hand</button>
      </div>
    )
  }
}

export default App;
