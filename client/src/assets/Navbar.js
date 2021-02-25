import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContexts } from '../Contexts/authContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCog } from '@fortawesome/free-solid-svg-icons';

function NavBar({ parentDisplay, SetDisplayToggle }) {
	const [toggleClass, setToggleClass] = useState(false);
	const handleClick = () => {
		setToggleClass(toggleClass => !toggleClass);
		SetDisplayToggle(parentDisplay => !parentDisplay);
	};

	const { auth } = useContext(AuthContexts);

	return (
		<nav className='navbar_wraper'>
			<div className='navbar__siteName'>
				<h1>
					<Link to='/'>MatchaV2.</Link>
				</h1>
			</div>
			<div>
				<a href='#' className='toggle-button' onClick={() => handleClick()}>
					<span className='bar' />
					<span className='bar' />
					<span className='bar' />
				</a>
			</div>
			<div>
				<ul className={`navbar__list ${toggleClass ? 'open' : ''}`}>
					{(auth.token === null && (
						<>
							<li>
								<Link onClick={() => handleClick()} to='/auth'>
									Sign In
								</Link>
							</li>
							<li>
								<Link to='/auth/register'>
									<button onClick={() => handleClick()}>Sign up</button>
								</Link>
							</li>
						</>
					)) ||
						(auth.token && (
							<>
								<li>
									<FontAwesomeIcon
										icon={faBell}
										className='clickable'
										size='lg'
										style={{ color: '#00e6cb' }}
									/>
								</li>
								<li>
									<FontAwesomeIcon
										icon={faCog}
										size='lg'
										className='clickable'
										style={{ color: '#00e6cb', marginRight: 5 }}
									/>
								</li>
							</>
						))}
				</ul>
			</div>
		</nav>
	);
}

export default NavBar;
