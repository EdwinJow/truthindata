import React, { Component } from 'react';
import axios from 'axios';
import { VictoryChart, VictoryLabel, VictoryBar, VictoryTheme, VictoryAxis  } from 'victory';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import IconButton from 'material-ui/IconButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';

import ReactTable from 'react-table'
import _ from 'lodash'
import 'react-table/react-table.css'

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
            modalBody: 'Beepbepp'
        };

        this.getPriceToRentData = this.getTableMetricData.bind(this);
        this.getDateRange = this.getDateRange.bind(this);
    }
    
    componentDidMount(){
        this.getDateRange();
        this.getTableMetricData();
    }

    handleDateChange = (event, type) => {
        event.persist()
        const value = event.target.innerText;
        this.setState({[type]: value});
    };

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

    getDateRange(){
        axios.get('/az-zip-metrics/dates')
        .then(function (response) {
            var data = response.data;
            this.setState({
                dateRange: data.dates
            });
        }.bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    getTableMetricData(){
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
            });
        }.bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    bindGraphByZip= (value) =>{
        axios.get('/az-zip-metrics/graph', {
            params: {
                StartDate: this.state.startDate,
                EndDate: this.state.endDate,
                Metric: this.state.metric,
                Zip: value
            }
        })
        .then(function (response) {
            var data = response.data;
            this.setState({
                graphData: data.records
            });        
            debugger;
            this.handleModalOpen();
        }.bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }


    render() {
        const columns = [{
            Header: 'Zip',
            accessor: 'RegionName',
            PivotValue: ({ value }) => <span>{value}
                    <IconButton
                        onTouchTap={() => this.bindGraphByZip(value)}
                        style={{float: 'right'}}
                        value={value}
                    >
                        <FontIcon className="material-icons" style={{marginTop: '5rem'}}>home</FontIcon>
                    </IconButton>
                </span>
        }, 
        {
            Header: 'City',
            accessor: 'City',
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
            accessor: 'Metric'
        },
        {
            Header: 'Value',
            accessor: 'Value',
            aggregate: vals => _.round(_.mean(vals)),
            Aggregated: row => {
                return <span>{row.value} (avg)</span>
            }
        },
        {
            Header: 'Date',
            accessor: 'Date',
            PivotValue: ({value}) => <span style={{color: 'darkblue'}}>{value}</span>
        }];
        const modalActions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onTouchTap={this.handleModalClose}
            />
        ]
        return (         
            <div className="height100"> 
                <SelectField
                    floatingLabelText="Metric Select"
                    value={this.state.metric}
                    onChange={this.handleMetricChange}
                    style={{
                        marginLeft: '15px'
                    }}
                >
                    <MenuItem value={"All"} primaryText="All" />
                    <MenuItem value={"ZHVI"} primaryText="Home Value Index" />
                    <MenuItem value={"IncreasingValues"} primaryText="Increasing Value" />
                    <MenuItem value={"PriceToRent"} primaryText="Price To Rent" />
                    <MenuItem value={"Turnover"} primaryText="Turnover" />
                </SelectField>
                <ReactTable
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
                    title="Zip Detail"
                    modal={false}
                    actions={modalActions}
                    open={this.state.modalOpen}
                    onRequestClose={this.handleModalClose}
                >
                    <VictoryChart
                        domainPadding={20}
                        animate={{ duration: 1000, onLoad: { duration: 1000 }, onEnter: { duration: 500, before: () => ({ y: 0 }) } }}
                    >
                        <VictoryBar
                            /*labelComponent={<VictoryLabel angle={90} />}*/
                            data={this.state.graphData}
                            x="Date"
                            y="Value"
                            style={{
                                data: { stroke: (d, active) => active ? "green" : "black" }
                            }}
                            padding={70}
                        />
                        <VictoryAxis
                            tickCount={5}
                            tickLabelComponent = {<VictoryLabel angle={70}/>}
                        />
                        <VictoryAxis dependentAxis
                            tickCount={5}
                        />
                    </VictoryChart>
                </Dialog>
            </div>
        );
    }
}

export default RealEstateGraph;