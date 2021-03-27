import { Component, createRef } from 'react';
import './App.css';
import { toPx, percentToPx, pxToPercent } from './helpers';
import { TouchNode, CruxNode } from './nodes';
import routes from './content/routes';

class App extends Component {
  constructor(props) {
    super();
    this.state = {
      route: routes.churningInTheWake,
      crux: null,
      nodes: [{"id":0,"type":"rightFoot","x":80.81705150976904,"y":5.725699067909445,"parent":"main"}],
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
              deleteNode={this.deleteNode}
              touchNodes={this.state.nodes} />
  }

  handleCruxNodeClick = (name) => this.setState({ crux: name });

  handleCruxCloseClick = () => this.setState({ crux: null });

  addNode = (type, x, y, parent) => {
    const ids = this.state.nodes.map(({ id }) => id);
    const id = this.state.nodes.length > 0 ? Math.max(...ids) + 1 : 0;
    this.setState((state) => ({ nodes: [...state.nodes, { id: id, type: type, x: x, y: y, parent: parent }] }));
  }

  deleteNode = (id) => this.setState((state) => ({ nodes: state.nodes.filter((node) => node.id !== id) }));

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
      imageDimensions: {
        x: 0,
        y:0
      },
      onImage: false,
      toolBox: null,
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

  renderTouchNodes = () => {
    return this.props.touchNodes
      .filter(({ parent }) => parent === this.props.name)
      .map(({ id, type, x, y }) => {
        const coords = percentToPx(x, y, this.state.imageDimensions.x, this.state.imageDimensions.y);
        return <TouchNode
                  key={id}
                  id={id}
                  type={type}
                  coordinates={{ x:coords.x, y:coords.y }}
                  containerDimensions={{ x: this.state.imageDimensions.x, y: this.state.imageDimensions.y}}
                  handleMouseMove={this.handleMouseMove}
                  handleDeleteClick={this.deleteTouchNode} /> })
    }

  deleteTouchNode = (id) => this.props.deleteNode(id);

  handleImageLoad = (e) => this.setState({ imageDimensions: { x:  e.target.width, y: e.target.height } });

  handleMouseMove = (id, xCoord, yCoord) => {
    const { x, y } = pxToPercent(xCoord, yCoord, this.state.imageDimensions.x, this.state.imageDimensions.y);
    this.props.handleMouseMove(id, x, y);
  }

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

function ToolBox(props) {
  const { x, y } = props.coordinates;
  const handleClick = (e) => props.handleClick(e.target.value, x, y);

  return (
    <div className='tool-box' style={{ left:toPx(x), top:toPx(y) }}>
      <button className='tool-box' onClick={handleClick} value={'rightFoot'}>Right Foot</button>
      <button className='tool-box' onClick={handleClick} value={'leftFoot'}>Left Foot</button>
      <button className='tool-box' onClick={handleClick} value={'rightHand'}>Right Hand</button>
      <button className='tool-box' onClick={handleClick} value={'leftHand'}>Left Hand</button>
      <button className='tool-box' onClick={() => props.handleCloseClick()}>Exit</button>
    </div>
  )
}

export default App;
