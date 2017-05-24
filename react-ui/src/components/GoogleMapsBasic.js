import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';

// const AnyReactComponent = ({ text }) => <div>{text}</div>;

class SimpleMap extends Component {
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
                    key: 'AIzaSyCmNcnbIz0a7PJ-FxUWohaX9rMq370-l6o'
                }}
            >
            </GoogleMapReact>
        );
    }
}

export default SimpleMap;