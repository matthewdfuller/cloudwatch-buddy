var CloudWatchBuddy = require(__dirname + '/index.js');

var awsOptions = {
	accessKeyId: '',
	secretAccessKey: '',
	sessionToken: '',
	region: 'us-east-1'
};

var cwbMetricsOptions = {
	namespace: 'test-data',
	timeout: 5
};

var cwbMetricsOptions = {
	logGroup: 'test-data',
	timeout: 10,
	addInstanceId: false,
	addTimestamp: true,
	logFormat: 'json' //|| 'json'
};

//var cwbMetrics = new CloudWatchBuddy(awsOptions).metrics(cwbMetricsOptions);
var cwbLogs = new CloudWatchBuddy(awsOptions).logs(cwbMetricsOptions);

// cwbMetrics.increment('pageviews');
// cwbMetrics.increment('pageviews');
// cwbMetrics.increment('pageviews');
// cwbMetrics.increment('pageviews');
// cwbMetrics.increment('pageviews');

// cwbMetrics.stat('loadtime', 10, 'Milliseconds');
// cwbMetrics.stat('loadtime', 15, 'Milliseconds');
// cwbMetrics.stat('loadtime', 7, 'Milliseconds');
// cwbMetrics.stat('loadtime', 100, 'Milliseconds');

// cwbMetrics.stat('pagesize', 10, 'Megabytes');

//cwbMetrics.stat('serverload', 10, 'Percent', {serverName:'web01.example.com',region:'us-east-1'});

cwbLogs.log('errors', 'Test message');

var i=0;
setInterval(function(){
	i++;
	//console.log('Waiting: ' + i);
},1000);