const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const axios = require('axios')
const MongoClient = require('mongodb').MongoClient

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

app.get('/price-to-rent-az', function(req, res){
    MongoClient.connect(process.env.MONGODB_URI, function(err, db){
        if(err) throw err;

        let collection = db.collection('PriceToRentAZDeep');

        let = request = [
            {
                $match: {
                    Date: {
                        $gte: req.query.StartDate,
                        $lte: req.query.EndDate
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

        collection.aggregate(request).limit(50).toArray(function (err, docs) {
            if(err) throw err;
            db.close();    
            res.set('Content-Type', 'application/json');

            let uniqueDates = [...new Set(docs.map(item => item.Date))];
            let data = {
                records: docs,      
                dates: uniqueDates
            }

            res.send(JSON.stringify(data));
        });
    })
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
