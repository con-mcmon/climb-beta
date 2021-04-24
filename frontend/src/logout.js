import { useState } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import './App.css';

function Logout(props) {
  const [loggedOut, setLoggedOut] = useState(false);

  function handleClick() {
    axios.delete('/user/logout')
      .then((res) => setLoggedOut(true))
      .catch((err) => console.error(err))
  }

  return (
    <>
      <button onClick={handleClick}>Logout</button>
      {loggedOut ? <Redirect to='/login' /> : null}
    </>
    )
}

export default Logout;
