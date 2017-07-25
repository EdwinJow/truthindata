import React from 'react';
import Layout from './shared/Layout';
import Testing from './components/Testing'
import Admin from './components/Admin'
import RealEstateTracker from './components/RealEstateTracker'
import RealEstateGraph from './components/RealEstateGraph'
import {render} from 'react-dom'
var ReactGA = require('react-ga');
ReactGA.initialize('UA-103157646-1');

import './css/index.css';
import {
    Router,
    Route,
    browserHistory
} from 'react-router'

function logPageView() {
  ReactGA.set({ page: window.location.pathname + window.location.search });
  ReactGA.pageview(window.location.pathname + window.location.search);
}

render((
    <Router history={browserHistory} onUpdate={logPageView}>
        <Route path="/" component={Layout}>
            <Route path="/testing" component={Testing} />
            <Route path="/admin" component={Admin} />
            <Route path="/real-estate-map" component={RealEstateTracker} />
            <Route path="/real-estate-graph" component={RealEstateGraph} />
            <Route path="/cache/flush"/>
        </Route>
    </Router>
), document.getElementById('root'))
