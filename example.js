var CloudWatchBuddy = require(__dirname + '/index.js');

var awsOptions = {
	accessKeyId: '',
	secretAccessKey: '',
	sessionToken: '',
	region: 'us-east-1'
};

var cwbMetricsOptions = {
	namespace: 'test-data',
	timeout: 60
};

var cwbLogsOptions = {
	logGroup: 'test-data',
	timeout: 60,
	addInstanceId: false,
	addTimestamp: true,
	logFormat: 'json' //|| 'json'
};

var cwbMetrics = new CloudWatchBuddy(awsOptions).metrics(cwbMetricsOptions);
var cwbLogs = new CloudWatchBuddy(awsOptions).logs(cwbLogsOptions);

cwbMetrics.increment('pageviews');
cwbMetrics.increment('pageviews');
cwbMetrics.increment('pageviews');
cwbMetrics.increment('pageviews');
cwbMetrics.increment('pageviews');

cwbMetrics.stat('loadtime', 10, 'Milliseconds');
cwbMetrics.stat('loadtime', 15, 'Milliseconds');
cwbMetrics.stat('loadtime', 7, 'Milliseconds');
cwbMetrics.stat('loadtime', 100, 'Milliseconds');

cwbMetrics.stat('pagesize', 10, 'Megabytes');

cwbMetrics.stat('serverload', 10, 'Percent', {serverName:'web01.example.com',region:'us-east-1'});
cwbMetrics.stat('serverload', 10, 'Percent', {serverName:'web02.example.com',region:'us-east-1'});

cwbMetrics.stat('serverload', 20, 'Percent', {serverName:'web01.example.com',region:'us-east-1'});
cwbMetrics.stat('serverload', 21, 'Percent', {serverName:'web01.example.com',region:'us-east-1'});
cwbMetrics.stat('serverload', 24, 'Percent', {serverName:'web01.example.com',region:'us-east-1'});
cwbMetrics.stat('serverload', 26, 'Percent', {serverName:'web01.example.com',region:'us-east-1'});
cwbMetrics.stat('serverload', 21, 'Percent', {serverName:'web01.example.com',region:'us-east-1'});
cwbMetrics.stat('serverload', 29, 'Percent', {serverName:'web01.example.com',region:'us-east-1'});
cwbMetrics.stat('serverload', 24, 'Percent', {serverName:'web01.example.com',region:'us-east-1'});

//cwbLogs.log('errors', 'Dual message');
//cwbLogs.log('signups', 'Some user');

var i=0;
setInterval(function(){
	i++;
	cwbMetrics.stat('pagesize', 10, 'Megabytes');
	//cwbLogs.log('errors', 'Dual message: ' + i);
	//cwbLogs.log('signups', 'Some user: ' + i);
},500);