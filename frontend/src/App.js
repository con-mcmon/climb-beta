import { Switch, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './home';
import RouteHome from './route-home';
import Login from './login';
import Logout from './logout';
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
          <Logout />
        </li>
        <li>
          <Link to='/register'>Register</Link>
        </li>
      </ul>

      <Switch>
        <Route path='/routes'>
          <RouteHome />
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

export default App;
