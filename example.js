var CloudWatchBuddy = require(__dirname + '/index.js');

var awsOptions = {
	// AWS options here
};

var cwbOptions = {
	namespace: 'receipts-api',
	timeout: 1
};

var cwb = new CloudWatchBuddy(awsOptions, cwbOptions);

cwb.increment('pageviews');
cwb.increment('pageviews');
cwb.increment('pageviews');
cwb.increment('pageviews');
cwb.increment('pageviews');

cwb.stat('loadtime', 10, 'Milliseconds');
cwb.stat('loadtime', 10, 'Milliseconds');
cwb.stat('loadtime', 10, 'Milliseconds');
cwb.stat('loadtime', 10, 'Milliseconds');

var i=0;
setInterval(function(){
	i++;
	console.log('Waiting: ' + i);
},1000);