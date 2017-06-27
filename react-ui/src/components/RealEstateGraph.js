import React, { Component } from 'react';
import axios from 'axios';
// import { VictoryChart, VictoryLine, VictoryTooltip, VictoryVoronoiContainer } from 'victory';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
const {Table, Column, Cell} = require('fixed-data-table');

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
        axios.get('/az-zip-metrics', {
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
        return (         
            <div className="height100"> 
                <Table
                    rowsCount={this.state.graphData.length}
                    rowHeight={50}
                    headerHeight={50}
                    width={1000}
                    height={500}>
                    <Column
                        header={<Cell>RegionName</Cell>}
                        cell={props => (
                            <Cell {...props}>
                                {this.state.graphData[props.rowIndex].data.RegionName}
                            </Cell>
                        )}
                        width={200}
                    />
                </Table>
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