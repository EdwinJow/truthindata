import React, { Component } from 'react';
import SimpleMap from './GoogleMapsBasic';

class RealEstateTracker extends Component {
    componentDidMount(){
        console.log(process.env)
    }
    render() {
        return (
            <div className="height-100">
                <SimpleMap/>
            </div>
        );
    }
}

export default RealEstateTracker;
