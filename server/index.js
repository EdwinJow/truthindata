const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const axios = require('axios')

var fs = require('fs');
var MongoClient = require('mongodb').MongoClient

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

app.get('/states', function(req, res){
    MongoClient.connect(process.env.MONGODB_URI, function(err, db){
        if(err) throw err;
        var states = db.collection('States');
        var request = {};

        if(req.State)
        {
            request = {
                State: req.query.State
            }
        }

        states.find(request).toArray(function (err, docs) {
            if(err) throw err;
            db.close();    
            
            res.set('Content-Type', 'application/json');
            res.send(JSON.stringify(docs));
        });
    })
});

app.get('/counties', function(req, res){
    MongoClient.connect(process.env.MONGODB_URI, function(err, db){
        if(err) throw err;
        var states = db.collection('Counties');

        states.find({}).toArray(function (err, docs) {
            if(err) throw err;
            db.close();    

            res.set('Content-Type', 'application/json');
            res.send(JSON.stringify(docs));
        });
    })
});

app.get('/census', function(req, res){
    axios.get(`https://api.census.gov/data/2016/pep/population?get=POP,GEONAME&for=county:*&key=` + process.env.CENSUS_API)
        .then(function(response){
            const data = response.data;
            let dataLen = data.length;
            let arr = [];

            for(let i = 0; i < dataLen; i++){
                if(data[i][1].includes('Alabama')){
                    var county = data[i];
                    arr.push(county)
                }
            } 

            res.set('Content-Type', 'application/json');
            res.send(JSON.stringify(arr));
        })
        .catch(function(err){
            throw err;
        })
    
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', function (request, response) {
    response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});

app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
});
