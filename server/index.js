const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const axios = require('axios')
const MongoClient = require('mongodb').MongoClient
var client = require('redis').createClient(process.env.REDIS_URL);

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

app.get('/price-to-rent-az/dates', function(req, res){
    const cacheKey = 'price-to-az-dates';
    client.get(cacheKey, function(err, reply){
        if(err) throw err;
        if(reply){
            res.send(reply);
        } else{
            MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
                if (err) throw err;

                let collection = db.collection('PriceToRentAZDeep');
                let uniqueDates = collection.distinct("Date", function (err, docs) {
                    if (err) throw err;

                    let data = {
                        dates: docs
                    };

                    let response = JSON.stringify(data);
                    client.set(cacheKey, response, function (err) { if (err) throw err; });

                    res.send(response);
                    db.close();
                })
            })
        }     
    });
});

app.get('/price-to-rent-az', function(req, res){
    const startDate = req.query.StartDate;
    const endDate = req.query.EndDate;

    const cacheKey = 'price-to-az-startdate:' + startDate + '-enddate:' + endDate;

    client.get(cacheKey, function (err, reply) {
        if (err) throw err;
        if (reply) {
            res.send(reply);
        } else {
            MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
                if (err) throw err;

                let collection = db.collection('PriceToRentAZDeep');

                let = request = [
                    {
                        $match: {
                            Date: {
                                $gte: startDate,
                                $lte: endDate
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$RegionName",
                            data: { $push: "$$ROOT" }
                        }
                    }
                ]

                collection.aggregate(request).limit(20).toArray(function (err, docs) {
                    if (err) throw err;
                    db.close();
                    res.set('Content-Type', 'application/json');

                    let data = JSON.stringify({
                        records: docs
                    });

                    client.set(cacheKey, data, function (err) { if (err) throw err; });
                    res.send(data);
                });
            })
        }
    });

    
});


app.get('/states', function(req, res){
   getCollectionDocuments('States', req, res);
});

app.get('/counties', function(req, res){
    getCollectionDocuments('Counties', req, res);
});

app.get('/zips', function(req, res){
    getCollectionDocuments('PriceToRentZip', req, res);
});

app.get('/dates/real-estate-tracker', function(req, res){
   getCollectionDocuments('DateSelector', req, res);
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

function getCollectionDocuments(collectionName, req, res){
    MongoClient.connect(process.env.MONGODB_URI, function(err, db){
        if(err) throw err;
        let collection = db.collection(collectionName);
        let request = {};
        let startDate;
        let endDate;

        if (req.query.State) {
            request = {
                ContainingState: req.query.State
            }
        }

        collection.find(request).toArray(function (err, docs) {
            if(err) throw err;
            db.close();    
            res.set('Content-Type', 'application/json');
            res.send(JSON.stringify(docs));
        });
    })
}

// All remaining requests return the React app, so it can handle routing.
app.get('*', function (request, response) {
    response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});

app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
});
