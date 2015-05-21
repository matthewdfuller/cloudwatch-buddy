### 0.0.12
* Fixed bug causing minimum metric value to be set to zero when only one sample

### 0.0.11
* If sample count is 0, change to 1 but keep values as 0 so the charts maintain a connected line

### 0.0.10
* Fixed bug affecting metrics with dimensions submitted when sample count was 0

### 0.0.9
* Adding ability to subfolder logs in S3

### 0.0.8
* Removing spacing in JSON stringify so logs in S3 are stored as one line

### 0.0.7
* Fixing a bug - accidentally published version where logs default timeout was 5 seconds

### 0.0.6
* Added the ability to copy logs to S3 using s3Bucket and s3Prefix options DO NOT USE - contains bug (see above)

### 0.0.5
* Added debug option to log to console all events

### 0.0.4
* Added multi-dimension support

### 0.0.3
* Fixing bug where instance id was hard-coded as a string rather than the actual instance ID

### 0.0.2
* Fixing bug where metrics were not sent due to a return statement before the cloudwatch call

### 0.0.1
* First release, beta