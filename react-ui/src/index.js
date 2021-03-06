import React from 'react';
import Layout from './shared/Layout';
import Testing from './components/Testing'
import Admin from './components/Admin'
import RealEstateTracker from './components/RealEstateTracker'
import RealEstateGraph from './components/RealEstateGraph'
import {render} from 'react-dom'
import ReactGA from 'react-ga';
import './css/index.css';
import {
    Router,
    Route,
    browserHistory
} from 'react-router'

ReactGA.initialize('UA-103157646-1');

browserHistory.listen(function (location) {
    ReactGA.set({ page: window.location.pathname });
    ReactGA.pageview(window.location.pathname);
});

render((
    <Router history={browserHistory}>
        <Route path="/" component={Layout}>
            <Route path="/testing" component={Testing} />
            <Route path="/admin" component={Admin} />
            <Route path="/real-estate-map" component={RealEstateTracker} />
            <Route path="/real-estate-graph" component={RealEstateGraph} />
        </Route>
    </Router>
), document.getElementById('root'))
