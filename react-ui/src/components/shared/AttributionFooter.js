import React, { Component } from 'react';
import axios from 'axios';

class AttributionFooter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSources: []
        };
    }

    render() {
        return (
            <div style={{width: '100%'}}>
                {this.state.dataSources.map((obj, index) => 
                    <span key={index}>{obj.Title}</span>
                )}
            </div>
        );
    }
}

export default Testing;
