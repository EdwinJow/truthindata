import React, { Component } from 'react';
import axios from 'axios';
import * as V from 'victory';
import { VictoryChart, VictoryLine, VictoryTooltip, VictoryVoronoiContainer } from 'victory';

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
    }
    
    componentDidMount(){
        this.getPriceToRentData();
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
                graphData: data.records,
                dateRange: data.dates
            });
        }.bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    render() {
        return (          
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
        );
    }
}

export default RealEstateGraph;