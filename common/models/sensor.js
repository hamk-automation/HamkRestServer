'use strict'

const request = require('request')
const async = require('async')
const moment = require('moment')
function getApp(context, cb) {
    context.Sensor.getApp(function(err, app) {
        if (err) {
            cb(err)
            return
        }
        context.app = app
        cb()
    })
}

function getSensor(context, cb) {
    context.Sensor.findById(
        context.args.id,
        [],
        function(err, sensor) {
            if (err) {
                cb(err)
                return
            }
            if (sensor == null) {
                cb(new Error("No sensor found"))
                return
            }
            context.sensor = sensor
            cb()
        }
    )
}

function getLocation(context, cb) {
    context.app.models.location.findById(
        context.sensor.locationId,
        [],
        function(err, location) {
            if (err) {
                if (err.message == 'No location found') {
                    console.log(location)
                    location = null
                } else {
                    cb(err)
                    return
                }
            }
            context.location = location
            cb()
        }
    )
}

function getSystem(context, cb) {
    context.app.models.system.findById(
        context.sensor.systemId,
        [],
        function(err, system) {
            if (err) {
                if (err.message == 'No system found') {
                    console.log(system)
                    system = null
                } else {
                    cb(err)
                    return
                }
            }
            context.system = system
            cb()
        }
    )
}

function getBuilding(context, cb) {
    context.app.models.building.findById(
        context.location.buildingId,
        [],
        function(err, building) {
            if (err) {
                cb(err)
                return
            }
            if (building == null) {
                cb(new Error("No building found"))
                return
            }
            context.building = building
            cb()
        }
    )
}

function influxDbQuery(context, cb) {
    var queryString = 'SELECT mean("' + context.sensor.type + '") as "'+context.sensor.type+'" FROM "'+context.building.name
    if (context.location != null && context.system != null){
      queryString += '"."autogen"."'+context.system.name
      queryString += '" WHERE location=\'' + context.location.name + '\''
    }else if(context.system == null){
      queryString += '" WHERE location=\'' + context.location.name + '\''
    } else if (context.system != null) {
        queryString += '" WHERE system=\'' + context.system.type + '\''

    } else {
        cb(new Error("No location or system"))
        return
    }
    queryString += ' AND time > \'' + context.args.startTime +
                '\' AND time < \'' + context.args.endTime +
                '\' GROUP BY time(' + context.args.interval + 's) FILL(none) ORDER BY time LIMIT 100000'
    var options = {
        method: 'GET',
        url: 'http://localhost:8086/query',
        qs: {
            pretty: 'true',
            db: context.building.name,
            u: '',
	          p: '',
            q: queryString
        }
    }
    //console.log(options)
    request(
        options,
        function(err, response, body) {
            if (err) {
                cb(err)
                return
            }
            if (JSON.parse(body).error == null) {
                var result = JSON.parse(body).results[0]
                //format values to array
                if (result.series != null) {
                    var data = JSON.parse(body).results[0].series[0]
                    var arr=[];
                    for(var i=0;i<data.values.length;i++)
                    {
                    //for ts
                    //var date = new Date(data.values[i][0]);
                    //var ts = date.getTime();
                    //arr.push([data.values[i][1],ts])
                    //no ts
                    arr.push(data.values[i][1])
                    if(i<data.values.length)var endTime = data.values[i][0]
                    var startTime = data.values[0][0]
                  }
                    if (data != null) {
                        delete data.values
                        delete data.name
                        delete data.columns
                        delete data.partial
                        data.startTime = startTime
                        data.endTime = endTime
                        data.timeStep = context.args.interval
                        data.values = arr
                        data.number_of_points = data.values.length
                    } else {
                        data = []
                    }
                    data.sensorId = context.sensor.id
                    context.response = data
                } else {
                    delete result.statement_id
                    result.values = []
                    context.response = result
                }
            } else {
                context.response = JSON.parse(body)
            }
            cb()
        }
    )
}


function influxDbWrite(context, cb) {
    var writeString =context.system.name+',location='+context.location.name+' '+context.sensor.type+'='+context.args.data.value
    var options = {
        method: 'POST',
        url: 'http://localhost:8086/write',
        qs: {
            db: context.building.name,
	          u: '',
	          p: '',
        },
        body: writeString
    }
    request(
        options,
        function(response,body,err) {
            if (err) {
                cb(err)
                return
            }
            context.response = context.args.value
            cb()
          }
          )
}

module.exports = function(Sensor) {

    Sensor.beforeRemote('create', function(context, user, next) {
        context.args.data.userId = context.req.accessToken.userId
        //console.log(context.req.accessToken.userId)
        next()
    })
    Sensor.history = function(id, startTime, endTime, interval, cb) {


        var start_time = moment(startTime)
        if (!start_time.isValid()) {
            cb(null, {
                error: "Timestamp is invalid!"
            })
            return
        }

        var end_time = moment()
        if (endTime != null) {
            end_time = moment(endTime)
            if (!end_time.isValid()) {
                cb(null, {
                    error: "Timestamp is invalid!"
                })
                return
            }
        }

        var context = {
            Sensor: Sensor,
            args: {
                id: id,
                startTime: start_time.toISOString(),
                endTime: end_time.toISOString(),
                interval: (interval == null ? 10 : interval)
            },
            response: null
        }

        async.applyEachSeries(
            [getApp, getSensor, getLocation, getBuilding, getSystem, influxDbQuery],
            context,
            function(err) {
                if (err) {
                    cb(err)
                } else {
                    console.log("sensor.history() executed successfully!")
                    cb(null, context.response)
                }
            }
        )
    }

    Sensor.point = function(id, data, cb) {


        var context = {
            Sensor: Sensor,
            args: {
                id: id,
                data: data
            },
            response: null
        }

        async.applyEachSeries(
            [getApp, getSensor, getLocation, getBuilding, getSystem, influxDbWrite],
            context,
            function(err) {
                if (err) {
                    cb(err)
                } else {
                    console.log("sensor.point() executed successfully!")
                    cb(null, context.response)
                }
            }
        )
    }

    Sensor.remoteMethod('history', {
          description: ["Find history data from instance by {{id}}."],
            accepts: [
                { arg: 'id', type: 'number', required: true },
                { arg: 'startTime', type: 'string', required : true },
                { arg: 'endTime', type: 'string' },
                { arg: 'interval', type: 'number' }
            ],
            http: {
                path: '/:id/history',
                verb: 'get'
            },
            returns: {
                arg: 'result',
                type: 'Object'
            }
          });

   Sensor.remoteMethod('point', {
                description: ["Create a model instance by {{id}} and data into the data source."],
                  accepts: [
                      { arg: 'id', type: 'number', required: true, description : ["Sensors {{id}} to write data"] },
                      { arg: 'data', type: 'object', required : true, http: { source: 'body' },description : ["Measurement value"] }
                  ],
                  http: {
                      path: '/:id/point',
                      verb: 'post'
                  }
                });

                Sensor.disableRemoteMethodByName('exists', true);
                Sensor.disableRemoteMethodByName('replaceById', true);
                Sensor.disableRemoteMethodByName('replaceById', true);
                Sensor.disableRemoteMethodByName('createChangeStream', true);
                Sensor.disableRemoteMethodByName('replaceOrCreate', true);
                Sensor.disableRemoteMethodByName('updateAll', true);
                Sensor.disableRemoteMethodByName('upsertWithWhere', true);
                Sensor.disableRemoteMethodByName('findOne', true);
                Sensor.disableRemoteMethodByName('prototype.__create__locations', true);
                Sensor.disableRemoteMethodByName('prototype.patchAttributes', true);
                Sensor.disableRemoteMethodByName('prototype.__get__locations', true);
                Sensor.disableRemoteMethodByName('prototype.__count__locations', true);
                Sensor.disableRemoteMethodByName('prototype.__get__user', true);
                Sensor.disableRemoteMethodByName('prototype.__delete__locations', true);
                Sensor.disableRemoteMethodByName('prototype.__destroyById__locations', true);
                Sensor.disableRemoteMethodByName('prototype.__updateById__locations', true);
                Sensor.disableRemoteMethodByName('prototype.__findById__locations', true);
                Sensor.disableRemoteMethodByName('prototype.__get__location', true);
                Sensor.disableRemoteMethodByName('prototype.__get__system', true);
                /*
                Sensor.beforeRemote('**', function(ctx ,user,next) {
                  console.log('ctx.methodString', ctx.methodString)
                })
                */
                Sensor.remoteMethod('findById', {
                    description: 'Find a model instance by {{id}} from the data source.',
                    accessType: 'READ',
                    accepts: [
                      {
                        arg: 'id', type: 'any', description: 'Model id', required: true,
                        http: {source: 'path'}
                      },
                      {arg: 'options', type: 'object', http: 'optionsFromRequest'},
                    ],
                    returns: {arg: 'data', type: 'Model', root: true},
                    http: {verb: 'get', path: '/:id'}
                  });
}
