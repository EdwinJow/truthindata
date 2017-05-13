import React, { Component } from 'react';
import runtimeEnv from '@mars/heroku-js-runtime-env';

class RealEstateTracker extends Component {
    componentDidMount(){
        const env = runtimeEnv();
        console.log(env)
    }
    render() {
        return (
            <div>
                <div></div>
            </div>
        );
    }
}

export default RealEstateTracker;
