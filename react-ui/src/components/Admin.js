import React, { Component } from 'react';
import axios from 'axios';

class Admin extends Component {
    constructor(props) {
        super(props);

        this.state = {
            polylines: []
        };
    }
    
    componentDidMount() {
        axios.get('/states', {
            params: {
                State: "NJ"
            }
        })
        .then(function (response) {
            var polylines = response.data.map(obj => obj.EncodedPolyline);
            this.setState({polylines});
        }
        .bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    render() {
        return (
            <div>
                {this.state.polylines};
            </div>
        );
    }
}

export default Admin;
