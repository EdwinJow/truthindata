import React, { Component } from 'react';
import axios from 'axios';
// import { VictoryChart, VictoryLine, VictoryTooltip, VictoryVoronoiContainer } from 'victory';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import ReactTable from 'react-table'
import 'react-table/react-table.css'

class RealEstateGraph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: '2015-10',
            endDate: '2017-01',
            graphData: [],
            dateRange: []
        };

        this.getPriceToRentData = this.getPriceToRentData.bind(this);
        this.getDateRange = this.getDateRange.bind(this);
    }
    
    componentDidMount(){
        this.getDateRange();
        this.getPriceToRentData();
    }

    handleDateChange = (event, type) => {
        event.persist()
        const value = event.target.innerText;
        this.setState({[type]: value});
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

    getPriceToRentData(){
        axios.get('/az-zip-metrics/table', {
            params: {
                StartDate: this.state.startDate,
                EndDate: this.state.endDate
            }
        })
        .then(function (response) {
            var data = response.data;
            this.setState({
                graphData: data.records
            });
            console.log(this.state.graphData);
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
            accessor: 'State'
        }, 
        {
            Header: 'Metric', 
            accessor: 'Metric'
        },
        {
            Header: 'Value',
            accessor: 'Value'
        },
        {
            Header: 'Date',
            accessor: 'Date'
        }]
        return (         
            <div className="height100"> 
                <ReactTable
                    data={this.state.graphData}
                    columns={columns}
                    /*pivotBy={['RegionName','City','State','Metric']}*/
                    filterable={true}
                    defaultFilterMethod={(filter, row) => (String(row[filter.id]).toLowerCase().includes(String(filter.value).toLowerCase()))}
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