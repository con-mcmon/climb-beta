import { useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import './App.css';
import Header from './header';
import Home from './home';
import RouteHome from './route-home';
import Login from './login';
import Register from './register';

function App(props) {
  return (
    <div className='app' >
      <Header />

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
