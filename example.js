var CloudWatchBuddy = require(__dirname + '/index.js');

var awsOptions = {
	// AWS options here
};

var cwbOptions = {
	namespace: 'receipts-api',
	timeout: 1,
	addInstanceId: true,
	addTimestamp: true,
	logFormat: 'string' //|| 'json'
};

var cwb = new CloudWatchBuddy(awsOptions, cwbOptions);

cwb.increment('pageviews');
cwb.increment('pageviews');
cwb.increment('pageviews');
cwb.increment('pageviews');
cwb.increment('pageviews');

cwb.stat('loadtime', 10, 'Milliseconds');
cwb.stat('loadtime', 15, 'Milliseconds');
cwb.stat('loadtime', 7, 'Milliseconds');
cwb.stat('loadtime', 100, 'Milliseconds');

cwb.stat('pagesize', 10, 'Megabytes');

cwb.log('Test message');

var i=0;
setInterval(function(){
	i++;
	console.log('Waiting: ' + i);
},1000);