import { useState, useEffect, useRef } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

function Register(props) {
  const [username, setUsername] = useState('');
  const [usernameValidationMessage, setUsernameValidationMessage] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setVerifyPassword] = useState('');
  const [passwordValidationMessage, setPasswordValidationMessage] = useState('');

  const [email, setEmail] = useState('');
  const [emailValidationMessage, setEmailValidationMessage] = useState('');

  const [validationMessage, setValidationMessage] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  const [registered, setRegistered] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (validInputs()) {
      axios.post('/user/register', { username, email, password })
        .then((res) => setRegistered(true))
        .catch((err) => setResponseMessage(err.response.data))
      }
    }

  function validInputs() {
    if (usernameValidationMessage) {
      setValidationMessage(usernameValidationMessage);
      return false;
    } else if (emailValidationMessage) {
      setValidationMessage(emailValidationMessage);
      return false;
    } else if (passwordValidationMessage) {
      setValidationMessage(passwordValidationMessage);
      return false;
    } else {
      setValidationMessage('');
      return true;
    }
  }

  //check username
  useEffect(() => {
    if (username.length >= 6) {
      setUsernameValidationMessage('');
      } else {
        setUsernameValidationMessage('Username must be at least 6 characters long');
      }
      }, [username])

  //check password
  useEffect(() => {
    function passwordCheck() {
      const hasDigit = /\d+/;
      const hasSpecial = /[~|`|!|@|#|$|%|^|&|\*|\(|\)|_|-|\+|=|{|\[|}|\]|\||\:|;|"|']+/;
      const hasUpperCase = /[A-Z]+/;

      if (password.length < 8) {
        return 'Password must be at least 8 characters long';
      } else if (!hasDigit.test(password)) {
        return 'Password must contain a number';
      } else if (!hasSpecial.test(password)) {
        return 'Password must contain a special character';
      } else if (!hasUpperCase.test(password)) {
        return 'Password must contain uppercase letter';
      } else if (password !== confirmPassword) {
        return 'Passwords must match';
      } else {
        return '';
      }
    }

    const message = passwordCheck();

    if (!message) {
      setPasswordValidationMessage('');
    } else {
      setPasswordValidationMessage(message);
    }
    }, [password, confirmPassword])

  //check email
  useEffect(() => {
    function validEmail() {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    if (validEmail()) {
      setEmailValidationMessage('');
    } else {
      setEmailValidationMessage('Email address not valid');
    }
    }, [email])


  function handleChange(e) {
    const value = e.target.value;

    if (e.target.name === 'username') setUsername(value);
    if (e.target.name === 'password') setPassword(value);
    if (e.target.name === 'confirmPassword') setVerifyPassword(value);
    if (e.target.name === 'email') setEmail(value);
  }

  function registerResponse() {
    let message;
    if (validationMessage) message = validationMessage;
    else if (responseMessage) message = responseMessage;

    return <p className='response-message'>{message}</p>;
  }

  return (
    <div className='register'>
      <h1>Register</h1>
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
        <input
          type='password'
          name='confirmPassword'
          value={confirmPassword}
          placeholder='confirm password'
          onChange={handleChange} />
        <input
          type='text'
          name='email'
          value={email}
          placeholder='email'
          onChange={handleChange} />
        <input type='submit' value='Register' />
      </form>
      {registerResponse()}
      {registered ? <Redirect to='/' /> : null}
    </div>
    )
}

export default Register;
