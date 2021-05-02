import { useState, useEffect } from 'react';
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

  //optional user data
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const [registered, setRegistered] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (validInputs()) {
      axios.post('/user/register', { username, email, password, birthdate, gender, height, weight })
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
      const hasSpecial = /[~`!@#$%^&*()_\-+={[}\]|:;"']+/;
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
    setPasswordValidationMessage(message);
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
    const name = e.target.name;
    const value = e.target.value;

    if (name === 'username') setUsername(value);
    if (name === 'password') setPassword(value);
    if (name === 'confirmPassword') setVerifyPassword(value);
    if (name === 'email') setEmail(value);
    if (name === 'birthdate') setBirthdate(value);
    if (name === 'height') setHeight(value);
    if (name === 'gender') setGender(value);
    if (name === 'weight') setWeight(value);
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
        <h3>Optional (You can set these later)</h3>
        <label htmlFor='birthdate'>Birthday</label>
        <input
          type='date'
          name='birthdate'
          onChange={handleChange} />
        <select name='gender' onChange={handleChange}>
          <option default value=''>Gender</option>
          <option value='male'>Male</option>
          <option value='female'>Female</option>
        </select>
        <input
          type='number'
          min='1'
          name='height'
          value={height}
          placeholder='height (inches)'
          onChange={handleChange} />
        <input
          type='number'
          min='1'
          name='weight'
          value={weight}
          placeholder='weight (lb)'
          onChange={handleChange} />
        <input type='submit' value='Register' />
      </form>
      {<p className='response-message'>{responseMessage || validationMessage}</p>}
      {registered ? <Redirect to='/' /> : null}
    </div>
    )
}

export default Register;
