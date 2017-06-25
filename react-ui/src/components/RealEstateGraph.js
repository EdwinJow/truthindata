import React, { Component } from 'react';
import axios from 'axios';
import { VictoryChart, VictoryLine, VictoryTooltip, VictoryVoronoiContainer } from 'victory';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import AppBar from 'material-ui/AppBar';

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

    handleChange = (event, index, value) => {
        event.persist();
        console.log(event.target);
        debugger;
        // event.persist()
        // const field = event.target.id;
        // debugger;
        // this.setState({[field]: value});
    };

    getDateRange(){
        axios.get('/price-to-rent-az/dates')
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
        axios.get('/price-to-rent-az', {
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
        }.bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    render() {
        return (         
            <div className="height100"> 
                <SelectField
                    floatingLabelText="Start Date"
                    value={this.state.startDate}
                    onChange={this.handleChange}
                >
                    {this.state.dateRange.map((row, index) => (
                        <MenuItem name="startDate" key={index} value={row} primaryText={row} />
                    ))}
                </SelectField>
                <SelectField
                    floatingLabelText="End Date"
                    value={this.state.endDate}
                    onChange={this.handleChange}
                >
                    {this.state.dateRange.map((row, index) => (
                        <MenuItem name="endDate" key={index} value={row} primaryText={row} />
                    ))}
                </SelectField>
                <VictoryChart
                    containerComponent={
                        <VictoryVoronoiContainer
                            labels={(datum) => datum.RegionName + ' ' + datum.Value}
                            labelComponent={<VictoryTooltip/>}
                        />
                    }
                    animate={{duration: 2000}}
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
                </VictoryChart>
            </div>
        );
    }
}

export default RealEstateGraph;