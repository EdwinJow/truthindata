import {
    default as React,
    Component,
} from "react";

import {
    withGoogleMap,
    GoogleMap,
    Polygon,
    Marker,
} from "react-google-maps";

import axios from 'axios';
import DropDownMenu from 'material-ui/DropDownMenu'
import Paper from 'material-ui/Paper';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import {cyan300, orange300} from 'material-ui/styles/colors';
import mapStyles from './googlemaps/styles/grayscale.json'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

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
                    label: poly.label,
                    handleModalOpen: props.handleModalOpen,
                    getGeoShapes: props.getGeoShapes,
                    getZips: props.getZips,
                    type: poly.type,
                    state: poly.state,
                    parentComponent: props.parentComponent
                }}
            />
        ))}
        {props.markers.map((marker, index) => (
            <Marker
                {...marker}
                icon={{
                    path: 'M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z',
                    fillColor: '#ff9800',
                    fillOpacity: .8,
                    strokeColor: 'black',
                    strokeWidth: 1,
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
            modalTitle: null,
            markers: [{ centroid: null, key: 0}],
            geotype: 1
        };

        this.bindGeoTypes= this.bindGeoTypes.bind(this);
        this.getGeoShapes = this.getGeoShapes.bind(this);
        this.getZips = this.getZips.bind(this);
    }

    getZips(state){
        axios.get('/Zips', {
            params: {
                State: state
            }
        })
        .then(function (response) {
            var zips =  response.data.map(obj => (
                {
                    position: {
                        lat: obj.Lat,
                        lng: obj.Lng
                    },
                    key: obj.Zip,
                    label: obj.Zip.toString(),
                    state: obj.ContainingState
                }));
            this.setState({markers: zips});
        }
        .bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    getGeoShapes(type, req){
        axios.get('/' + type, {
            params: {
                State: req
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
                    label: obj.State ? obj.State : obj.GeoName,
                    state: obj.State ? obj.State : obj.ContainingState,
                    type: type 
                }));
            this.setState({polys: polys});
        }
        .bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    handleMapMounted(map) {
        this._map = map;
    }

    handlePolyClick(e){        
        debugger;
        console.log(this.label);
        let isState = this.type === 'states';

        if(this.parentComponent.state.geotype === 1 && isState){
            this.getGeoShapes('counties', this.label);
                return;
        }

        if(this.parentComponent.state.geotype === 2 && isState){
            this.getZips(this.label);
            return;
        }
        
        this.handleModalOpen(this.label)
    }

    handleModalOpen = (label) => {
        this.setState({ modalOpen: true, modalTitle: label });
    };

    handleModalClose = () => {
        this.setState({ modalOpen: false });
    };

    bindGeoTypes(event, menuItem,index){
        var type = menuItem.props.primaryText.toLowerCase();
        this.getGeoShapes(type)       
    }

    handleGeoTypeChange = (event, index, value) => this.setState({geotype: value});

    render() {
        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onTouchTap={this.handleModalClose}
            />
        ];
        return (
            <div className="height-100">
                <SimpleMapExampleGoogleMap
                    containerElement={
                        <div style={{ height: `100%` }} />
                    }
                    mapElement={
                        <div style={{ height: `100%` }} />
                    }
                    onMapMounted={this.handleMapMounted}
                    onPolyClick={this.handlePolyClick}
                    handleModalOpen={this.handleModalOpen}
                    getZips={this.getZips}
                    getGeoShapes={this.getGeoShapes}
                    polys={this.state.polys}
                    markers={this.state.markers}
                    parentComponent={this}             
                />
                <Paper style={{display: 'inline-block', margin: '16px 32px 16px 0', position: 'absolute', top: '12em', left: '9.5em'}}>
                    <Menu onItemTouchTap={this.bindGeoTypes}>
                        {/*<MenuItem primaryText="Counties" />*/}
                        <MenuItem primaryText="States" />
                    </Menu>
                </Paper>
                <Dialog
                    title={this.state.modalTitle}
                    modal={false}
                    actions={actions}
                    open={this.state.modalOpen}
                    onRequestClose={this.handleModalClose}
                >
                </Dialog>
                <DropDownMenu style={{display: 'inline-block', margin: '16px 32px 16px 0', position: 'absolute', top: '8em', left: '9.5em'}} value={this.state.geotype} onChange={this.handleGeoTypeChange}>
                    <MenuItem value={1} primaryText="Sold For Gain" />
                    <MenuItem value={2} primaryText="Price To Rent" />
                </DropDownMenu>
            </div>
        );
    }
}