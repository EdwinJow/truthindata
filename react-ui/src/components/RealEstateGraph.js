import React, { Component } from 'react';
import axios from 'axios';
// import { VictoryChart, VictoryLine, VictoryTooltip, VictoryVoronoiContainer } from 'victory';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import ReactTable from 'react-table'
import _ from 'lodash'
import 'react-table/react-table.css'

class RealEstateGraph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: '2015-10',
            endDate: '2017-01',
            graphData: [],
            dateRange: [],
            metric: 'All'
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
                graphData: data.records
            });
        }.bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    render() {
        const columns = [{
            Header: 'Zip',
            accessor: 'RegionName'
        }, 
        {
            Header: 'City',
            accessor: 'City'
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
            accessor: 'Date'
        }]
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
                    data={this.state.graphData}
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
                {/*TODO: Fix this ghetto binding
                <SelectField
                    floatingLabelText="Start Date"
                    value={this.state.startDate}
                    onChange={e => this.handleDateChange(e, "startDate")}
                    style={{
                        marginLeft: '15px'
                    }}
                >
                    {this.state.dateRange.map((row, index) => (
                        <MenuItem key={index} value={row} primaryText={row} />
                    ))}
                </SelectField>
                <SelectField
                    floatingLabelText="End Date"
                    value={this.state.endDate}
                    onChange={e => this.handleDateChange(e, "endDate")}
                    style={{
                        marginLeft: '5px'
                    }}
                >
                    {this.state.dateRange.map((row, index) => (
                        <MenuItem key={index} value={row} primaryText={row} />
                    ))}
                </SelectField>
                <VictoryChart
                    containerComponent={
                        <VictoryVoronoiContainer
                            labels={(datum) => datum.RegionName + ' ' + datum.Value}
                            labelComponent={<VictoryTooltip/>}
                        />
                    }
                    animate={{duration: 2000, onLoad: {duration: 1000}, onEnter: {duration: 500, before: () => ({y: 0})}}}
                >
                    {this.state.graphData.map((row, index) => (
                        <VictoryLine
                            interpolation="natural"
                            key={index}
                            labelComponent={<VictoryTooltip/>}
                            data={row.data}
                            x="Date"
                            y="Value"
                            style={{
                                data: { stroke: (d, active) => active ? "green" : "black"}
                            }}
                        />
                    ))}      
                </VictoryChart>*/}
            </div>
        );
    }
}

export default RealEstateGraph;