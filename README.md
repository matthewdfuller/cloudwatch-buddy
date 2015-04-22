cloudwatch-buddy
===============

## Description

cloudwatch-buddy is a node module which easily allows for the sending of CloudWatch metrics, statistics, and logs to AWS CloudWatch. It gracefully hadles single increments (such as pageviews), as well as more complex measurements (page load times or size) with sum, minimums, and maximums. Additionally, it can stream logs to AWS, dealing with the timestamps and formatting issues. It also manages periodic sending of data, the AWS "next token" pattern, and size restrictions.

## Features

* Simple "increment" measurements
* Statistics (sum, minimum, maximum) across a timeframe
* Periodic uploading
* Size management
* Log ordering
* Retrying of failed data submissions

