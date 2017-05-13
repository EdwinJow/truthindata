import React, { Component } from 'react';
import axios from 'axios';

class Admin extends Component {
    componentDidMount(){
        axios.get('/test', function(err, response){
            if(err) throw err;
            console.log(response);
        });
    }
    render() {
        return (
            <div>
                <div></div>
            </div>
        );
    }
}

export default Admin;
