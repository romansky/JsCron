JsCron [![Build Status](https://travis-ci.org/romansky/JsCron.png)](https://travis-ci.org/romansky/JsCron)
======

Javascript cron parser, schedule date generator

## Usage
	

	var cron = "0 * * * * *";
	var aMinute = 1000 * 60;
	var startTime = Date.now();
	var endTime = startTime + aMinute*5;
	res = require('jscron').jscron.parse(cron,startTime,endTime) 
	console.log(res)
	#> [1350397740000,1350397800000,1350397860000,1350397920000,1350397980000]
	/* The above in the first second for the next five minutes */
	res.forEach(function(i){ console.log(new Date(i))})
	#> Tue Oct 16 2012 16:29:00 GMT+0200 (IST)
	#> Tue Oct 16 2012 16:30:00 GMT+0200 (IST)
	#> Tue Oct 16 2012 16:31:00 GMT+0200 (IST)
	#> Tue Oct 16 2012 16:32:00 GMT+0200 (IST)
	#> Tue Oct 16 2012 16:33:00 GMT+0200 (IST)
	
## Supported Cron Formatting


### General Format

	*	*	*	*	*	*
	|	|	|	|	|	|day of week(0-6)
	|	|	|	|	|month(1-12)
	|	|	|	|day of month(1-31)
	|	|	|hour(0-23)
	|	|minute(0-59)
	|seconds(0-59)

See [WikiPedia](http://en.wikipedia.org/wiki/Cron) for more information about the format

### Supported Formatting Of Specific Fields

 * `*`  all the options for that field
 * `*/2` starting from the first option, every other option
 * `0` only use the explicitly provided option
 * `2,4,9` use list of values provided, separated by comma

## Installation

	npm install jscron
