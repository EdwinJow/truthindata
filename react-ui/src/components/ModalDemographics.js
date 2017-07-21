import React, { Component } from 'react';
import {red500, blue500, blueGray100} from 'material-ui/styles/colors';
import { Radar, RadarChart, PolarGrid, Legend, PolarAngleAxis, PolarRadiusAxis, Tooltip }  from 'recharts';

class ModalDemographics extends Component {
    constructor(props) {
        super(props);

        this.state ={
            incomeData: null
        }

    }

    componentDidMount(){
        this.bindChartData();
    }

    bindChartData = () => {
        let dm = this.props.demographics;
        let arr = [];
        let householdIncome = ['PercentHouseholdIncome25k', 'PercentHouseholdIncome25k50k', 'PercentHouseholdIncome50k75k', 'PercentHouseholdIncome75k100k', 'PercentHouseholdIncome100k150k', 'PercentHouseholdIncome150k200k', 'PercentHouseholdIncome200k']
        
        for (var key in dm) {  
            if (dm.hasOwnProperty(key)) {
                if(householdIncome.includes(key)){
                    let name = key.replace('PercentHouseholdIncome','');

                    if(name === '25k'){
                        name = '< 25k'
                    }

                    if(name === '200k'){
                        name = '> 200k'
                    }

                    let obj = {
                        name: name,
                        value: dm[key]         
                    };

                    arr.push(obj);
                }
            }
        }

        this.setState({ incomeData: arr });
        debugger;
    }

    render() {
        const dm = this.props.demographics;
        const dmAvg = this.props.demographicsAvg;
        const hh = this.props.household;
        const hhAvg = this.props.householdAvg;

        return (
            <div>
                <RadarChart outerRadius={150} width={500} height={400} data={this.state.incomeData}>
                    <Radar dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis />
                    <Tooltip />
                </RadarChart>
                <h4>
                    Per Capita Income:&nbsp; 
                        <span style={{color: (dm.PerCapitaIncome < dmAvg.PerCapitaIncome ? red500: blue500)}}> 
                            {dm.PerCapitaIncome}
                        </span>
                        <small style={{color: blueGray100}}>&nbsp; avg: {dmAvg.PerCapitaIncome}</small>
                </h4>
                <h4>
                    Percent Unemployed:&nbsp; 
                        <span style={{color: (dm.PercentUnemployed > dmAvg.PercentUnemployed ? red500: blue500)}}> 
                            {dm.PercentUnemployed}%
                        </span>
                        <small style={{color: blueGray100}}>&nbsp; avg: {dmAvg.PercentUnemployed.toFixed(2)}%</small>
                </h4>
            </div>
        );
    }
}

export default ModalDemographics;
