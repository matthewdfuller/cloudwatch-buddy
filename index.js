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

            if (options.namespace.indexOf('AWS/') === 0) {
                throw new Error('Namespace cannot begin with "AWS/"');
            }

            var cloudwatch = new AWS.CloudWatch(aws);
            return new metricsHelper(cloudwatch, options);
        },
        logs: function(options) {
            if (!options || !options.logGroup || typeof options.logGroup !== 'string' || options.logGroup.length > 512) {
                throw new Error('Valid logs config with log group is required');
            }

            if (options.logGroup.length > 512) {
                throw new Error('Log group name cannot be more than the AWS limit of 512 characters');
            }

            var cloudwatchlogs = new AWS.CloudWatchLogs(aws);
            var svc = new AWS.MetadataService(aws);
            var s3 = new AWS.S3(aws);

            return new logsHelper(cloudwatchlogs, svc, s3, options);
        }
    }
}

module.exports = CloudWatchBuddy;