
export class jscron {

    /**
     Cron Format
     -----------
     *    *    *    *    *    *
     |    |    |    |    |    |day of week(0-6)
     |    |    |    |    |month(1-12)
     |    |    |    |day of month(1-31)
     |    |    |hour(0-23)
     |    |minute(0-59)
     |seconds(0-59)

     *    - all the options for that field
     * /2- starting from the first option, every other option
     0    - only use the explicitly provided option
     2,4 - use list of values provided, separated by comma
     */


    static parse(cron: string, startTimeUnix: number, endTimeUnix: number) {
        if (startTimeUnix > endTimeUnix) {
            console.error("Start time is ahead of end time!");
            return [];
        }
        /** first find the minimal time step */
        const cronTimes = [];
        const day = 24 * 60 * 60 * 1000;
        const startTimeDate = new Date(startTimeUnix);
        const endTimeDate = new Date(endTimeUnix);
        const foundInRange = this._findOptions(cron);
        if (!foundInRange)
            throw new Error("expected six parameters in input");
        const [seconds, minutes, hours, days, months, dows] = foundInRange;
        let zDay = null;
        const daysSinceEpoch = (date: Date) => Math.floor(date.getTime() / day);
        const lastDay = daysSinceEpoch(endTimeDate);
        const getNextDay = (refDate: Date | null) => {
            if (!refDate) {
                return startTimeDate;
            } else {
                return new Date(refDate.getTime() + day);
            }
        };
        while (daysSinceEpoch(zDay = getNextDay(zDay)) <= lastDay) {
            if (!days.includes(zDay.getUTCDate())) continue;
            if (!months.includes(zDay.getUTCMonth() + 1)) continue;
            if (!dows.includes(zDay.getUTCDay())) continue;

            const isStartDay = daysSinceEpoch(zDay) === daysSinceEpoch(startTimeDate);
            const isEndDay = daysSinceEpoch(zDay) === daysSinceEpoch(endTimeDate);
            let zDayHours = hours;
            if (isStartDay)
                zDayHours = zDayHours.filter((h: number) => h >= startTimeDate.getUTCHours());
            if (isEndDay)
                zDayHours = zDayHours.filter((h: number) => h <= endTimeDate.getUTCHours());
            for (let hour of zDayHours) {
                const isStartHour = isStartDay && (hour === startTimeDate.getUTCHours());
                const isEndHour = isEndDay && (hour === endTimeDate.getUTCHours());
                let zDayMinutes = minutes;
                if (isStartHour) {
                    zDayMinutes = zDayMinutes.filter(m => m >= startTimeDate.getUTCMinutes());
                }
                if (isEndHour) {
                    zDayMinutes = zDayMinutes.filter(m => m <= endTimeDate.getUTCMinutes());
                }
                for (let minute of zDayMinutes) {
                    const isStartMinute = isStartHour && (minute === startTimeDate.getUTCMinutes());
                    const isEndMinute = isEndHour && (minute === endTimeDate.getUTCMinutes());
                    let zDaySeconds = seconds;
                    if (isStartMinute) {
                        zDaySeconds = zDaySeconds.filter(s => s >= startTimeDate.getUTCSeconds());
                    }
                    if (isEndMinute) {
                        zDaySeconds = zDaySeconds.filter(s => s < endTimeDate.getUTCSeconds());
                    }
                    for (let second of zDaySeconds) {
                        cronTimes.push(Date.UTC(
                            zDay.getUTCFullYear(),
                            zDay.getUTCMonth(),
                            zDay.getUTCDate(),
                            hour,
                            minute,
                            second
                        ));
                    }
                }
            }
        }
        // debug
        // console.log new Date(cronTimes[cronTimes.length-1])
        return cronTimes;
    }


    static timeToCron(time: number) {
        const date = new Date(time);
        return `${date.getUTCSeconds()} ${date.getUTCMinutes()} ${date.getUTCHours()} ${date.getUTCDate()} ${date.getUTCMonth() + 1} *`;
    }


    static _findOptions(cron: string): [number[], number[], number[], number[], number[], number[]] | null {
        if (cron.split(" ").length < 6)
            return null;
        const allowedNum = [[0, 59], [0, 59], [0, 23], [1, 31], [1, 12], [0, 6]];
        const res = new Array<number[]>();
        for (const param of cron.split(" ")) {
            if (!/^[0-9]*$/.test(param)) {
                if (param === "*") {
                    res.push(__range__(allowedNum[res.length][0], allowedNum[res.length][1], true));
                } else if (/^[0-9*\-]*\/*[0-9*]*$/.test(param)) {
                    const [range, step] = param.split("/");
                    const _step = parseInt(step);
                    let _range: number[] = [];
                    if (range === "*") {
                        _range = __range__(allowedNum[res.length][0], allowedNum[res.length][1], true);
                    } else if (/^[0-9]*-[0-9]*$/.test(range)) {
                        const start = parseInt(range.split("-")[0]);
                        const finish = parseInt(range.split("-")[1]);
                        _range = __range__(start, finish, true);
                    }
                    const rangeRes = ((() => {
                        const result = [];
                        for (let step1 = _step, asc = step1 > 0, i = asc ? 0 : _range.length - 1; asc ? i < _range.length : i >= 0; i += step1) {
                            result.push(_range[i]);
                        }
                        return result;
                    })());
                    res.push(rangeRes);
                } else if (/^[0-9,]*/.test(param)) {
                    const values = ((() => {
                        const result1 = [];
                        for (const x of param.split(",")) {
                            result1.push(parseInt(x));
                        }
                        return result1;
                    })());
                    res.push(values);
                }
            } else {
                const p = parseInt(param);
                if ((p >= allowedNum[res.length][0]) && (p <= allowedNum[res.length][1])) {
                    res.push([p]);
                }
            }
        }
        return res as [number[], number[], number[], number[], number[], number[]];
    }
}

function __range__(left: number, right: number, inclusive: boolean): number[] {
    let range = [];
    let ascending = left < right;
    let end = !inclusive ? right : ascending ? right + 1 : right - 1;
    for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
        range.push(i);
    }
    return range;
}
