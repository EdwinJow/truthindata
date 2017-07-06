import React, { Component } from 'react';
import axios from 'axios';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import IconButton from 'material-ui/IconButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import ReactTable from 'react-table'
import _ from 'lodash'
import 'react-table/react-table.css'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer }  from 'recharts';
import {orange500, indigo500} from 'material-ui/styles/colors';
import GenericLoader from './shared/GenericLoader.js';

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
            aggregator: 'avg',
            tableKey: 1,
            loaderOpen: true,
            regionDetails: {
                stateName: 'AZ',
                city: null,
                zip: null
            }
        };

        this.getPriceToRentData = this.getTableMetricData.bind(this);
        this.getDateRange = this.getDateRange.bind(this);
    }
    
    componentDidMount(){
        this.getDateRange();
        this.getTableMetricData();
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

    handleAggregateChange = (event, index, value) => {
        this.setState({ aggregator: value});
    }

    handleMetricChange = (event, index, value) =>{
        this.setState({ metric: value }, function(){
            this.getTableMetricData();
        });
    }

    handleModalOpen = () =>{
        this.setState({modalOpen: true})
    }; 

    handleModalClose = () =>{
        this.setState({modalOpen: false})
    }; 

    getDateRange = () => {
        axios.get('/az-zip-metrics/dates')
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

    getTableMetricData = () =>{
        this.setState({ loaderOpen: true });
        axios.get('/az-zip-metrics/table', {
            params: {
                StartDate: this.state.startDate,
                EndDate: this.state.endDate,
                Metric: this.state.metric
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
        }.bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    bindGraphByZip= (regionDetails) =>{
        this.setState({
            regionDetails:{
                stateName: regionDetails.stateName,
                zip: regionDetails.zip,
                city: regionDetails.city
            }
        });
        axios.get('/az-zip-metrics/graph', {
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
            });        
            
            this.handleModalOpen();
        }.bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    render() {
        let _this = this;

        const columns = [{
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
                        onTouchTap={() => this.bindGraphByZip(regionDetails)}
                        style={{float: 'right'}}
                        value={value}
                    >
                        <FontIcon className='material-icons' color={orange500} style={{marginTop: '5rem'}}>timeline</FontIcon>
                    </IconButton>
                </span>
            }
        }, 
        {
            Header: 'City',
            accessor: 'City',
            aggregate: vals => vals[0],
            PivotValue: ({value}) => <span style={{color: 'darkblue'}}>{value}</span>
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
                labelStyle={{color: indigo500}}
                labelPosition="before"
                secondary={true}            
                icon={<FontIcon className='material-icons' color={indigo500}>home</FontIcon>}
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
                label='Cancel'
                primary={true}
                onTouchTap={this.handleModalClose}
            />
        ]

        return (         
            <div className='height100'> 
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
                    <MenuItem value={'IncreasingValues'} primaryText='Increasing Value' />
                    <MenuItem value={'PriceToRent'} primaryText='Price To Rent' />
                    <MenuItem value={'Turnover'} primaryText='Turnover' />
                </SelectField>
                <SelectField
                    floatingLabelText='Start Date'
                    value={this.state.startDate}
                    style={{
                        marginLeft: '20px'
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
                        marginLeft: '20px'
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
                        marginLeft: '20px'
                    }}
                >
                    <MenuItem value={"avg"} primaryText={"Average"}/>
                    <MenuItem value={"percent"} primaryText={"% Change"}/>
                </SelectField>
                <ReactTable
                    key={this.state.tableKey}
                    data={this.state.tableData}
                    columns={columns}
                    pivotBy={['RegionName']}
                    filterable={true}
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
                    title='Zip Detail'
                    modal={false}
                    actions={modalActions}
                    open={this.state.modalOpen}
                    onRequestClose={this.handleModalClose}
                    contentStyle={{width: '90%', maxWidth: 'none'}}
                >
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
                            <Line type='monotone' dataKey='Avg' name={this.state.regionDetails.stateName + ' Avg'} stroke='#FF9800'/>
                        </LineChart>
                    </ResponsiveContainer>
                </Dialog>
                <GenericLoader open={this.state.loaderOpen}/>
            </div>
        );
    }
}

export default RealEstateGraph;