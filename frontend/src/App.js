import { useState, useEffect } from 'react';
import { Switch, Route, Link, useRouteMatch } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import { Content } from './content';
import Login from './login';
import Register from './register';

function App(props) {
  return (
    <div className='App' >
      <ul>
        <li>
          <Link to='/'>Home</Link>
        </li>
        <li>
          <Link to='/routes'>Routes</Link>
        </li>
        <li>
          <Link to='/login'>Login</Link>
        </li>
        <li>
          <Link to='/register'>Register</Link>
        </li>
      </ul>

      <Switch>
        <Route path='/routes'>
          <Routes />
        </Route>
        <Route path='/login'>
          <Login />
        </Route>
        <Route path='/register'>
          <Register />
        </Route>
        <Route path='/'>
          <Home />
        </Route>
      </Switch>
    </div>
  )
}

function Home(props) {

  return (
    <div>
      <h1>Beta Builder Home</h1>
    </div>
    )
  }

function Routes(props) {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const match = useRouteMatch();

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
      <ul>
        {routes.map(({ name, id }) => {
          return (
            <li key={id} >
              <Link
                to={`${match.url}/${name}`}
                id={id}
                onClick={handleRouteClick} >
                {name}
              </Link>
            </li> )
            })}
      </ul> )
    }

  const handleRouteClick = (e) => {
    axios.get(`/routes/${e.target.id}`)
      .then((res) => setSelectedRoute(res.data))
      .catch((err) => console.error(err))
    }

  return (
    <div>
      <Switch>
        <Route path={`${match.path}/:routeId`}>
          {selectedRoute ? <Content route={selectedRoute} /> : null}
        </Route>
        <Route path={match.path}>
          <h1>Routes</h1>
          {renderRouteList()}
        </Route>
      </Switch>
    </div>
    )
}

export default App;
