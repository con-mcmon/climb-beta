import { useState, useEffect, useRef } from 'react';
import { useClicked } from './hooks';
import axios from 'axios';

function Login(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const usernameRef = useRef();
  const usernameClicked = useClicked(usernameRef);
  console.log(usernameClicked)

  const passwordRef = useRef();
  const passwordClicked = useClicked(passwordRef);

  const handleSubmit = (e) => {
    e.preventDefault()
    // console.log(e.target[0])
  }

  // const handleClick = (e) => {
  //   if (e.target.name === 'username') {
  //     setUsername('');
  //   } else if (e.target.name === 'password') {
  //     setPassword('');
  //   } else {
  //     setUsername(initialValues.username);
  //     setPassword(initialValues.password);
  //   }
  // }

  const handleChange = (e) => {
    console.log(e.target.name)
    const value = e.target.value;
    if (e.target.name === 'username') setUsername(value);
    if (e.target.name === 'password') setPassword(value);
  }

  return (
    <div className='login'>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          ref={usernameRef}
          type='text'
          name='username'
          value={usernameClicked ? username : 'username'}
          onChange={handleChange} />
        <input
          ref={passwordRef}
          type='text'
          name='password'
          value={passwordClicked ? password : 'password'}
          onChange={handleChange} />
        <input type="submit" value='Login' />
      </form>
    </div>
    )
}

export default Login;
