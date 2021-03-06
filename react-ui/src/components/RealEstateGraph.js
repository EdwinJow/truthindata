import React, { Component } from 'react';
import axios from 'axios';

import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import IconButton from 'material-ui/IconButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import Checkbox from 'material-ui/Checkbox';
import AutoComplete from 'material-ui/AutoComplete';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import ReactTable from 'react-table'
import _ from 'lodash'
import 'react-table/react-table.css'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer }  from 'recharts';
import {orange500, indigo500, blue500, blueGrey100} from 'material-ui/styles/colors';
import GenericLoader from './shared/GenericLoader.js';
import {Tabs, Tab} from 'material-ui/Tabs';
import SwipeableViews from 'react-swipeable-views';
import ModalDemographics from './ModalDemographics.js'
import '../css/real-estate-graph.css'

import { withGoogleMap, GoogleMap, Marker, Circle } from "react-google-maps";
import mapStyles from './googlemaps/styles/grayscale.json'

const LimitToMap = withGoogleMap(props => (
    <GoogleMap
        defaultZoom={7}
        defaultCenter={{ lat: 33.453566, lng: -112.069103 }}
        defaultOptions={{ styles: mapStyles }}
    >
        {props.markers.map((marker, index) => (
            <Marker
                {...marker}
                onRightClick={() => props.onMarkerRightClick(index)}
            />
        ))}
    </GoogleMap>
));

class RealEstateGraph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: '2015-10',
            endDate: '2017-01',
            tableData: [],
            graphData: [],
            dateRange: [],
            metric: 'All',
            modalOpen: false,
            modalBody: 'Beepbepp',
            metricModalOpen: false,
            mapModalOpen: false,
            aggregator: 'avg',
            tableKey: 1,
            loaderOpen: true,
            slideIndex: 0,
            stateSelect: 'AZ',
            zipDetailTab: 'metric-graph',
            limitTo: {
                zip: "",
                radius: "",
                zipArr: []
            },
            regionDetails: {
                stateName: 'AZ',
                city: null,
                zip: null
            },
            demographicsMetrics: [],
            householdMetrics: [],
            demographicAverages: {
                Zip : 85003,
                PercentInLaborForce : 55.2,
                PercentUnemployed : 4.7,
                PercentManagementJobs : 51.2,
                PercentServiceJobs : 15.6,
                PercentSalesOfficeJobs : 21.4,
                PercentConstructionJobs : 3.5,
                PercentManufacturingTransportationJobs : 8.4,
                TotalHouseholds : 3945,
                PercentHouseholdIncome25k : 34.4,
                PercentHouseholdIncome25k50k : 20.7,
                PercentHouseholdIncome50k75k : 10.9,
                PercentHouseholdIncome75k100k : 8,
                PercentHouseholdIncome100k150k : 15.5,
                PercentHouseholdIncome150k200k : 5.3,
                PercentHouseholdIncome200k : 5,
                TotalHouseholdMedianIncome : 41038,
                TotalHouseholdMeanIncome : 67808,
                PerCapitaIncome : 30082,
                PercentHealthInsured : 82.8,
                PercentNonHealthInsured : 17.2,
                PercentFamiliesBelowPovertyLevel : 24.4,
                PercentPeopleBelowPovertyLevel : 31.5,
                TotalPop18to24 : 848,
                Total18to24LessThanHighSchool : 375,
                Percent18to24LessThanHighSchool : 44.2,
                Total18to24HighSchoolGraduate : 219,
                Percent18to24HighSchoolGraduate : 25.8,
                Total18to24SomeCollegeOrAssociates : 153,
                Percent18to24SomeCollegeOrAssociates : 18,
                Total18to24BachelorsOrHigher : 101,
                Percent18to24BachelorsOrHigher : 11.9,
                TotalPop25Older : 7096,
                TotalPop25OlderLessThanHighSchool : 1447,
                PercentPop25OlderLessThanHighSchool : 20.4,
                TotalPop25OlderHighSchoolGraduate : 1366,
                PercentPop25OlderHighschoolGraduate : 19.3,
                TotalPop25OlderSomeCollege : 1706,
                PercentPop25OlderSomeCollege : 24,
                TotalPop25OlderAssociates : 281,
                PercentPop25OlderAssociates : 4,
                TotalPop25OlderBachelors : 1258,
                PercentPop25OlderBachelors : 17.7,
                TotalPop25OlderGraduates : 1038,
                PercentPop25OlderGraduates : 14.6,
                TotalPercentHighschoolOrHigher : 79.6,
                TotalPercentBachelorsOrHigher : 32.4,
                Year : 2015
            },
            demographics: {
                Zip : 85003,
                PercentInLaborForce : 55.2,
                PercentUnemployed : 4.7,
                PercentManagementJobs : 51.2,
                PercentServiceJobs : 15.6,
                PercentSalesOfficeJobs : 21.4,
                PercentConstructionJobs : 3.5,
                PercentManufacturingTransportationJobs : 8.4,
                TotalHouseholds : 3945,
                PercentHouseholdIncome25k : 34.4,
                PercentHouseholdIncome25k50k : 20.7,
                PercentHouseholdIncome50k75k : 10.9,
                PercentHouseholdIncome75k100k : 8,
                PercentHouseholdIncome100k150k : 15.5,
                PercentHouseholdIncome150k200k : 5.3,
                PercentHouseholdIncome200k : 5,
                TotalHouseholdMedianIncome : 41038,
                TotalHouseholdMeanIncome : 67808,
                PerCapitaIncome : 30082,
                PercentHealthInsured : 82.8,
                PercentNonHealthInsured : 17.2,
                PercentFamiliesBelowPovertyLevel : 24.4,
                PercentPeopleBelowPovertyLevel : 31.5,
                TotalPop18to24 : 848,
                Total18to24LessThanHighSchool : 375,
                Percent18to24LessThanHighSchool : 44.2,
                Total18to24HighSchoolGraduate : 219,
                Percent18to24HighSchoolGraduate : 25.8,
                Total18to24SomeCollegeOrAssociates : 153,
                Percent18to24SomeCollegeOrAssociates : 18,
                Total18to24BachelorsOrHigher : 101,
                Percent18to24BachelorsOrHigher : 11.9,
                TotalPop25Older : 7096,
                TotalPop25OlderLessThanHighSchool : 1447,
                PercentPop25OlderLessThanHighSchool : 20.4,
                TotalPop25OlderHighSchoolGraduate : 1366,
                PercentPop25OlderHighschoolGraduate : 19.3,
                TotalPop25OlderSomeCollege : 1706,
                PercentPop25OlderSomeCollege : 24,
                TotalPop25OlderAssociates : 281,
                PercentPop25OlderAssociates : 4,
                TotalPop25OlderBachelors : 1258,
                PercentPop25OlderBachelors : 17.7,
                TotalPop25OlderGraduates : 1038,
                PercentPop25OlderGraduates : 14.6,
                TotalPercentHighschoolOrHigher : 79.6,
                TotalPercentBachelorsOrHigher : 32.4,
                Year : 2015
            },
            householdAverages: {
                TotalHousingUnits: 7139,
                PercentHousingUnitsOccupied: 73.9113581133477,
                PercentHousingUnitsVacant: 24.1133333217951,
                PercentOwnerOccupied: 66.6017284662635,
                PercentRenterOccupied: 30.9298765241364,
                PercentValue100k: 34.7597530064759,
                PercentValue100k200k: 30.0266666385863,
                PercentValue200k300k: 15.0106172981086,
                PercentValue300k500k: 11.0681481527325,
                PercentValue500k1m: 4.4330864213867,
                PercentValue1m: 1.24098765724971,
                MedianHouseholdValue: 151163,
                TotalRentalHouseholds: 2107,
                PercentRent500: 18.3809876479116,
                PercentRent500to1000: 42.6345679200726,
                PercentRent1500to2000: 65,
                PercentRent2000to2500: 32,
                PercentRent2500to3000: 23,
                PercentRent3000: 23,
                Year: 2015
            },
            household: {
                TotalHousingUnits: 7139,
                PercentHousingUnitsOccupied: 73.9113581133477,
                PercentHousingUnitsVacant: 24.1133333217951,
                PercentOwnerOccupied: 66.6017284662635,
                PercentRenterOccupied: 30.9298765241364,
                PercentValue100k: 34.7597530064759,
                PercentValue100k200k: 30.0266666385863,
                PercentValue200k300k: 15.0106172981086,
                PercentValue300k500k: 11.0681481527325,
                PercentValue500k1m: 4.4330864213867,
                PercentValue1m: 1.24098765724971,
                MedianHouseholdValue: 151163,
                TotalRentalHouseholds: 2107,
                PercentRent500: 18.3809876479116,
                PercentRent500to1000: 42.6345679200726,
                PercentRent1500to2000: 65,
                PercentRent2000to2500: 32,
                PercentRent2500to3000: 23,
                PercentRent3000: 23,
                Year: 2015
            },
            autocompleteZips: [],
            markers: []
        };

        this.getPriceToRentData = this.getTableMetricData.bind(this);
        this.getDateRange = this.getDateRange.bind(this);
    }
    
    componentDidMount(){
        this.getDateRange();
        this.getTableMetricData();
        this.getAutocompleteData();
    }

    handleDateChange = (value, type) => {
        if(type === 'start'){
            this.setState({startDate: value}, function(){
                this.getTableMetricData();
            });
        }
        if(type === 'end'){
            this.setState({endDate: value}, function(){
                this.getTableMetricData();
            });
        }     
    };

    handleStateSelectChange = (event, index, value) => {
        this.setState({
            stateSelect: value 
        }, function(){
            this.getAutocompleteData();
            this.getTableMetricData();
        });
    }

    handleAggregateChange = (event, index, value) => {
        this.setState({ aggregator: value});
    }

    handleMetricChange = (event, index, value) =>{
        this.setState({ metric: value }, function(){
            this.getTableMetricData();
        });
    }

    handleModalOpen = (type) =>{
        if(type === 'drilldown'){
            this.setState({modalOpen: true});
        }
        else if(type === 'metric'){
            this.setState({metricModalOpen: true});
        }
        else if(type === 'map'){
            this.setState({mapModalOpen: true});
        }
    }; 

    handleModalClose = (type) =>{
        if(type === 'drilldown'){
            this.setState({modalOpen: false});
        }
        else if(type === 'metric'){
            this.setState({metricModalOpen: false});
        }
        else if(type === 'map'){
            this.setState({mapModalOpen: false});
        }
    }; 

    handleMetricDefinitionTabChange = (value) => {
        this.setState({
            slideIndex: value,
        });
    };

    handleZipDetailTabChange = (value) => {
        this.setState({
            zipDetailTab: value
        });
    }
 
    handleRadiusChange = (event, value) => {
        this.setState({
            limitTo: Object.assign({}, this.state.limitTo, {
                radius: value
            })
        });
    }

    handleAutocompleteChange = (value) => {
        this.setState({
             limitTo: Object.assign({}, this.state.limitTo, {
                zip: value
            })
        });
    }

    clearLimitTo = () => {
        this.setState({ markers: [] });
        this.setState({
            limitTo: Object.assign({}, this.state.limitTo, {
               zip: "",
               zipArr: [],
               radius: ""
           })
       }, function(){
           this.getTableMetricData();
       });
    }

    getGeoNearZips = () => {
        axios.get('/zip-metrics/geo-near',{
            params: {
                Zip: this.state.limitTo.zip,
                Radius: this.state.limitTo.radius
            }
        })
        .then(function (response) {
            debugger;
            let data = response.data;
            let zipArr = [];

            for (let value of data) {
                zipArr.push(value.Zip);
            }

            let markers =  data.map(obj => (
                {
                    position: {
                        lat: obj.Lat,
                        lng: obj.Lng
                    },
                    key: obj.Zip,
                    label: obj.Zip.toString(),
                }));

            this.setState({
                limitTo: Object.assign({}, this.state.limitTo, {
                    zipArr: zipArr
                }),
                markers: markers
            }, function(){           
                this.getTableMetricData();
            });
        }
        .bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    getAutocompleteData = () => {   
        axios.get('/zip-metrics/all-zips',{
                params: {
                    State: this.state.stateSelect
                }
            })
            .then(function (response) {
                let data = response.data;
                let zips = [];
                
                for (let value of data) {
                    zips.push(value.Zip.toString());
                }

                this.setState({ autocompleteZips: zips });
            }
            .bind(this))
            .catch(function (error) {
                console.log(error);
            });
    }

    getLimitedDemographicAverages = () => {
        axios.get('/zip-metrics/recast-demographic-averages',{
            params: {
                LimitToZips: JSON.stringify(this.state.limitTo.zipArr)
            }
        })
        .then(function (response) {
            let data = response.data.averages;
            if(data !== {}){
                this.setState({ demographicAverages: data });
            }
        }
        .bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    getLimitedHouseholdAverages = () => {
        axios.get('/zip-metrics/recast-household-averages',{
            params: {
                LimitToZips: JSON.stringify(this.state.limitTo.zipArr)
            }
        })
        .then(function (response) {
            let data = response.data.averages;
            if(data !== {}){
                this.setState({ householdAverages: data });
            }
        }
        .bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    getDateRange = () => {
        axios.get('/zip-metrics/dates')
        .then(function (response) {
            let data = response.data;
            let len = data.dates.length;
            
            data.dates.sort();

            this.setState({
                dateRange: data.dates,
                endDate: data.dates[len - 1]
            });

        }.bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    getAllZipDemographics = () => {
        axios.get('/zip-metrics/demographics-all',{
            params: {
                State: this.state.stateSelect 
            }
        })
        .then(function (response) {
            let data = response.data;
            this.setState({
                demographicsMetrics: data.data,
                demographicAverages: data.averages
            });
        }.bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    getAllZipHouseholds = () => {
        axios.get('/zip-metrics/household-all',{
            params: {
                State: this.state.stateSelect 
            }
        })
        .then(function (response) {
            let data = response.data;
            this.setState({
                householdMetrics: data.data,
                householdAverages: data.averages
            });
        }.bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    getZipDemographics = () => {
        axios.get('/zip-metrics/demographics',{
            params: {
                Zip: this.state.regionDetails.zip,
                State: this.state.stateSelect 
            }
        })
        .then(function (response) {
            let data = response.data;
            this.setState({
                demographics: data
            });
            console.log(data);
        }.bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    getZipHousehold = () => {
        axios.get('/zip-metrics/household',{
            params: {
                Zip: this.state.regionDetails.zip
            }
        })
        .then(function (response) {
            let data = response.data;
            this.setState({
                household: data
            });
        }.bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    getTableMetricData = () =>{
        this.setState({ loaderOpen: true });
        axios.get('/zip-metrics/table', {
            params: {
                StartDate: this.state.startDate,
                EndDate: this.state.endDate,
                Metric: this.state.metric,
                LimitToZips: JSON.stringify(this.state.limitTo.zipArr),
                State: this.state.stateSelect
            }
        })
        .then(function (response) {
            var data = response.data;
            this.setState({
                tableData: data.records
            },
                this.setState({
                    loaderOpen: false
                })
            );
            if(this.state.limitTo.zipArr.length > 0 ){                
                this.getLimitedDemographicAverages();
                this.getLimitedHouseholdAverages();
            } else{
                this.getAllZipDemographics();
                this.getAllZipHouseholds();
            }
        }.bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    bindZipDrilldownDetails= (regionDetails, tabState) =>{
        this.setState({ 
            loaderOpen: true,
            zipDetailTab: tabState
         });
        this.setState({
            regionDetails:{
                stateName: regionDetails.stateName,
                zip: regionDetails.zip,
                city: regionDetails.city
            }
        }, () => {
            this.getZipDemographics();
            this.getZipHousehold();
        });

        axios.get('/zip-metrics/graph', {
            params: {
                StartDate: this.state.startDate,
                EndDate: this.state.endDate,
                Metric: this.state.metric,
                Zip: regionDetails.zip
            }
        })
        .then(function (response) {
            let data = response.data.records;
            let mean = _.meanBy(data, function(o) { return o.Value; });
            let dataLen = data.length;
            debugger;
            
            if (this.state.metric !== 'All') {
                let tableData = this.state.tableData;
                let tableDataLen = tableData.length;
                let hashMap = {};

                tableData.filter(row => row.Metric = this.state.metric);

                for (let i = 0; i < tableDataLen; i++) {
                    let date = tableData[i].Date;
                    let value = tableData[i].Value;

                    if (!hashMap.hasOwnProperty([date])) {
                        hashMap[date] = {
                            total: value,
                            occurances: 0
                        };
                    } else {
                        hashMap[date]['total'] += value;
                    }

                    if(value){
                        hashMap[date]['occurances']++;
                    }
                }

                for (let i = 0; i < dataLen; i++) {
                    let row = data[i];
                    let total = hashMap[row.Date].total;
                    let occurances = hashMap[row.Date].occurances;
                    row.Avg = total / occurances;
                }

            } else {
                for (let i = 0; i < dataLen; i++) {
                    let row = data[i];
                    row.Avg = mean;
                }
            }

            this.setState({
                graphData: data
            }, () => {
                this.setState({ loaderOpen: false });
            });        
            
            this.handleModalOpen('drilldown');
        }.bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    render() {
        let _this = this;

        const columns = [
        {
            Header: 'Zip',
            accessor: 'RegionName',
            PivotValue: ({ value, row }) => {
                let regionDetails = {
                    stateName: row.State,
                    city: row.City,
                    zip: value
                };
                return <span>
                    {value}
                    <IconButton
                        onTouchTap={() => this.bindZipDrilldownDetails(regionDetails, 'metric-graph')}
                        style={{float: 'right'}}
                        tooltip='Metric Chart'
                    >
                        <FontIcon className='material-icons' color={orange500} style={{marginTop: '5rem'}}>timeline</FontIcon>
                    </IconButton>
                    <IconButton
                        onTouchTap={() => this.bindZipDrilldownDetails(regionDetails, 'zip-details')}
                        style={{float: 'right'}}
                        tooltip='Zip Details'
                    >
                        <FontIcon className='material-icons' color={blue500} style={{marginTop: '5rem'}}>grain</FontIcon>
                    </IconButton>
                </span>
            }
        }, 
        {
            Header: 'City',
            accessor: 'City',
            aggregate: vals => vals[0],
            PivotValue: ({value}) => <span style={{color: 'darkblue'}}>{value}</span>,
            filterMethod: (filter, row) =>
              row[filter.id].toLowerCase().includes(filter.value.toLowerCase())
        }, 
        {
            Header: 'State',
            accessor: 'State',
            aggregate: vals => vals[0],
            PivotValue: ({value}) => <span style={{color: 'darkblue'}}>{value}</span>
        }, 
        {
            Header: 'Metric', 
            accessor: 'Metric',
            aggregate: vals =>{
                var unique = vals.filter((v, i, a) => a.indexOf(v) === i);
                return unique.join(', ');
            }
        },
        {
            Header: 'Value',
            accessor: 'Value',
            aggregate: (vals, rows) => {
                if(_this.state.aggregator === 'avg'){
                    let avg = _.round(_.mean(vals))
                    return {
                        number: avg,
                        template: avg  + ' (avg)'
                    };
                }
                if(_this.state.aggregator === 'percent'){
                    let rowLen = rows.length;
                    let sorted = rows.sort((a, b) => a.Date.localeCompare(b.Date));
                    let startDate = sorted[0].Date;
                    let endDate = sorted[rowLen - 1].Date;

                    let startObjs = rows.filter(function(obj){
                        return obj.Date === startDate;
                    });

                    let endObjs = rows.filter(function(obj){
                        return obj.Date === endDate;
                    });

                    let startVal = startObjs.reduce((a, b) => ( a + b.Value), 0);
                    let endVal = endObjs.reduce((a, b) => ( a + b.Value), 0);

                    let percent = Math.round(((endVal - startVal) / startVal)  * 100);

                    if(isNaN(percent)){
                        percent = 0;
                    }

                    if(!isFinite(percent)){
                        percent = Math.round(endVal - startVal)
                    };

                    let t = 'increase';

                    if(percent <=0){
                        t = 'decrease';
                    }

                    return {
                        number: percent,
                        template: percent + ' (% ' + t + ')'
                    };
                }
            },
            sortMethod: (a, b) => {
                return a.number > b.number ? 1 : -1;
            },
            Aggregated: row => {
                let color = row.value.number <= 0 ? 'red' : 'blue';
                return <span style={{color: color}}>{row.value.template}</span>
            }
        },
        {
            Header: 'Date',
            accessor: 'Date',
            PivotValue: ({value}) => <span style={{color: 'darkblue'}}>{value}</span>
        }];

        const modalActions = [
            <FlatButton
                href={"https://www.trulia.com/" + this.state.regionDetails.stateName +"/" + this.state.regionDetails.city + "/"+ this.state.regionDetails.zip + "/"}
                target="_blank"
                label="Trulia"
                labelStyle={{color: orange500}}
                labelPosition="before"
                secondary={true}            
                icon={<FontIcon className='material-icons' color={orange500}>home</FontIcon>}
            />,
            <FlatButton
                href={"http://www.realtor.com/realestateandhomes-search/" + this.state.regionDetails.zip}
                target="_blank"
                label="Realtor"
                labelPosition="before"
                secondary={true}            
                icon={<FontIcon className='material-icons'>home</FontIcon>}
            />,
            <FlatButton
                href={"https://www.zillow.com/homes/for_sale/"+this.state.regionDetails.zip+"_rb/?fromHomePage=true&shouldFireSellPageImplicitClaimGA=false&fromHomePageTab=buy"}
                target="_blank"
                label="Zillow"
                labelPosition="before"
                labelStyle={{color: blue500}}         
                icon={<FontIcon className='material-icons' color={blue500}>home</FontIcon>}
            />,
            <FlatButton
                label='Cancel'
                primary={true}
                onTouchTap={() => this.handleModalClose('drilldown')}
            />
        ]

        const metricModalActions = [
            <FlatButton
                label='Cancel'
                primary={true}
                onTouchTap={() => this.handleModalClose('metric')}
            />
        ]

        const mapModalActions = [
            <FlatButton
                label='Close'
                primary={true}
                onTouchTap={() => this.handleModalClose('map')}
            />
        ]

        return (         
            <div className='height100'> 
                <small style={{float:'right', color: {blueGrey100}, marginTop: '5px', marginRight: '5px', fontSize: '70%'}}>
                    Data Sources:&nbsp;&nbsp;
                    <a href="https://www.zillow.com/research/data/" style={{color: {blueGrey100}}} target="_blank">Zillow</a>&nbsp;&nbsp;
                    <a href="https://factfinder.census.gov" style={{color: {blueGrey100}}}  target="_blank">US Census</a>
                </small>
                <IconButton
                    tooltip="Metric Detail"
                    onTouchTap={() => this.handleModalOpen('metric')}
                    iconClassName="material-icons"
                    style={{ float: 'left' }}
                    tooltipPosition="bottom-right"
                >
                    select_all
                </IconButton>
                <SelectField
                    floatingLabelText='State Select'
                    value={this.state.stateSelect}
                    onChange={this.handleStateSelectChange}
                    style={
                        {
                            marginLeft: '15px',
                            width: '100px'
                        }
                    }
                    autoWidth={true}>
                    <MenuItem value={'AZ'} primaryText='AZ' />
                    <MenuItem value={'CA'} primaryText='CA' />              
                    <MenuItem value={'PA'} primaryText='PA' />
                </SelectField>
                <SelectField
                    floatingLabelText='Metric Select'
                    value={this.state.metric}
                    onChange={this.handleMetricChange}
                    style={{
                        marginLeft: '15px'
                    }}
                >
                    <MenuItem value={'All'} primaryText='All' />
                    <MenuItem value={'ZHVI'} primaryText='Home Value Index' />              
                    <MenuItem value={'ZHVR'} primaryText='Home Value Rental Index' />
                    <MenuItem value={'IncreasingValues'} primaryText='Increasing Value' />
                    <MenuItem value={'PriceToRent'} primaryText='Price To Rent' />
                </SelectField>
                <SelectField
                    floatingLabelText='Start Date'
                    value={this.state.startDate}
                    style={{
                        marginLeft: '20px',
                        width: '150px'
                    }}
                >
                    {this.state.dateRange.map((obj, index) => (
                        <MenuItem key={index} 
                            value={obj} 
                            primaryText={obj} 
                            onTouchTap={() => this.handleDateChange(obj, 'start')}/>
                    ))}
                </SelectField>
                <SelectField
                    floatingLabelText='End Date'
                    value={this.state.endDate}
                    style={{
                        marginLeft: '20px',
                        width: '150px'
                    }}
                >
                    {this.state.dateRange.map((obj, index) => (
                        <MenuItem key={index} 
                            value={obj} 
                            primaryText={obj} 
                            onTouchTap={() => this.handleDateChange(obj, 'end')}/>
                    ))}
                </SelectField>
                <SelectField
                    floatingLabelText='Aggregator'
                    value={this.state.aggregator}
                    onChange={this.handleAggregateChange}
                    style={{
                        marginLeft: '20px',
                        width: '180px'
                    }}
                >
                    <MenuItem value={"avg"} primaryText={"Average"}/>
                    <MenuItem value={"percent"} primaryText={"% Change"}/>
                </SelectField>
                <RaisedButton
                    onTouchTap={() => this.handleModalOpen('map')}
                    className={(this.state.limitTo.zipArr.length > 0 ? 'limit-btn-active': '')}
                    label={(this.state.limitTo.zipArr.length > 0 ? 'FILTER ACTIVE': 'Limit Results')}
                    style={{
                        top: '-20px',
                        position: 'relative',
                        marginLeft: '20px'
                    }}
                />
                <ReactTable
                    key={this.state.tableKey}
                    data={this.state.tableData}
                    columns={columns}
                    pivotBy={['RegionName']}
                    filterable={true}
                    defaultSorted={[
                        {
                            id: 'Date'
                        }
                    ]}
                    getTdProps={(state, rowInfo, column, instance) => {
                        return {
                            onClick: e => console.log('Click', {
                                state,
                                rowInfo,
                                column,
                                instance,
                                event: e
                            })
                        }
                    }}
                />
                <Dialog
                    title={'Zip Detail: ' + this.state.regionDetails.zip}
                    modal={false}
                    actions={modalActions}
                    open={this.state.modalOpen}
                    onRequestClose={() => this.handleModalClose('drilldown')}
                    contentStyle={{width: '100vw', maxWidth: 'none', height:'100vh', maxHeight: 'none', translateX:'0'}}
                    autoScrollBodyContent={true}
                    className={'zip-detail-modal'}
                >   
                    <Tabs
                        value={this.state.zipDetailTab}
                        onChange={this.handleZipDetailTabChange}
                    >
                        <Tab label="Metric Graph" value="metric-graph">
                            <ResponsiveContainer width='100%' height='100%' minHeight={400} minWidth={400}>
                                <LineChart 
                                    data={this.state.graphData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis dataKey='Date' />
                                    <YAxis domain={['dataMin', 'auto']}/>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <Tooltip />
                                    <Legend />
                                    <Line type='monotone' dataKey='Value' stroke='#8884d8'/>
                                    <Line type='monotone' dataKey='Avg' name={(this.state.limitTo.zipArr.length > 0 ? 'Active Radius Average' : this.state.regionDetails.stateName + ' Avg')} stroke='#FF9800'/>
                                </LineChart>
                            </ResponsiveContainer>
                        </Tab>
                        <Tab label="Zip Details" value="zip-details">
                            <ModalDemographics 
                                demographics={this.state.demographics} 
                                demographicsAvg={this.state.demographicAverages}
                                household={this.state.household}
                                householdAvg={this.state.householdAverages}
                            />
                        </Tab>
                    </Tabs>
                </Dialog>
                <Dialog
                    title={'Restrict Zone'}
                    modal={false}
                    actions={mapModalActions}
                    open={this.state.mapModalOpen}
                    onRequestClose={() => this.handleModalClose('map')}
                    contentStyle={{width: '100vw', maxWidth: 'none', height:'100vh', maxHeight: 'none', translateX:'0'}}
                    autoScrollBodyContent={true}
                >  
                    <div style={{marginBottom: 15}}>

                        <AutoComplete
                            floatingLabelText='Centroid Zip'
                            dataSource={this.state.autocompleteZips}
                            maxSearchResults={10}
                            onNewRequest={this.handleAutocompleteChange}
                            searchText={this.state.limitTo.zip}
                        /> 

                        <TextField
                            value={this.state.limitTo.radius}
                            floatingLabelText='Radius'
                            type='number'
                            onChange={this.handleRadiusChange}
                            style={{marginLeft: '15px'}}
                        />   

                        <RaisedButton
                            onTouchTap={this.getGeoNearZips}
                            label={'Submit'}
                            primary={true}
                            disabled={(this.state.limitTo.zip && this.state.limitTo.radius ? false : true)}
                            style={{
                                position: 'relative',
                                marginLeft: '20px',
                                backgroundColor: blue500
                            }}
                        />  

                        <RaisedButton
                            onTouchTap={this.clearLimitTo}
                            label={'Clear Limits'}
                            secondary={true}
                            disabled={(this.state.limitTo.zip && this.state.limitTo.radius ? false : true)}
                            style={{
                                position: 'relative',
                                marginLeft: '20px'
                            }}
                        />   
                    </div>
                    <LimitToMap
                        containerElement={
                            <div style={{ height: `50vh` }} />
                        }
                        mapElement={
                            <div style={{ height: `100%` }} />
                        }
                        markers={this.state.markers}
                    />
                </Dialog>
                <Dialog
                    title={'Metric Details'}
                    modal={false}
                    actions={metricModalActions}
                    open={this.state.metricModalOpen}
                    onRequestClose={() => this.handleModalClose('metric')}
                    contentStyle={{width: '100%', maxWidth: 'none'}}
                    autoScrollBodyContent={true}
                >   
                <Tabs
                    onChange={this.handleMetricDefinitionTabChange}
                    value={this.state.slideIndex}
                >
                    <Tab label="Home Value Index" value={0} />
                    <Tab label="Home Value Rental Index" value={1} />
                    <Tab label="Increasing Value" value={2} />
                    <Tab label="Price To Rent" value={3} />
                </Tabs>
                    <SwipeableViews
                        index={this.state.slideIndex}
                        onChangeIndex={this.handleMetricDefinitionTabChange}
                    >
                    <div>
                        <h2>ZHVI</h2>
                        Median estimated home value for all homes of these types within a region.
                    </div>
                    <div>
                        <h2>ZHVR</h2>
                        Median of the estimated rent price for all homes and apartments in a given region.
                    </div>
                    <div>
                        <h2>IncreasingValues</h2>
                        The percentage of homes in an given region with values that have increased in the past year.
                    </div>
                    <div>
                        <h2>PriceToRent</h2>
                        This ratio is first calculated at the individual home level, where the estimated home value is divided by 12 times its estimated monthly rent price. The the median of all home-level price-to-rent ratios for a given region is then calculated.
                    </div>
                    </SwipeableViews>
                </Dialog>          
                <GenericLoader open={this.state.loaderOpen}/>
            </div>
        );
    }
}

export default RealEstateGraph;