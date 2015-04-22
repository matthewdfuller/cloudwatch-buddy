var AWS = require('aws-sdk');

var cloudwatch, cloudwatchlogs;

var CloudWatchBuddy = function(aws, options){

    cloudwatch = new AWS.CloudWatch(aws);
    cloudwatchlogs = new AWS.CloudWatchLogs();

    var api = {};

    var _increments = {};
    var _stats = {};
    var _logs = [];

    var _namespace = options.namespace;
    var _timeout = options.timeout;
    var _logFormat = options.logFormat;
    var _addTimestamp = options.addTimestamp;
    var _addInstanceId = options.addInstanceId;

    var putMetricData = function() {

        var params = {
            MetricData:[],
            Namespace: _namespace
        };

        // Add the increments

        if (Object.keys(_increments).length > 0) {
            for (key in _increments) {
                var val = _increments[key];

                params.MetricData.push({
                    MetricName: key,
                    Timestamp: new Date,
                    Unit: 'Count',
                    Value: val,
                });
                _increments[key] = 0;  // reset for next time
            }
        }

        // Add the stats
        if (Object.keys(_stats).length > 0) {
            for (key in _stats) {
                var obj = _stats[key];
                params.MetricData.push({
                    MetricName: key,
                    Timestamp: new Date,
                    Unit: obj.Unit,
                    StatisticValues: {
                        Maximum: obj.Maximum,
                        Minimum: obj.Minimum,
                        SampleCount: obj.SampleCount,
                        Sum: obj.Sum
                    }
                });
                _stats[key] = {
                    Maximum: 0,
                    Minimum: 0,
                    SampleCount: 0,
                    Sum: 0
                };
            }
        }

        if (params.MetricData.length > 0) {
            // cloudwatch.putMetricData(params, function(err, data){
            //     // TODO: what to do with callback?
            //     // TODO: if err, see if retryable
            // });
            console.log(JSON.stringify(params, null, 2));
        }
    }

    var putLogData = function() {
        console.log(_logs);
    }

    setInterval(function(){     // TODO: better way?
        putMetricData();
        putLogData();
    }, _timeout * 1000);

    api.increment = function(key){
        if (_increments[key] === undefined) {
            _increments[key] = 0;
        }
        _increments[key]++;
    };

    api.stat = function(key, value, unit) {
        if (_stats[key] === undefined) {
            _stats[key] = {
                Unit: unit,
                Maximum: value,
                Minimum: value,
                SampleCount: 1,
                Sum: value
            }
        } else {
            _stats[key].Maximum = value > _stats[key].Maximum ? value : _stats[key].Maximum;
            _stats[key].Minimum = value < _stats[key].Minimum ? value : _stats[key].Minimum;
            _stats[key].SampleCount++;
            _stats[key].Sum += value;
        }
    };

    api.log = function(msg) {
        if (_logFormat === 'string') {
            if (typeof msg === 'object') {
                msg = JSON.stringify(msg);
            }
            _logs.push((_addTimestamp ? new Date + ' ' : '') + (_addInstanceId ? 'instand-id ' : '') + msg);
        } else {
            var logObj = {};
            if (_addTimestamp) { logObj['timestamp'] = new Date; }
            if (_addInstanceId) { logObj['instand_id'] = 'instand-id'; }
            logObj['message'] = msg;
            _logs.push(logObj);
        }
    };

    return api;
}

module.exports = CloudWatchBuddy;