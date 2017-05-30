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
import Paper from 'material-ui/Paper';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import {cyan300, orange300} from 'material-ui/styles/colors';
import mapStyles from './googlemaps/styles/grayscale.json'
import Dialog from 'material-ui/Dialog';

const SimpleMapExampleGoogleMap = withGoogleMap(props => (
        <GoogleMap
            defaultZoom={7}
            defaultCenter={{ lat: 33.453566, lng: -112.069103 }}
            defaultOptions={{ styles: mapStyles }}
        >
        {props.polys.map((poly, index) => (
            <Polygon
                key={poly.id}
                /*draggable
                editable*/
                strokeOpacity={0.8}
                strokeWeight={.5}
                fillOpacity={2}
                paths={poly.paths}
                onClick={props.onPolyClick}
                options={{
                    fillColor: poly.fillColor ? poly.fillColor : '#13a168',
                    strokeColor: poly.strokeColor ? poly.strokeColor : '#13a168',
                    state: poly.state,
                    modalOpen: props.onModalOpen
                }}
            />
        ))}
    </GoogleMap>
));

export default class SimpleMapExample extends Component {
    constructor(props) {
        super(props);
        this.state = {
            polys: [{ paths: [], id: 0 }],
            gmap: null,
            modalOpen: false,
            modalTitle: null
        };

        this.bindGeoTypes= this.bindGeoTypes.bind(this);
    }

    handleMapMounted(map) {
        this._map = map;
    }

    handlePolyClick(e){
        this.modalOpen(this.state);
    }

    handleModalOpen = (state) => {
        this.setState({ modalOpen: true, modalTitle: state });
    };

    handleClose = () => {
        this.setState({ modalOpen: false });
    };

    bindGeoTypes(event, menuItem,index){
        var type = menuItem.props.primaryText.toLowerCase();

        axios.get('/' + type, {
            params: {
                State: null
            }
        })
        .then(function (response) {
            const encoder = window.google.maps.geometry.encoding;
            let color;

            type === 'counties' ? color = orange300 : color = cyan300;

            var polys =  response.data.map(obj => (
                {
                    paths: encoder.decodePath(obj.EncodedPolyline),
                    id: obj._id,
                    fillColor: color,
                    state: obj.State ? obj.State : obj.ContainingState 
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
                    onMapMounted={this.handleMapMounted}
                    onPolyClick={this.handlePolyClick}
                    onModalOpen={this.handleModalOpen}
                />
                <Paper style={{display: 'inline-block', margin: '16px 32px 16px 0', position: 'absolute', top: '8em', left: '9.5em'}}>
                    <Menu onItemTouchTap={this.bindGeoTypes}>
                        <MenuItem primaryText="Counties" />
                        <MenuItem primaryText="States" />
                    </Menu>
                </Paper>
                <Dialog
                    title={this.state.modalTitle}
                    modal={false}
                    open={this.state.modalOpen}
                    onRequestClose={this.handleModalClose}
                >
                </Dialog>
            </div>
        );
    }
}