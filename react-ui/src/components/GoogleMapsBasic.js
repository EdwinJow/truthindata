import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';

class BasicMap extends Component {
    static defaultProps = {
        center: { lat: 33.453566, lng: -112.069103 },
        zoom: 11
    };

    render() {
        return (
            <GoogleMapReact
                defaultCenter={this.props.center}
                defaultZoom={this.props.zoom}
                bootstrapURLKeys={{
                    key: 'AIzaSyCmNcnbIz0a7PJ-FxUWohaX9rMq370-l6o&libraries=geometry'
                }}                
            >
            </GoogleMapReact>
        );
    }
}

export default BasicMap;