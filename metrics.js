var validMetricValues = [
    'Seconds',
    'Microseconds',
    'Milliseconds',
    'Bytes',
    'Kilobytes',
    'Megabytes',
    'Gigabytes',
    'Terabytes',
    'Bits',
    'Kilobits',
    'Megabits',
    'Gigabits',
    'Terabits',
    'Percent',
    'Count',
    'Bytes/Second',
    'Kilobytes/Second',
    'Megabytes/Second',
    'Gigabytes/Second',
    'Terabytes/Second',
    'Bits/Second',
    'Kilobits/Second',
    'Megabits/Second',
    'Gigabits/Second',
    'Terabits/Second',
    'Count/Second',
    'None'
];

var CloudWatchBuddyMetrics = function(cloudwatch, options){

    var api = {};

    var _increments = {};
    var _stats = {};

    var _uploadInterval;

    var _namespace = options.namespace;
    var _timeout = (options.timeout && typeof options.timeout === 'number' && options.timeout >= 60 && options.timeout <= 1800) ? options.timeout : 120;
    //var _maxSize = (typeof options.maxSize === 'number' && options.maxSize < 40000) ? options.maxSize : 40000;  // Max upload size if 40KB // TODO: add this option

    var putMetricData = function() {
        clearInterval(_uploadInterval);

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
                var pushObj = {
                    MetricName: key,
                    Timestamp: new Date,
                    Unit: obj.Unit,
                    StatisticValues: {
                        Maximum: obj.Maximum,
                        Minimum: obj.Minimum,
                        SampleCount: obj.SampleCount,
                        Sum: obj.Sum
                    }
                };

                if (obj.Dimensions) {
                    pushObj['Dimensions'] = obj.Dimensions;
                }

                params.MetricData.push(pushObj);

                // Reset the key
                _stats[key] = {
                    Maximum: 0,
                    Minimum: 0,
                    SampleCount: 0,
                    Sum: 0
                };
            }
        }

        if (params.MetricData.length > 0) {
            // TODO: Check size before sending and split if needed
            cloudwatch.putMetricData(params, function(err, data){
                
                // TODO: if err, see if retryable
                setUploadInterval();
            });
        } else {
            setUploadInterval();
        }
    }

    var setUploadInterval = function() {
        _uploadInterval = setInterval(function(){
            putMetricData();
        }, _timeout * 1000);
    }

    setUploadInterval();    // Call it first to start

    // Public functions

    api.increment = function(key){
        if (!key || typeof key !== 'string' || key.length < 1 || key.length > 100) { return; }

        if (_increments[key] === undefined) {
            _increments[key] = 0;
        }
        _increments[key]++;
    };

    api.stat = function(key, value, unit, dimensions) {
        if (!unit || validMetricValues.indexOf(unit) === -1) { return; } // Only accept valid AWS metrics

        if (_stats[key] === undefined) {
            _stats[key] = {
                Unit: unit,
                Maximum: value,
                Minimum: value,
                SampleCount: 1,
                Sum: value
            };
        } else {
            _stats[key].Maximum = value > _stats[key].Maximum ? value : _stats[key].Maximum;
            _stats[key].Minimum = value < _stats[key].Minimum ? value : _stats[key].Minimum;
            _stats[key].SampleCount++;
            _stats[key].Sum += value;
        }

        if (dimensions && typeof dimensions === 'object' && Object.keys(dimensions).length > 0) {
            _stats[key]['Dimensions'] = [];

            for (name in dimensions) {
                _stats[key]['Dimensions'].push({
                    Name: name,
                    Value: dimensions[name]
                });
            }
        }
    };

    return api;
}

module.exports = CloudWatchBuddyMetrics;