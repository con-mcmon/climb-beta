import { useState, useEffect } from 'react';
import { Switch, Route, Link, useRouteMatch } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Content from './content';

function RouteHome(props) {
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

export default RouteHome;
