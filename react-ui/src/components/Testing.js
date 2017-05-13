import React, { Component } from 'react';
import axios from 'axios';

class Testing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pop: []
        };
    }

    componentDidMount() {
        axios.get(`https://api.census.gov/data/2016/pep/population?get=POP,GEONAME&for=county:*&key=` + process.env.CENSUS_API)
            .then(res => {
                const data = res.data;
                let dataLen = data.length;
                let arr = [];

                for(let i = 0; i < dataLen; i++){
                    if(data[i][1].includes('Alabama')){
                        var county = data[i];
                        arr.push(<li>{county}</li>)
                    }
                } 

                this.setState({ pop: arr });
            });
    }

    render() {
        return (
            <div>
                <h1>BEPPPPPPPPPPPPPPPPPPPPPPPPPP</h1>
                <div>
                    <ul>
                        {this.state.pop}
                    </ul>
                </div>
            </div>
        );
    }
}

export default Testing;
