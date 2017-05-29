import {
    default as React,
    Component,
} from "react";

import {
    withGoogleMap,
    GoogleMap,
    Polygon,
} from "react-google-maps";

import axios from 'axios';

const SimpleMapExampleGoogleMap = withGoogleMap(props => (
        <GoogleMap
            defaultZoom={7}
            defaultCenter={{ lat: 33.453566, lng: -112.069103 }}
        >
        <Polygon
            /*draggable
            editable*/
            strokeColor="#13a168"
            strokeOpacity={0.8}
            strokeWeight={2}
            fillColor="#13a168"
            fillOpacity={2}
            paths={props.paths}
        />
    </GoogleMap>
));

export default class SimpleMapExample extends Component {
    constructor(props) {
        super(props);
        this.state = {
            paths: null
        };
    }

    componentDidMount(){
        axios.get('/states', {
            params: {
                State: "AZ"
            }
        })
        .then(function (response) {
            const encoder = window.google.maps.geometry.encoding;
            var polylines = response.data.map(obj => obj.EncodedPolyline);
            var paths = polylines.map(obj => encoder.decodePath(obj));
            this.setState({paths: paths});
        }
        .bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }
    render() {
        return (
            <div className="height-100">
                <SimpleMapExampleGoogleMap
                    containerElement={
                        <div style={{ height: `100%` }} />
                    }
                    mapElement={
                        <div style={{ height: `100%` }} />
                    }
                    paths={this.state.paths}
                />
            </div>
        );
    }
}