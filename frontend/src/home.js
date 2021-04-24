import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function Home(props) {
  const [user, setUser] = useState(false);

  useEffect(() => {
    const getUser = () => {
      axios.get('/user')
        .then((res) => setUser(res.data))
        .catch((err) => console.error(err))
    }
    getUser();
    }, [])

  return (
    <div>
      <h1>Beta Builder Home</h1>
      <p>{user ? `Welcome ${user.username}` : 'Please log in'}</p>
    </div>
    )
  }

export default Home;
