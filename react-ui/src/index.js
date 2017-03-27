import React from 'react';
import Layout from './shared/Layout';
import Testing from './components/Testing'
import Admin from './components/Admin'
import {render} from 'react-dom'

import './css/index.css';
import {
    Router,
    Route,
    browserHistory
} from 'react-router'

render((
    <Router history={browserHistory}>
        <Route path="/" component={Layout}>
            <Route path="/testing" component={Testing} />
            <Route path="/admin" component={Admin} />
        </Route>
    </Router>
), document.getElementById('root'))
