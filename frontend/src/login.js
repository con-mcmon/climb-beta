import { useState } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

function Login(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [response, setResponse] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    axios.post('/user/login', { username, password })
      .then((res) => setLoggedIn(true))
      .catch((err) => setResponse(err.response.data))
  }

  const handleChange = (e) => {
    const value = e.target.value;
    if (e.target.name === 'username') setUsername(value);
    if (e.target.name === 'password') setPassword(value);
  }

  return (
    <div className='login'>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          name='username'
          value={username}
          placeholder='username'
          onChange={handleChange} />
        <input
          type='password'
          name='password'
          value={password}
          placeholder='password'
          onChange={handleChange} />
        <input type="submit" value='Login' />
      </form>
      <p>{response}</p>
      {loggedIn ? <Redirect to='/' /> : null}
    </div>
    )
}

export default Login;
