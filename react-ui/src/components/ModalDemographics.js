import React, { Component } from 'react';
import { red500, blue500, blueGray100, teal500, orange500, green500, amber500 } from 'material-ui/styles/colors';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

class ModalDemographics extends Component {
    constructor(props) {
        super(props);

        this.state = {
            incomeData: null,
            educationData: null,
            rentalData: null
        }
    }

    componentDidMount() {
        this.bindRadialChartData();
    }

    bindRadialChartData = () => {
        let dm = this.props.demographics;
        let hh = this.props.household;     
        let incomeArr = [];
        let educationArr = [];
        let rentalArr = [];
        let householdIncome = ['PercentHouseholdIncome25k', 'PercentHouseholdIncome25k50k', 'PercentHouseholdIncome50k75k', 'PercentHouseholdIncome75k100k', 'PercentHouseholdIncome100k150k', 'PercentHouseholdIncome150k200k', 'PercentHouseholdIncome200k']
        let education = ['PercentPop25OlderLessThanHighSchool', 'PercentPop25OlderSomeCollege', 'PercentPop25OlderAssociates', 'PercentPop25OlderBachelors', 'PercentPop25OlderGraduates', 'PercentPop25OlderHighschoolGraduate']
        let rental = ['PercentRent500','PercentRent500to1000','PercentRent1000to1500','PercentRent1500to2000','PercentRent2000to2500','PercentRent2500to3000', 'PercentRent3000']

        for (var key in dm) {
            if (dm.hasOwnProperty(key)) {
                if (householdIncome.includes(key)) {
                    let name = key.replace('PercentHouseholdIncome', '').replace('k', 'k ');

                    if (name === '25k') {
                        name = '< 25k'
                    }

                    if (name === '200k') {
                        name = '> 200k'
                    }

                    let obj = {
                        name: name,
                        value: dm[key]
                    };

                    incomeArr.push(obj);
                }

                if(education.includes(key)){
                    let name = key.replace('PercentPop25Older', '');
                    
                    let obj = {
                        name: name,
                        value: dm[key]
                    };

                    educationArr.push(obj);
                }
            }
        }

        for (var key in hh) {
            if (hh.hasOwnProperty(key)) {
                if (rental.includes(key)) {
                    let name = key.replace('PercentRent', '').replace('to', ' -> ');

                    if (name === '500') {
                        name = '< 500'
                    }

                    if (name === '3000') {
                        name = '> 3000'
                    }

                    let obj = {
                        name: name,
                        value: hh[key]
                    };

                    rentalArr.push(obj);
                }
            }
        }

        this.setState({ 
            incomeData: incomeArr,
            educationData: educationArr,
            rentalData: rentalArr 
        });
    }

    renderLegend = (label) => {
        return (
                <h4 style={{textAlign: 'center'}}>{label}</h4>
        );
    }

    render() {
        const dm = this.props.demographics;
        const dmAvg = this.props.demographicsAvg;
        const hh = this.props.household;
        const hhAvg = this.props.householdAvg;
        const pieData = [
            { name: 'Owner Occupied', value: hh.PercentOwnerOccupied },
            { name: 'Renter Occupied', value: hh.PercentRenterOccupied }
        ]
        const colors = [teal500, orange500]
        const chartRadius = 100;
        return (
            <div id="zip-details-tab">
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height='100%'>
                        <RadarChart outerRadius={chartRadius} data={this.state.incomeData}>
                            <Radar dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                            <PolarGrid />
                            <PolarAngleAxis dataKey="name" />
                            <PolarRadiusAxis />
                            <Tooltip />
                            <Legend verticalAlign={'top'} content={() => this.renderLegend('Household Income')}/>
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height='100%'>
                        <RadarChart outerRadius={chartRadius} data={this.state.educationData}>
                            <Radar dataKey="value" stroke={green500} fill={green500} fillOpacity={0.6} />
                            <PolarGrid />
                            <PolarAngleAxis dataKey="name" />
                            <PolarRadiusAxis />
                            <Tooltip />
                            <Legend verticalAlign={'top'} content={() => this.renderLegend('Education')}/>
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height='100%'>
                        <RadarChart outerRadius={chartRadius} data={this.state.rentalData}>
                            <Radar dataKey="value" stroke={amber500} fill={amber500} fillOpacity={0.6} />
                            <PolarGrid />
                            <PolarAngleAxis dataKey="name" />
                            <PolarRadiusAxis />
                            <Tooltip />
                            <Legend verticalAlign={'top'} content={() => this.renderLegend('Rental Price')}/>
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height='100%'>
                        <PieChart>
                            <Pie nameKey="name" dataKey="value" data={pieData} innerRadius={40} outerRadius={chartRadius} fill="#82ca9d" label>
                                {
                                    pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index]} />
                                    ))
                                }
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ marginTop: '15px', float: 'left', width: '100%', borderTop: '1px solid lightgray'}}>
                    <div className="metric-containers">
                        <h2 style={{textAlign: 'center'}}>Demographics</h2>
                        <h4>
                            Per Capita Income:&nbsp;
                            <span style={{ color: (dm.PerCapitaIncome < dmAvg.PerCapitaIncome ? red500 : blue500) }}>
                                {dm.PerCapitaIncome}
                            </span>
                            <small style={{ color: blueGray100 }}>&nbsp; avg: {dmAvg.PerCapitaIncome}</small>
                        </h4>
                        <h4>
                            Household Income:&nbsp;
                            <span style={{ color: (dm.TotalHouseholdMedianIncome < dmAvg.TotalHouseholdMedianIncome ? red500 : blue500) }}>
                                {dm.TotalHouseholdMedianIncome}
                            </span>
                            <small style={{ color: blueGray100 }}>&nbsp; avg: {dmAvg.TotalHouseholdMedianIncome}</small>
                        </h4>
                        <h4>
                            Percent Unemployed:&nbsp;
                            <span style={{ color: (dm.PercentUnemployed > dmAvg.PercentUnemployed ? red500 : blue500) }}>
                                {dm.PercentUnemployed}%
                            </span>
                            <small style={{ color: blueGray100 }}>&nbsp; avg: {dmAvg.PercentUnemployed.toFixed(2)}%</small>
                        </h4>
                    </div>
                    <div className="metric-containers">
                        <h2 style={{textAlign: 'center'}}>Housing</h2>
                        <h4>
                            Total Housing Units:&nbsp;
                            <span style={{ color: (hh.TotalHousingUnits < hhAvg.TotalHousingUnits ? red500 : blue500) }}>
                                {hh.TotalHousingUnits}
                            </span>
                            <small style={{ color: blueGray100 }}>&nbsp; avg: {hhAvg.TotalHousingUnits}</small>
                        </h4>
                    </div>
                </div>
            </div>
        );
    }
}

export default ModalDemographics;
