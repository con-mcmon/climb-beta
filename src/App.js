import { Component } from 'react';
import './App.css';
import churningInTheWake from './content/images/churning-in-the-wake.jpg';
import circle from './content/images/circle.png';

class App extends Component {
  constructor(props) {
    super();
    this.state = {
      onImage: false,
      coordinates: {
        x: 0,
        y: 0
      },
      circles: []
    }
  }

  handleMouseOver = (e) => {
    this.setState({ onImage: true });
  }

  handleMouseOut = (e) => {
    this.setState({ onImage: false });
  }

  handleClick = (e) => {
    console.log(this.state.coordinates.x, this.state.coordinates.y);
    this.setState((prevState) => ({ circles: [...prevState.circles, <Circle x={this.state.coordinates.x} y={this.state.coordinates.y} />] }));
  }

  handleMouseMove = (e) => {
    this.setState({
      coordinates: {
        x: e.screenX,
        y: e.screenY
      }});
  }

  render() {
    const { x, y } = this.state.coordinates;
    return (
      <div className="App">
        <h1>Mouse coordinates: { x } { y }</h1>
        <img
          src={churningInTheWake}
          alt="churning in the wake"
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}
          onMouseMove={this.handleMouseMove}
          onClick={this.handleClick} />
        {this.state.circles}
      </div>
    );
  }
}

function Circle(props) {
  const x = props.x + 'px';
  const y = props.y + 'px';
  return <img src={circle} className='circle' alt='circle' style={{left:x, top:y}} />
}

export default App;
