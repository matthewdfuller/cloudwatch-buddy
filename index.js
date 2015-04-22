var AWS = require('aws-sdk');

var CloudWatchBuddy;

(function(){
    var cloudwatch, cloudwatchlogs, putMetricData;

    CloudWatchBuddy = function(aws, options) {
        this.increments = {};
        this.stats = {};

        this.namespace = options.namespace; // TODO: check if undefined before using later
        this.timeout = options.timeout || 120;  // Default timeout of 2 minutes

        cloudwatch = new AWS.CloudWatch(aws);
        cloudwatchlogs = new AWS.CloudWatchLogs();

        putMetricData = function() {
            console.log(this.namespace);

            var params = {
                MetricData:[],
                Namespace: this.namespace
            };

            // Add the increments

            if (Object.keys(this.increments).length > 0) {
                _(increments).each(function(val, key){
                    params.MetricData.push({
                        MetricName: key,
                        Timestamp: new Date,
                        Unit: 'Count',
                        Value: val,
                    });
                    increments[key] = 0;  // reset for next time
                });
            }

            // Add the stats
            if (Object.keys(this.stats).length > 0) {
                _(stats).each(function(obj, key){
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
                    stats[key] = {
                        Maximum: 0,
                        Minimum: 0,
                        SampleCount: 0,
                        Sum: 0
                    };
                });
            }

            if (params.MetricData.length > 0) {
                // cloudwatch.putMetricData(params, function(err, data){
                //     // TODO: what to do with callback?
                // });
                console.log(params);
            }
        }

        putLogData = function(params, callback) {
            cloudwatchlogs.putLogData
        }

        // Set interval for sending metrics
        setInterval(function(){
            putMetricData();
        }, this.timeout * 1000);
    }

    CloudWatchBuddy.prototype.increment = function (key) {
        if (this.increments[key] === undefined) {
            this.increments[key] = 0;
        }
        this.increments[key]++;
    };

    CloudWatchBuddy.prototype.stat = function (key, value, unit) {
        if (this.stats[key] === undefined) {
            this.stats[key] = {
                Unit: unit,
                Maximum: value,
                Minimum: value,
                SampleCount: 1,
                Sum: value
            }
        } else {
            this.stats[key].Maximum = value > this.stats[key].Maximum ? value : this.stats[key].Maximum;
            this.stats[key].Minimum = value < this.stats[key].Minimum ? value : this.stats[key].Minimum;
            this.stats[key].SampleCount++;
            this.stats[key].Sum += value;
        }
    };

})();

module.exports = CloudWatchBuddy;