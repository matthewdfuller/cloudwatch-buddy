cloudwatch-buddy
===============

WARNING: This is currently in "beta" and has not been extensively tested. Please wait for a 1.0.0 release before using in production. Until then, feel free to create issues or pull requests.

## Description

cloudwatch-buddy is a node module which easily allows for the sending of CloudWatch metrics, statistics, and logs to AWS CloudWatch. Using this module, you can easily replace StatsD with AWS CloudWatch. It gracefully hadles single increments (such as pageviews), as well as more complex measurements (page load times or size) with sum, minimums, and maximums with custom dimensions. Additionally, it can stream logs to AWS, dealing with the timestamps and formatting issues. It also manages periodic sending of logs and the AWS "next token" pattern.

## Features

* Simple "increment" measurements
* Statistics (sum, minimum, maximum) across a timeframe
* Custom dimensions
* Periodic uploading
* Log ordering
* Retrying of failed data submissions
* Sending 0 as value so application has data

## Usage

```
npm install cloudwatch-buddy
```

```
var CloudWatchBuddy = require('cloudwatch-buddy');

var awsOptions = {
	accessKeyId: 'access',		// Optional. It is suggested to use IAM roles (see permissions below)
	secretAccessKey: 'secret',	// Optional
	sessionToken: 'session',	// Optional
	region: 'us-east-1'			// Required. You must enter a valid AWS region
};

var metricsOptions = {			// You can use either or both metric and log collection.
	namespace: 'test-data',
	timeout: 60					// See below for a complete list of options
};

var logsOptions = {
	logGroup: 'my-application',
	timeout: 60,
	maxSize: 10000,
	addInstanceId: true,
	addTimestamp: true,
	logFormat: 'string'
};

var cwbMetrics = new CloudWatchBuddy(awsOptions).metrics(metricsOptions);
var cwbLogs = new CloudWatchBuddy(awsOptions).logs(logsOptions);

// Submit a simple Count metric for page views
cwbMetrics.increment('pageviews');

// Submit a metric with a unit, keeping track of sum, minimum, maximum
cwbMetrics.stat('loadtime', 10, 'Milliseconds');

// Submit a metric with a unit, with custom dimensions
cwbMetrics.stat('serverload', 10, 'Percent', {
	serverName:'web01.example.com',region:'us-east-1'
});

// Send a log
cwbLogs.log('errors', 'Test message');
cwbLogs.log('signups', 'New user');
```

## Options

### AWS Options

The AWS options object must be a valid config object supported by AWS (see: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html). You *must* provide a region.

### Metrics

The following metrics options are supported:

`namespace` (Required) - The AWS name space that all metrics should be submitted under. Note: to use multiple namespaces, you must instantiate separate metrics objects.

`timeout` - The interval, in seconds, to submit your metrics. The minimum is 60 seconds (AWS CloudWatch charts only show minute-level metrics) and the maximum is 30 minutes (1800 s). The default is 120 seconds.

### Logs

The following logs options are supported:

`logGroup` (Required) - The log group name in AWS. This must already exist (the module will create streams for you, but not log groups).

`timeout` - The interval, in seconds, to submit your logs. The minimum is 60 seconds and the maximum is 30 minutes (1800 s). The default is 120 seconds.

`maxSize` - The maximum size, in bytes, of a log stream group between uploads. The minimum is 5000 and the maximum is 1048576 (~1MB). The default is 200000 (200KB). Note that this is a *rough estimate*.

`logFormat` - Either "string" or "json". For string, the logs are written as timestamp - instance id - log message. For JSON, it is saved as an object with these same keys. The default is "string".

`addTimestamp` - Whether the timestamp should be included in the log message. All logs have timestamps sent to AWS (used for ordering), but this option allows the timestamp to be included in the actual log message contents as well. The default is false.

`addInstanceId` - Whether the EC2 instance ID should be included in the log message. The default is false. The module will attempt to load the instance ID from the AWS metadata service. If it cannot be determined, the instance ID will become "unknown".


## Known Limitations

* Because of the 40KB limit imposed by API calls to CloudWatch, the number of stats that can be recorded is limited to approximately 100. This means that you can have 100 separate metric names ("page load time," "page size," etc.). You can update them as often as needed, either as increments or with dimensions, but you cannot create too many. Note: this is probably a good limit, as AWS imposes limits on the number of distinct metric names you can have as well.

* The log group must exist on AWS before the module can write the logs. Future versions may allow for the log group to be created automatically, but it would require more permissions than are preferred. At this point, simply create the log group for your application before running this module.