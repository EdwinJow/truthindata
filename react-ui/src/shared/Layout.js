import React, { Component } from 'react';
import '../css/main.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Paper from 'material-ui/Paper';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import { Link } from 'react-router'
import injectTapEventPlugin from 'react-tap-event-plugin';
import AppBar from 'material-ui/AppBar';
import {primaryColorDark, primaryAccentColor} from '../styles/colors.js';

injectTapEventPlugin();

class Layout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: null,
            fetching: true,
            sidebarOpen: false
        };
    }

    handleSidebarOpen = () => {
        this.setState({
            sidebarOpen: !this.state.sidebarOpen
        });
    }

    render() {
        return (
            <MuiThemeProvider>
                <div id="main-container">
                    <AppBar
                        title="truth|in|data"
                        titleStyle={{color: primaryAccentColor}}
                        style={{backgroundColor: primaryColorDark}}
                        onLeftIconButtonTouchTap={this.handleSidebarOpen}
                        className='main-app-bar'	
                    />
                    <div id="flex-container">
                        <Paper id="main-sidebar" zDepth={2} className={this.state.sidebarOpen ? 'open' : ''}>
                            <Menu>
                                <MenuItem primaryText="Testing" containerElement={<Link to="/testing" />} />
                                {/* <MenuItem primaryText="Admin" containerElement={<Link to="/admin" />} /> */}
                                <MenuItem primaryText="Map" containerElement={<Link to="/real-estate-map" />} />
                                <MenuItem primaryText="Graph" containerElement={<Link to="/real-estate-graph" />} />
                            </Menu>
                        </Paper>

                        <div id="content-container">
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }
}

export default Layout;
