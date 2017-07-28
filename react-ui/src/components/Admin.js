import React, { Component } from 'react';
import axios from 'axios';
import { GoogleLogin } from 'react-google-login-component';

class Admin extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isAuthenticated: false
        };
    }

    flushRedisCache = () => {
        axios.get('/cache/flush-all')
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
    }
    
    componentDidMount() {
    }

    handleGoogleResponse = (user) => {
        let token = user.getAuthResponse().id_token;
        axios.post('/user/authenticate', {
            token: token
        })
        .then(function(response){
            if(response.data.isAdmin){
                this.setState({isAuthenticated: true});
            }
        }.bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    render() {
        return (
            <div>
                <GoogleLogin socialId="604862335880-g909ass4c0uicmhj6nuta8c376qi2vck.apps.googleusercontent.com"
                     className={this.state.isAuthenticated ? "login-button" : "hidden"}
                     scope="profile email"
                     responseHandler={this.handleGoogleResponse.bind(this)}
                     buttonText="Login With Google"/>
            </div>      
        );
    }
}

export default Admin;
