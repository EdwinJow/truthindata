import React, { Component } from 'react';
import '../css/main.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Paper from 'material-ui/Paper';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import { Link } from 'react-router'
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

class Layout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: null,
            fetching: true
        };
    }

    render() {
        return (
            <MuiThemeProvider>
                <div id="main-container">
                    <div id="header">
                        <h2>truth|in|data</h2>
                    </div>
     
                    <div id="flex-container">
                        <Paper id="main-sidebar" zDepth={2}>
                            <Menu>
                                <MenuItem primaryText="Testing" containerElement={<Link to="/testing" />} />
                                <MenuItem primaryText="Admin" containerElement={<Link to="/admin" />} />
                            </Menu>
                        </Paper>

                        <div id="content-container">
                            {this.props.children}
                        </div>
                    </div>

                    {/*<p className="App-intro">
                        {this.state.fetching
                            ? 'Fetching message from API'
                            : this.state.message}
                        </p>*/}
                </div>
            </MuiThemeProvider>
        );
    }
}

export default Layout;