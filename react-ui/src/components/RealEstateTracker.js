import React, { Component } from 'react';
import GoogleMap from 'google-map-react'
import Polyline from './Polyline'
class RealEstateTracker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            map: null,
            gmaps: null,
            mapLoaded: null
        };
    }

    componentDidMount() {
        console.log(process.env)
    }

    static defaultProps = {
        center: { lat: 33.453566, lng: -112.069103 },
        zoom: 11
    };

    render() {
        return (
            <div className="height-100">
                <GoogleMap
                    defaultCenter={this.props.center}
                    defaultZoom={this.props.zoom}
                    bootstrapURLKeys={{
                        key: 'AIzaSyCmNcnbIz0a7PJ-FxUWohaX9rMq370-l6o&libraries=geometry'
                    }}
                    onGoogleApiLoaded={({ map, maps }) => { this.setState({ map: map, gmaps: maps, mapLoaded: true }) }}
                    yesIWantToUseGoogleMapApiInternals
                >
                </GoogleMap>
                {this.state.mapLoaded && <Polyline map={this.state.map} gmaps={this.state.gmaps} />}
            </div>
        );
    }
}

export default RealEstateTracker;
