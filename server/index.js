const express = require('express');
const path = require('path');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient

const app = express();
const PORT = process.env.PORT || 5000;

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

// Answer API requests.
app.get('/api', function (req, res) {
    res.set('Content-Type', 'application/json');
    res.send('{"message":"Hello from the custom server!"}');
});

app.get('/test', function(req, res){
    MongoClient.connect(process.env.MONGODB_URI, function(err, dbs){
        if(err) throw err;
        res.send('{"message": "test"}')
    })
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', function (request, response) {
    response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});

app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
});
