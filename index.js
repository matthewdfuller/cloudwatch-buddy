var AWS = require('aws-sdk');

var metricsHelper = require(__dirname + '/metrics.js');
var logsHelper = require(__dirname + '/logs.js');

var CloudWatchBuddy = function(aws){
    // Ensure a region is passed
    if (!aws || !aws.region) {
        throw new Error('Valid AWS config with a region is required');
    }

    AWS.config.update(aws);

    return {
        metrics: function(options) {
            if (!options || !options.namespace) {
                throw new Error('Valid metrics config with namespace is required');
            }

            var cloudwatch = new AWS.CloudWatch(aws);
            return new metricsHelper(cloudwatch, options);
        },
        logs: function(options) {
            if (!options || !options.logGroup || typeof options.logGroup !== 'string' || options.logGroup.length > 512) {
                throw new Error('Valid logs config with log group is required');
            }

            var cloudwatchlogs = new AWS.CloudWatchLogs(aws);
            var svc = new AWS.MetadataService(aws);
            return new logsHelper(cloudwatchlogs, svc, options);
        }
    }
}

module.exports = CloudWatchBuddy;