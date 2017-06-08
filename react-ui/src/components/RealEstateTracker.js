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
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import mapStyles from './googlemaps/styles/grayscale.json'
import '../css/real-estate-tracker.min.css'

const SimpleMapExampleGoogleMap = withGoogleMap(props => (
        <GoogleMap
            defaultZoom={7}
            defaultCenter={{ lat: 33.453566, lng: -112.069103 }}
            defaultOptions={{ styles: mapStyles }}
        >
        {props.polys.map((poly, index) => (
            <Polygon
                key={poly.id}
                strokeOpacity={0.8}
                strokeWeight={.5}
                fillOpacity={2}
                paths={poly.paths}
                onClick={props.parentComponent.handlePolyClick}
                options={{
                    fillColor: poly.fillColor ? poly.fillColor : '#13a168',
                    strokeColor: poly.strokeColor ? poly.strokeColor : '#13a168',
                    label: poly.label,
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
                onClick={props.parentComponent.handleMarkerClick}
                options={{
                    parentComponent: props.parentComponent
                }}
            />
        ))}
    </GoogleMap>
));

export default class RealEstateTracker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            polys: [{ paths: [], id: 0 }],
            gmap: null,
            modalOpen: false,
            modalTitle: null,
            markers: [{ centroid: null, key: 0}],
            geotype: 1,
            dates: [],
            startDate: '2010-10',
            endDate: '2010-10'
        };

        this.bindGeoTypes= this.bindGeoTypes.bind(this);
        this.getGeoShapes = this.getGeoShapes.bind(this);
        this.getZips = this.getZips.bind(this);
    }

    componentDidMount() {
        axios.get('/dates/real-estate-tracker')
            .then(function (response) {
                var dates = response.data.sort();
                this.setState({ dates: dates });
            }
            .bind(this))
            .catch(function (error) {
                console.log(error);
            });
    }

    getZips(state){
        axios.get('/Zips', {
            params: {
                State: state,
                StartDate: this.state.startDate,
                EndDate: this.state.endDate
            }
        })
            .then(function (response) {
                debugger;
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
                State: req.type
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
        let _this = this.parentComponent;

        if(_this.state.geotype === 1 && isState){
            _this.getGeoShapes('counties', this.label);
                return;
        }

        if(_this.state.geotype === 2 && isState){
            _this.getZips(this.label);
            return;
        }
        
        _this.handleModalOpen(this.label);
    }

    handleMarkerClick(e){
        let _this = this.parentComponent;
        _this.handleModalOpen(this.label);
    }

    handleModalOpen = (label) => {
        this.setState({ modalOpen: true, modalTitle: label });
    };

    handleModalClose = () => {
        this.setState({ modalOpen: false });
    };

    handleStartDateChange = (event, index, value) =>{
        this.setState({ startDate: value })
    }

    handleEndDateChange = (event, index, value) =>{
        debugger;
        this.setState({ endDate: value })
    }

    bindGeoTypes(event, menuItem,index){
        let type = menuItem.props.primaryText;
        let req = {
            type: type,
            startDate: this.state.startDate,
            endDate: this.state.endDate
        }
        this.getGeoShapes(req)       
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
                    polys={this.state.polys}
                    markers={this.state.markers}
                    parentComponent={this}             
                />  
                <Dialog
                    title={this.state.modalTitle}
                    modal={false}
                    actions={actions}
                    open={this.state.modalOpen}
                    onRequestClose={this.handleModalClose}
                >
                </Dialog>
                <Paper className='side-menu' style={{ height: '100%', width: '500px', backgroundColor: 'rgba(0,0,0,.8)', padding: '10px 20px', position: 'fixed', top: '68px' }} zDepth={1}>
                    <Paper style={{ display: 'inline-block' }}>
                        <Menu onItemTouchTap={this.bindGeoTypes}>
                            <MenuItem primaryText="states" key="states" />
                        </Menu>
                    </Paper>
                    <Paper className="metric-container" style={{ display: 'block' }}>
                        <h3>Metric Type</h3>
                        <DropDownMenu style={{ display: 'block', width: '100%'}} value={this.state.geotype} onChange={this.handleGeoTypeChange}>
                            <MenuItem value={1} primaryText="Sold For Gain" />
                            <MenuItem value={2} primaryText="Price To Rent" />
                        </DropDownMenu>
                        <div style={{ width: '50%', display: 'inline-block', marginTop: '10px' }}>
                            <h3>Start Date</h3>
                            <DropDownMenu style={{ display: 'inline-block', width: '100%' }} value={this.state.startDate} onChange={this.handleStartDateChange}>
                                {this.state.dates.map((date, index) => (
                                    <MenuItem value={date.Date.trim()} primaryText={date.Date} key={index} />
                                ))}
                            </DropDownMenu>
                        </div>
                        <div style={{ width: '50%', display: 'inline-block' }}>
                            <h3>End Date</h3>
                            <DropDownMenu style={{ display: 'inline-block', width: '100%'}} value={this.state.endDate} onChange={this.handleEndDateChange}>
                                {this.state.dates.map((date, index) => (
                                    <MenuItem value={date.Date.trim()} primaryText={date.Date} key={index} />
                                ))}
                            </DropDownMenu>
                        </div>
                    </Paper>
                </Paper>
            </div>
        );
    }
}