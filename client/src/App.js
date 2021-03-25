import { useState } from 'react';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import Home from './Pages/Home';
import NavBar from './assets/Navbar';
import Init from './Pages/init';
import Account from './Pages/account';
import Profile from './Pages/profile';
import Auth from './Pages/auth';
import Browse from './Pages/browse';
import Messanger from './Pages/messages';
import MyFooter from './assets/myFooter';
import AuthProvider from '../src/Contexts/authContext';
import PrivateRoute from './routes/privateRoute';
import Notifs from './Pages/notifications';
import './App.css';

function App() {
	const [displayToggle, SetDisplayToggle] = useState(false);
	return (
		<Router>
			<div className='container'>
				<NavBar parentDisplay={displayToggle} SetDisplayToggle={SetDisplayToggle} />
				<div className={`app ${displayToggle ? 'open' : ''}`}>
					<Switch>
						<PrivateRoute path='/u/:username' component={Profile} />
						{/**check if the user exist or not */}
						<PrivateRoute path='/notifications' component={Notifs} />
						<PrivateRoute path='/browse' component={Browse} />
						<PrivateRoute path='/messanger' component={Messanger} />
						<Route path='/init' component={Init} />
						<Route path='/account' component={Account} />
						<Route path='/auth' component={Auth} />
						<Route exact path='/' component={Home} />
					</Switch>
				</div>
			</div>
			<MyFooter openStatus={`app ${displayToggle ? 'open' : ''}`} />
		</Router>
	);
}

function AppWithStore() {
	return (
		<AuthProvider>
			<App />
		</AuthProvider>
	);
}

export default AppWithStore;
