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
        axios.get('/census')
            .then(res => {
                debugger;
                this.setState({ pop: res.data });
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
