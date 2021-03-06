const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const axios = require('axios')
const MongoClient = require('mongodb').MongoClient
const util = require('util')
var client = require('redis').createClient(process.env.REDIS_URL);
var router = express.Router();
var bodyParser = require('body-parser')
var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;
var gClient = new auth.OAuth2(process.env.GOOGLE_SIGN_IN_CLIENT_ID, '', '');

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));
app.use(bodyParser.json()) // handle json data
app.use(bodyParser.urlencoded({ extended: true })) // handle URL-encoded data

client.flushdb(function (err, succeeded) {
    console.log(succeeded);
});

app.post('/user/authenticate', function (req, res) {
    let token = req.body.token;

    gClient.verifyIdToken(
        token,
        process.env.GOOGLE_SIGN_IN_CLIENT_ID,
        function (e, login) {
            let payload = login.getPayload();
            let userid = payload['sub'];
            let email = payload.email;

            MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
                if (err) throw err;

                let collection = db.collection('Users');

                collection.findOne({ email: email }, function (err, doc) {
                    if (err) throw err;

                    let response = {
                        isAdmin: false
                    }

                    if(!doc){
                        return res.send(JSON.stringify(response));
                    }
                    
                    if (doc.permissions === 'admin') {
                        response.isAdmin = true;
                    }

                    res.send(JSON.stringify(response));
                    db.close();
                })
            });
        });
});

app.get('/zip-metrics/dates', function (req, res) {
    const cacheKey = 'zip-metrics-dates';
    client.get(cacheKey, function (err, reply) {
        if (err) throw err;
        if (reply) {
            res.send(reply);
        } else {
            flushRedis('zip-metrics-dates');
            MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
                if (err) throw err;

                let collection = db.collection('DateSelector');
                let uniqueDates = collection.distinct("Date", { "Date": { $gte: '2013-01' } }, function (err, docs) {
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

app.get('/cache/flush-all', function (req, res) {
    flushRedis();
});

app.get('/zip-metrics/geo-near', function(req, res){
    let zip = parseInt(req.query.Zip);
    let radius = parseFloat(req.query.Radius) * 1609.34;

    MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
        if (err) throw err;

        let collection = db.collection('Zips');
        let centroid;

        collection.findOne({ Zip: zip })
            .then(function(doc){
                if(!doc){
                    return res.send({});
                } 

                centroid = doc;          
            })
            .then(function(){
                let request = {
                    loc: {
                        $near: {
                            $geometry: {
                                type: 'Point',
                                coordinates: [
                                    centroid.Lng,
                                    centroid.Lat
                                ]
                            },
                            $minDistance: 0,
                            $maxDistance: radius
                        }
                    }
                };

                collection.find(request).toArray(function (err, docs) {
                    if (err) throw err;
                    db.close();
                    res.set('Content-Type', 'application/json');
                    res.send(JSON.stringify(docs));
                });        
            });
    })
});

app.get('/zip-metrics/table', function (req, res) {
    const startDate = req.query.StartDate;
    const endDate = req.query.EndDate;
    const metric = req.query.Metric;
    const zipArr = JSON.parse(req.query.LimitToZips);
    const state = req.query.State;

    const cacheKey = 'zip-metrics-table-startdate:' + startDate + '-enddate:' + endDate + '-metric:' + metric + '-zips: ' + zipArr.join(',') + '-state:' + state + Math.random();

    client.get(cacheKey, function (err, reply) {
        if (err) throw err;
        if (reply) {
            console.log('metrics from redis')
            res.send(reply);
        } else {
            flushRedis('zip-metrics-table-startdate');
            MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
                if (err) throw err;

                let collection = db.collection('ZipMetrics');

                let request = {
                    Date: { $gte: startDate, $lte: endDate },
                    State: state
                }

                if (metric !== 'All') {
                    request.Metric = metric;
                }

                if(zipArr.length > 0){
                    request.RegionName = { $in: zipArr }
                }

                console.log(request);

                collection.find(request).toArray(function (err, docs) {
                    if (err) throw err;
                    db.close();
                    res.set('Content-Type', 'application/json');

                    let data = JSON.stringify({
                        records: docs
                    });

                    // client.set(cacheKey, data, function (err) { if (err) throw err; });
                    res.send(data);
                });
            })
        }
    });
});

app.get('/zip-metrics/graph', function (req, res) {
    const startDate = req.query.StartDate;
    const endDate = req.query.EndDate;
    const metric = req.query.Metric;
    const zip = req.query.Zip;

    const cacheKey = 'zip-metrics-graph-startdate:' + startDate + '-enddate:' + endDate + '-metric:' + metric + '-zip:' + zip;

    client.get(cacheKey, function (err, reply) {
        if (err) throw err;
        if (reply) {
            console.log('metrics from redis')
            res.send(reply);
        } else {
            flushRedis('zip-metrics-graph-startdate');
            MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
                if (err) throw err;

                let collection = db.collection('ZipMetrics');

                let request = {
                    $and: [
                        { Date: { $gte: startDate, $lte: endDate } }
                    ]
                }

                if (metric !== 'All') {
                    request.$and.push({
                        Metric: metric
                    });
                }

                if (zip !== null) {
                    request.$and.push({
                        RegionName: parseInt(zip)
                    });
                }

                collection.find(request).toArray(function (err, docs) {
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

app.get('/zip-metrics/recast-household-averages', function(req,res){
    const zipArr = JSON.parse(req.query.LimitToZips);

    if(!zipArr.length > 0){
        res.send('');
    } 

    let request = [
        {
            $match: { Zip: { $in: zipArr } },
        },
        {
            $group: {
                _id: '0',
                TotalHousingUnits: { $avg: '$TotalHousingUnits' },
                PercentHousingUnitsOccupied: { $avg: '$PercentHousingUnitsOccupied' },
                PercentHousingUnitsVacant: { $avg: '$PercentHousingUnitsVacant' },
                PercentOwnerOccupied: { $avg: '$PercentOwnerOccupied' },
                PercentRenterOccupied: { $avg: '$PercentRenterOccupied' },
                PercentValue100k: { $avg: '$PercentValue100k' },
                PercentValue100k200k: { $avg: '$PercentValue100k200k' },
                PercentValue200k300k: { $avg: '$PercentValue200k300k' },
                PercentValue300k500k: { $avg: '$PercentValue300k500k' },
                PercentValue500k1m: { $avg: '$PercentValue500k1m' },
                PercentValue1m: { $avg: '$PercentValue1m' },
                MedianHouseholdValue: { $avg: '$MedianHouseholdValue' },
                TotalRentalHouseholds: { $avg: '$TotalRentalHouseholds' },
                PercentRent500: { $avg: '$PercentRent500' },
                PercentRent500to1000: { $avg: '$PercentRent500to1000' },
                PercentRent1500to2000: { $avg: '$PercentRent1500to2000' },
                PercentRent2000to2500: { $avg: '$PercentRent2000to2500' },
                PercentRent2500to3000: { $avg: '$PercentRent2500to3000' },
                PercentRent3000: { $avg: '$PercentRent3000' }
            }
        }
    ];

    MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
        if (err) throw err;

        let collection = db.collection('ZipHousehold');

        collection.aggregate(request).toArray(function (err, docs) {
            if (err) throw err;
            db.close();
    
            console.log('recast household averages');
    
            res.set('Content-Type', 'application/json');
    
            let data = JSON.stringify({
                averages: docs[0]
            });
    
            res.send(data);
        });
    })
});

app.get('/zip-metrics/recast-demographic-averages', function(req,res){
    const zipArr = JSON.parse(req.query.LimitToZips);

    if(!zipArr.length > 0){
        res.send('');
    } 

    let request = [
        {
            $match: { Zip: { $in: zipArr } },
        },
        {
            $group: {
                _id: '0',
                PercentInLaborForce: { $avg: '$PercentInLaborForce' },
                PercentUnemployed: { $avg: '$PercentUnemployed' },
                PercentManagementJobs: { $avg: '$PercentManagementJobs' },
                PercentServiceJobs: { $avg: '$PercentServiceJobs' },
                PercentSalesOfficeJobs: { $avg: '$PercentSalesOfficeJobs' },
                PercentConstructionJobs: { $avg: '$PercentConstructionJobs' },
                PercentManufacturingTransportationJobs: { $avg: '$PercentManufacturingTransportationJobs' },
                TotalHouseholds: { $avg: '$TotalHouseholds' },
                PercentHouseholdIncome25k: { $avg: '$PercentHouseholdIncome25k' },
                PercentHouseholdIncome25k50k: { $avg: '$PercentHouseholdIncome25k50k' },
                PercentHouseholdIncome50k75k: { $avg: '$PercentHouseholdIncome50k75k' },
                PercentHouseholdIncome75k100k: { $avg: '$PercentHouseholdIncome75k100k' },
                PercentHouseholdIncome100k150k: { $avg: '$PercentHouseholdIncome100k150k' },
                PercentHouseholdIncome150k200k: { $avg: '$PercentHouseholdIncome150k200k' },
                PercentHouseholdIncome200k: { $avg: '$PercentHouseholdIncome200k' },
                TotalHouseholdMedianIncome: { $avg: '$TotalHouseholdMedianIncome' },
                TotalHouseholdMeanIncome: { $avg: '$TotalHouseholdMeanIncome' },
                PerCapitaIncome: { $avg: '$PerCapitaIncome' },
                PercentHealthInsured: { $avg: '$PercentHealthInsured' },
                PercentNonHealthInsured: { $avg: '$PercentNonHealthInsured' },
                PercentFamiliesBelowPovertyLevel: { $avg: '$PercentFamiliesBelowPovertyLevel' },
                PercentPeopleBelowPovertyLevel: { $avg: '$PercentPeopleBelowPovertyLevel' },
                TotalPop18to24: { $avg: '$TotalPop18to24' },
                Total18to24LessThanHighSchool: { $avg: '$Total18to24LessThanHighSchool' },
                Percent18to24LessThanHighSchool: { $avg: '$Percent18to24LessThanHighSchool' },
                Total18to24HighSchoolGraduate: { $avg: '$Total18to24HighSchoolGraduate' },
                Percent18to24HighSchoolGraduate: { $avg: '$Percent18to24HighSchoolGraduate' },
                Total18to24SomeCollegeOrAssociates: { $avg: '$Total18to24SomeCollegeOrAssociates' },
                Percent18to24SomeCollegeOrAssociates: { $avg: '$Percent18to24SomeCollegeOrAssociates' },
                Total18to24BachelorsOrHigher: { $avg: '$Total18to24BachelorsOrHigher' },
                Percent18to24BachelorsOrHigher: { $avg: '$Percent18to24BachelorsOrHigher' },
                TotalPop25Older: { $avg: '$TotalPop25Older' },
                TotalPop25OlderLessThanHighSchool: { $avg: '$TotalPop25OlderLessThanHighSchool' },
                PercentPop25OlderLessThanHighSchool: { $avg: '$PercentPop25OlderLessThanHighSchool' },
                TotalPop25OlderHighSchoolGraduate: { $avg: '$TotalPop25OlderHighSchoolGraduate' },
                PercentPop25OlderHighschoolGraduate: { $avg: '$PercentPop25OlderHighschoolGraduate' },
                TotalPop25OlderSomeCollege: { $avg: '$TotalPop25OlderSomeCollege' },
                PercentPop25OlderSomeCollege: { $avg: '$PercentPop25OlderSomeCollege' },
                TotalPop25OlderAssociates: { $avg: '$TotalPop25OlderAssociates' },
                PercentPop25OlderAssociates: { $avg: '$PercentPop25OlderAssociates' },
                TotalPop25OlderBachelors: { $avg: '$TotalPop25OlderBachelors' },
                PercentPop25OlderBachelors: { $avg: '$PercentPop25OlderBachelors' },
                TotalPop25OlderGraduates: { $avg: '$TotalPop25OlderGraduates' },
                PercentPop25OlderGraduates: { $avg: '$PercentPop25OlderGraduates' },
                TotalPercentHighschoolOrHigher: { $avg: '$TotalPercentHighschoolOrHigher' },
                TotalPercentBachelorsOrHigher: { $avg: '$TotalPercentBachelorsOrHigher' },
            }
        }
    ];

    MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
        if (err) throw err;

        let collection = db.collection('ZipDemographics');

        collection.aggregate(request).toArray(function (err, docs) {
            if (err) throw err;
            db.close();
    
            console.log('recast demographic averages');
    
            res.set('Content-Type', 'application/json');
    
            let data = JSON.stringify({
                averages: docs[0]
            });
    
            res.send(data);
        });
    })
});

app.get('/zip-metrics/demographics-all', function (req, res) {
    const state = req.query.State;
    const cacheKey = 'zip-metrics-demographics-all-state-' + state;

    client.get(cacheKey, function (err, reply) {
        if (err) throw err;
        if (reply) {
            console.log('metrics from redis all demographics')
            return res.send(reply);
        }

        MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
            if (err) throw err;

            let collection = db.collection('ZipDemographics');

            let request = {
                STAbv: state
            };

            collection.find(request).toArray(function (err, docs) {
                if (err) throw err;
                db.close();
                res.set('Content-Type', 'application/json');

                let averages = docs.filter(o => o.Zip === 0)[0];

                let data = JSON.stringify({
                    data: docs,
                    averages: averages
                });

                client.set(cacheKey, data, function (err) { if (err) throw err; });
                res.send(data);
            });
        })
    });
});

app.get('/zip-metrics/household-all', function (req, res) {
    const state = req.query.State;
    const cacheKey = 'zip-metrics-household-all-state-' + state;

    client.get(cacheKey, function (err, reply) {
        if (err) throw err;
        if (reply) {
            console.log('metrics from redis all households')
            return res.send(reply);
        } else {
            MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
                if (err) throw err;

                let collection = db.collection('ZipHousehold');

                let request = {
                    STAbv: state
                }

                collection.find(request).toArray(function (err, docs) {
                    if (err) throw err;
                    db.close();
                    res.set('Content-Type', 'application/json');
                    let averages = docs.filter(o => o.Zip === 0)[0];

                    let data = JSON.stringify({
                        data: docs,
                        averages: averages
                    });

                    client.set(cacheKey, data, function (err) { if (err) throw err; });
                    res.send(data);
                });
            })
        }
    });
});

app.get('/zip-metrics/demographics', function (req, res) {
    const zip = parseInt(req.query.Zip);
    const state = req.query.State;

    if (zip === null) {
        res.send(null);
    }

    client.get('zip-metrics-demographics-all-state-' + state, function (err, reply) {
        if (err) throw err;

        if (reply) {
            let data = JSON.parse(reply).data.filter(row => row.Zip === zip);
            console.log('metrics from redis single demographic');
            return res.send(JSON.stringify(data[0]));
        }

        MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
            if (err) throw err;

            let collection = db.collection('ZipDemographics');

            let request = {
                Zip: zip,

            }

            collection.findOne(request, function (err, doc) {
                if (err) throw err;
                db.close();
                res.set('Content-Type', 'application/json');

                if (!doc) {
                    res.send({});
                }

                let data = JSON.stringify(doc);
                res.send(data);
            });
        })
    });
});

app.get('/zip-metrics/household', function (req, res) {
    const zip = parseInt(req.query.Zip);
    const state = req.query.State;
    const cacheKey = 'zip-metrics-household-all-state-' + state;

    if (zip === null) {
        res.send(null);
    }

    client.get(cacheKey, function (err, reply) {
        if (err) throw err;

        if (reply) {
            let data = JSON.parse(reply).data.filter(row => row.Zip === zip);
            console.log('metrics from redis single zip');
            return res.send(JSON.stringify(data[0]));
        }

        MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
            if (err) throw err;

            let collection = db.collection('ZipHousehold');

            let request = {
                Zip: zip
            }

            collection.findOne(request, function (err, doc) {
                if (err) throw err;
                db.close();
                res.set('Content-Type', 'application/json');

                if (!doc) {
                    res.send({});
                }

                let data = JSON.stringify(doc);
                res.send(data);
            });
        });
    });
});

app.get('/zip-metrics/all-zips', function(req, res){
    const state = req.query.State;
    var cacheKey = 'zip-metrics-all-zips-state-' + state;

    client.get(cacheKey, function (err, reply) {
        if (err) throw err;

        if (reply) {         
            return res.send(reply);
        }

        MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
            if (err) throw err;

            let collection = db.collection('Zips');

            let request = {
                ContainingState: state 
            }

            collection.find(request).toArray(function (err, docs) {
                if (err) throw err;
                db.close();
                res.set('Content-Type', 'application/json');

                let data = JSON.stringify(docs);
                client.set(cacheKey, data, function (err) { if (err) throw err; });
                res.send(data);
            });
        });
    });
});

app.get('/states', function (req, res) {
    getCollectionDocuments('States', req, res);
});

app.get('/counties', function (req, res) {
    getCollectionDocuments('Counties', req, res);
});

app.get('/zips', function (req, res) {
    getCollectionDocuments('PriceToRentZip', req, res);
});

app.get('/dates/real-estate-tracker', function (req, res) {
    getCollectionDocuments('DateSelector', req, res);
});

app.get('/census', function (req, res) {
    axios.get(`https://api.census.gov/data/2016/pep/population?get=POP,GEONAME&for=county:*&key=` + process.env.CENSUS_API)
        .then(function (response) {
            const data = response.data;
            let dataLen = data.length;
            let arr = [];

            for (let i = 0; i < dataLen; i++) {
                if (data[i][1].includes('Alabama')) {
                    var county = data[i];
                    arr.push(county)
                }
            }

            res.set('Content-Type', 'application/json');
            res.send(JSON.stringify(arr));
        })
        .catch(function (err) {
            throw err;
        })

});

function getCollectionDocuments(collectionName, req, res) {
    MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
        if (err) throw err;
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
            if (err) throw err;
            db.close();
            res.set('Content-Type', 'application/json');
            res.send(JSON.stringify(docs));
        });
    })
}

function flushRedis(key) {
    if (key) {
        client.keys(key + '*', function (err, keys) {
            if (err) return console.log(err);
            let len = keys.length;
            for (var i = 0; i < len; i++) {
                console.log('deleted: ' + keys[i]);
                client.del(keys[i]);
            }
        });
    } else {
        console.log('flushed all redis data');
        client.FLUSHALL();
    }
}

// All remaining requests return the React app, so it can handle routing.
app.get('*', function (request, response) {
    response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});

app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
});
