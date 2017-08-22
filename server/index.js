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

app.get('/az-zip-metrics/dates', function (req, res) {
    const cacheKey = 'az-zip-metrics-dates';
    client.get(cacheKey, function (err, reply) {
        if (err) throw err;
        if (reply) {
            res.send(reply);
        } else {
            flushRedis('az-zip-metrics-dates');
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

app.get('/az-zip-metrics/geo-near', function(req, res){
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

app.get('/az-zip-metrics/table', function (req, res) {
    const startDate = req.query.StartDate;
    const endDate = req.query.EndDate;
    const metric = req.query.Metric;
    const zipArr = JSON.parse(req.query.LimitToZips);

    const cacheKey = 'az-zip-metrics-table-startdate:' + startDate + '-enddate:' + endDate + '-metric:' + metric + '-zips: ' + zipArr.join(',');

    client.get(cacheKey, function (err, reply) {
        if (err) throw err;
        if (reply) {
            console.log('metrics from redis')
            res.send(reply);
        } else {
            flushRedis('az-zip-metrics-table-startdate');
            MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
                if (err) throw err;

                let collection = db.collection('ArizonaZipMetrics');

                let request = {
                    Date: { $gte: startDate, $lte: endDate }
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

                    client.set(cacheKey, data, function (err) { if (err) throw err; });
                    res.send(data);
                });
            })
        }
    });
});

app.get('/az-zip-metrics/graph', function (req, res) {
    const startDate = req.query.StartDate;
    const endDate = req.query.EndDate;
    const metric = req.query.Metric;
    const zip = req.query.Zip;

    const cacheKey = 'az-zip-metrics-graph-startdate:' + startDate + '-enddate:' + endDate + '-metric:' + metric + '-zip:' + zip;

    client.get(cacheKey, function (err, reply) {
        if (err) throw err;
        if (reply) {
            console.log('metrics from redis')
            res.send(reply);
        } else {
            flushRedis('az-zip-metrics-graph-startdate');
            MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
                if (err) throw err;

                let collection = db.collection('ArizonaZipMetrics');

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

app.get('/az-zip-metrics/demographics-all', function (req, res) {
    const cacheKey = 'az-zip-metrics-demographics-all';

    client.get(cacheKey, function (err, reply) {
        if (err) throw err;
        if (reply) {
            console.log('metrics from redis all demographics')
            return res.send(reply);
        }

        MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
            if (err) throw err;

            let collection = db.collection('ArizonaZipDemographics');

            collection.find({}).toArray(function (err, docs) {
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

app.get('/az-zip-metrics/household-all', function (req, res) {
    const cacheKey = 'az-zip-metrics-household-all';

    client.get(cacheKey, function (err, reply) {
        if (err) throw err;
        if (reply) {
            console.log('metrics from redis all households')
            return res.send(reply);
        } else {
            MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
                if (err) throw err;

                let collection = db.collection('ArizonaZipHousehold');

                collection.find({}).toArray(function (err, docs) {
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

app.get('/az-zip-metrics/demographics', function (req, res) {
    const zip = parseInt(req.query.Zip);

    if (zip === null) {
        res.send(null);
    }

    client.get('az-zip-metrics-demographics-all', function (err, reply) {
        if (err) throw err;

        if (reply) {
            let data = JSON.parse(reply).data.filter(row => row.Zip === zip);
            console.log('metrics from redis single demographic');
            return res.send(JSON.stringify(data[0]));
        }

        MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
            if (err) throw err;

            let collection = db.collection('ArizonaZipDemographics');

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
        })
    });
});

app.get('/az-zip-metrics/household', function (req, res) {
    const zip = parseInt(req.query.Zip);

    if (zip === null) {
        res.send(null);
    }

    client.get('az-zip-metrics-household-all', function (err, reply) {
        if (err) throw err;

        if (reply) {
            let data = JSON.parse(reply).data.filter(row => row.Zip === zip);
            console.log('metrics from redis single zip');
            return res.send(JSON.stringify(data[0]));
        }

        MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
            if (err) throw err;

            let collection = db.collection('ArizonaZipHousehold');

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

app.get('/az-zip-metrics/all-zips', function(req, res){
    var cacheKey = 'az-zip-metrics-all-zips';

    client.get(cacheKey, function (err, reply) {
        if (err) throw err;

        if (reply) {         
            return res.send(reply);
        }

        MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
            if (err) throw err;

            let collection = db.collection('Zips');

            collection.find({ContainingState: 'AZ'}).toArray(function (err, docs) {
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
