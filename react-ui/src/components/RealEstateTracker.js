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
        if(props){}
        {props.polys.map((poly, index) => (
            <Polygon
                key={poly.id}
                /*draggable
                editable*/
                strokeColor="#13a168"
                strokeOpacity={0.8}
                strokeWeight={2}
                fillColor="#13a168"
                fillOpacity={2}
                paths={poly.paths}
            />
        ))}
    </GoogleMap>
));

export default class SimpleMapExample extends Component {
    constructor(props) {
        super(props);
        this.state = {
            polys: [{ paths: [], id: 0 }]
        };
    }

    componentDidMount(){
        axios.get('/states', {
            params: {
                State: null
            }
        })
        .then(function (response) {
            const encoder = window.google.maps.geometry.encoding;
            var polys =  response.data.map(obj => (
                {
                    paths: encoder.decodePath(obj.EncodedPolyline),
                    id: obj._id
                }));
            this.setState({polys: polys});
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
                    polys={this.state.polys}
                />
            </div>
        );
    }
}