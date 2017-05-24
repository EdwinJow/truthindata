const express = require('express');
const path = require('path');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient

const app = express();
const PORT = process.env.PORT || 5000;

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

app.get('/test', function(req, res){
    MongoClient.connect(process.env.MONGODB_URI, function(err, db){
        if(err) throw err;
        var states = db.collection('States');

        states.find({ State: req.query.State }).toArray(function (err, docs) {
            if(err) throw err;
            db.close();    

            res.set('Content-Type', 'application/json')
            res.send(JSON.stringify(docs));
        });
    })
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', function (request, response) {
    response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});

app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
});
