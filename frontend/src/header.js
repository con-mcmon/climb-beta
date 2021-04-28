import { Link, useLocation } from 'react-router-dom';
import { useLoggedIn } from './hooks';
import Logout from './logout';

function Header(props) {
  let location = useLocation();

  const loggedIn = useLoggedIn(location);

  return (
    <div className='header' >
      <div className='left'>
        <Link to='/' id='title'>Beta Bible</Link>
        <Link to='/routes'>Routes</Link>
      </div>
      <div className='right' >
        {loggedIn ? <Logout /> : <Link to='/login'>Login</Link>}
        <Link to='/register'>Register</Link>
      </div>
    </div>
    )
}

export default Header;
