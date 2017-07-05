import React, { Component } from 'react';
import '../../css/shared/generic-loader.min.css';

class GenericLoader extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: props.open
        };
    }
       
    componentWillReceiveProps(nextProps) {
        if (nextProps.open !== this.state.open) {
            this.setState({ open: nextProps.open });
        }
    }

    render() {
        return (
            <div id="generic-loader" className={this.state.open ? '' : 'hidden' }>
                <div className="center-element">
                    <img src={require("../../images/loaders/ripple.svg")} alt="loader"/>
                </div>
            </div>
        );
    }
}

export default GenericLoader;
