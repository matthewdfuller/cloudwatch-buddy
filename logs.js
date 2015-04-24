var async = require('async');

var CloudWatchBuddyLogs = function(cloudwatchlogs, svc, options){

    var api = {};

    var _logs = {};

    var _existingLogStreams = {};   // Holds known streams and their sequence tokens

    var _uploadInterval;

    var _logGroup = options.logGroup;
    var _timeout = (options.timeout && typeof options.timeout === 'number' && options.timeout >= 60 && options.timeout <= 1800) ? options.timeout : 5;
    var _maxSize = (options.maxSize && typeof options.maxSize === 'number' && options.maxSize < 40000) ? options.maxSize : 40000;  // Max upload size if 40KB
    var _logFormat = (options.logFormat && typeof options.logFormat === 'string' && (options.logFormat === 'string' || options.logFormat === 'json')) ? options.logFormat : 'string';
    var _addTimestamp = (options.addTimestamp && typeof options.addTimestamp === 'boolean') ? options.addTimestamp : false;
    var _addInstanceId = (options.addInstanceId && typeof options.addInstanceId === 'boolean') ? options.addInstanceId : false;

    var _instanceId = 'unknown';

    // If _addInstanceId is set, then request the instance ID from AWS
    if (_addInstanceId) {
        svc.request('/latest/meta-data/instance-id', function(err, data){
            if (!err && data) {
                _instanceId = data; // set the instance ID in the background during initiation
            }
        });
    }

    var putLogData = function() {
        clearInterval(_uploadInterval);
        console.log('Put data called');
        async.eachSeries(Object.keys(_logs), function(stream, callback){
            if (!_logs[stream].length) {
                return callback();    // go to the next one
            }

            console.log('Running steps for: ' + stream);

            checkIfLogStreamExistsAndCreateItIfItDoesNot(stream, function(err, data){
                if (err) {
                    callback(err);
                } else {
                    // Stream now exists
                    console.log('Stream now exists');
                    var params = {
                        logEvents: _logs[stream],
                        logGroupName: _logGroup,
                        logStreamName: stream,
                        sequenceToken: _existingLogStreams[stream]
                    };
                    cloudwatchlogs.putLogEvents(params, function(err, data){
                        if (err) {
                            console.log('Error putting log events');
                            if (err.code === 'InvalidSequenceTokenException') {
                                console.log('InvalidSequenceTokenException');
                                params.sequenceToken = err.message.substring(err.message.indexOf(':') + 2);
                                console.log('New sequence token is: ' + params.sequenceToken);
                                cloudwatchlogs.putLogEvents(params, function(err, data){
                                    console.log(err);
                                    console.log(data);
                                });
                            }
                        } else {
                            console.log('Put log events');
                            _existingLogStreams[stream] = data.nextSequenceToken;   // Set this for next time
                            _logs[stream] = []; // Remove the logs
                            callback();
                        }
                    });
                }
            });
        }, function(err){
            if (err) {
                console.log(err);
            } else {
                console.log('Done stream');
                setUploadInterval();    // Reset timer for next loop
            }
        });
    };

    var checkLogsBodySize = function(stream) {
        var size = (JSON.stringify(_logs[stream]) * 2) + (_logs[stream].length * 26) + 1000;   // very rough estimate of size overhead, plus 26 bytes per log

        if (size > _maxSize || _logs[stream].length > 10000) {  // AWS limit of 10000
            putLogData();
        }
    };

    var checkIfLogStreamExistsAndCreateItIfItDoesNot = function(stream, callback) {
        if (_existingLogStreams[stream]) {
            console.log('Existing stream for: ' + stream);
            callback();
        } else {
            console.log('Checking stream for: ' + stream);
            var params = {
                logGroupName: _logGroup,
                logStreamNamePrefix: stream,
                limit: 1
            };
            cloudwatchlogs.describeLogStreams(params, function(err, data){
                if (!err && data.logStreams.length > 0) {
                    console.log('Successfully described streams');
                    // The stream already exists, so add it to our known array and continue
                    _existingLogStreams[stream] = null; // Will eventually hold the sequence token
                    callback();
                } else {
                    // Create the stream
                    console.log('Creating stream');
                    var params = {
                        logGroupName: _logGroup,
                        logStreamName: stream
                    };
                    cloudwatchlogs.createLogStream(params, callback);
                }
            });
        }
    };


    var setUploadInterval = function() {
        _uploadInterval = setInterval(function(){
            console.log('upload setInterval');
            putLogData();
        }, _timeout * 1000);
    };

    setUploadInterval();    // Call it first to start

    // Public functions

    api.log = function(stream, msg) {
        if (_logs[stream] === undefined) {
            _logs[stream] = [];
        }

        if (_logFormat === 'string') {
            if (typeof msg === 'object') {
                msg = JSON.stringify(msg);
            }
            _logs[stream].push({
                timestamp: new Date().getTime(),
                message: (_addTimestamp ? new Date + ' ' : '') + (_addInstanceId ? 'instand-id ' : '') + msg
            });
        } else {
            var logObj = {};
            if (_addTimestamp) { logObj['timestamp'] = new Date; }
            if (_addInstanceId) { logObj['instand_id'] = 'instand-id'; }
            logObj['message'] = msg;
            _logs[stream].push({
                timestamp: new Date().getTime(),
                message: JSON.stringify(logObj, null, 2)    // AWS only accepts a string
            });
        }
    };

    return api;
}

module.exports = CloudWatchBuddyLogs;