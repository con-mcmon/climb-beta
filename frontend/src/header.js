import { Link, withRouter } from 'react-router-dom';
import Logout from './logout';
import { useLoggedIn } from './hooks';

function Header(props) {
  const loggedIn = useLoggedIn();

  return (
    <div className='header' >
      <div className='left'>
        <Link to='/' id='title'>Beta Bible</Link>
        <Link to='/routes'>Routes</Link>
      </div>
      <div className='right' >
        {loggedIn ? <Logout />: <Link to='/login'>Login</Link>}
        <Link to='/register'>Register</Link>
      </div>
    </div>
    )
}

export default withRouter(Header);
