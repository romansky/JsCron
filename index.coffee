logr = require('node-logr').getLogger("JsCron")

exports.jscron = class jscron

	###*
	Cron Format
	-----------
	*	*	*	*	*	*
	|	|	|	|	|	|day of week(0-6)
	|	|	|	|	|month(1-12)
	|	|	|	|day of month(1-31)
	|	|	|hour(0-23)
	|	|minute(0-59)
	|seconds(0-59)

	*	- all the options for that field
	* /2- starting from the first option, every other option
	0	- only use the explicitly provided option
	2,4 - use list of values provided, separated by comma
	###


	@parse : (cron, startTimeUnix, endTimeUnix)->
		if startTimeUnix > endTimeUnix then logr.error("Start time is ahead of end time!") ; return []
		###* first find the minimal time step ###
		cronTimes = []
		day = 24*60*60*1000
		daysDiff = Math.round(Math.abs((endTimeUnix - startTimeUnix)/day))
		startTimeDate = new Date(startTimeUnix)
		endTimeDate = new Date(endTimeUnix)
		[seconds, minutes, hours, days, months, dows] = @_findOptions(cron)
		zDay = null
		daysSinceEpoch = (date)-> Math.floor(date.getTime() / day)
		lastDay = daysSinceEpoch(endTimeDate)
		getNextDay = (refDate)->
			if not refDate then startTimeDate
			else new Date(refDate.getTime()+day)
		while daysSinceEpoch(zDay = getNextDay(zDay)) <= lastDay
			if zDay.getUTCDate() not in days then continue
			if zDay.getUTCMonth()+1 not in months then continue
			if zDay.getUTCDay() not in dows then continue
			isStartDay = daysSinceEpoch(zDay) == daysSinceEpoch(startTimeDate)
			isEndDay = daysSinceEpoch(zDay) == daysSinceEpoch(endTimeDate)
			zDayHours = hours
			if isStartDay then zDayHours = zDayHours.filter((h)-> h >= startTimeDate.getUTCHours())
			if isEndDay then zDayHours = zDayHours.filter((h)-> h <= endTimeDate.getUTCHours())
			for hour in zDayHours
				isStartHour = isStartDay && hour == startTimeDate.getUTCHours()
				isEndHour = isEndDay && hour == endTimeDate.getUTCHours()
				zDayMinutes = minutes
				if isStartHour then zDayMinutes = zDayMinutes.filter((m)-> m >= startTimeDate.getUTCMinutes())
				if isEndHour then zDayMinutes = zDayMinutes.filter((m)-> m <= endTimeDate.getUTCMinutes())
				for minute in zDayMinutes
					isStartMinute = isStartHour && minute == startTimeDate.getUTCMinutes()
					isEndMinute = isEndHour && minute == endTimeDate.getUTCMinutes()
					zDaySeconds = seconds
					if isStartMinute then zDaySeconds = zDaySeconds.filter((s)-> s >= startTimeDate.getUTCSeconds())
					if isEndMinute then zDaySeconds = zDaySeconds.filter((s)-> s < endTimeDate.getUTCSeconds())
					for second in zDaySeconds
						cronTimes.push(Date.UTC(
							zDay.getUTCFullYear(),
							zDay.getUTCMonth(),
							zDay.getUTCDate(),
							hour,
							minute,
							second
						))
						# debug
						# console.log new Date(cronTimes[cronTimes.length-1])
		return cronTimes


	@timeToCron : (time)->
		date = new Date(time)
		"#{date.getUTCSeconds()} #{date.getUTCMinutes()} #{date.getUTCHours()} #{date.getUTCDate()} #{date.getUTCMonth()+1} *"
		

	@_findOptions : (cron)->
		if cron.split(" ").length < 6 then return null
		[seconds, minutes, hours, dayOfMonth, month, dayOfWeek] = cron
		allowedNum = [[0,59],[0,59],[0,23],[1,31],[1,12],[0,6]]
		res = []
		for param in cron.split(" ")
			if not /^[0-9]*$/.test(param) 
				if param == "*" then res.push([allowedNum[res.length][0] .. allowedNum[res.length][1]])
				else if /^[0-9\*\-]*\/*[0-9\*]*$/.test(param)
					[range, step] = param.split("/")
					step = parseInt(step)
					if range == "*" then range = [allowedNum[res.length][0]..allowedNum[res.length][1]]
					else if /^[0-9]*-[0-9]*$/.test(range)
						start = parseInt(range.split("-")[0])
						finish = parseInt(range.split("-")[1])
						range = [start..finish]
					rangeRes = (x for x in range by step)
					res.push(rangeRes)
				else if /^[0-9\,]*/.test(param)
					values = ( parseInt(x) for x in param.split(",") )
					res.push(values)
			else 
				p = parseInt(param)
				if p >= allowedNum[res.length][0] && p <= allowedNum[res.length][1]
					res.push([p])
		return res
