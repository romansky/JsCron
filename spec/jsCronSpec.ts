import "jasmine";
import {jscron} from "../src";

describe("JsCron", function () {

    describe("input format validation", function () {
        it("allows just numbers", () => expect(jscron._findOptions("1 1 1 1 1 1")).toEqual([[1], [1], [1], [1], [1], [1]]));
        it("allows astrisks", () => expect(jscron._findOptions("* * * * * *")).toEqual([__range__(0, 59, true), __range__(0, 59, true), __range__(0, 23, true), __range__(1, 31, true), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [0, 1, 2, 3, 4, 5, 6]]));
        it("allows steps", () => expect(jscron._findOptions("*/10 */5 */3 */12 */5 */2")).toEqual([[0, 10, 20, 30, 40, 50], [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55], [0, 3, 6, 9, 12, 15, 18, 21], [1, 13, 25], [1, 6, 11], [0, 2, 4, 6]]));

        it("allows steps with ranges", () => expect(jscron._findOptions("0-10/10 0-10/5 0-10/3 1-10/12 1-10/5 0-4/2")).toEqual([[0, 10], [0, 5, 10], [0, 3, 6, 9], [1], [1, 6], [0, 2, 4]]));
        return it("allows comma delimited preset values", () => expect(jscron._findOptions("1,2 3,4 5,6 7,8 9,10 1,4")).toEqual([[1, 2], [3, 4], [5, 6], [7, 8], [9, 10], [1, 4]]));
    });

    return describe("poking with a stick", function () {

        it("parses 'every second' directive in cron format and return valid results for a full hour", function () {
            const cron = "* * * * * *";
            const startTime = Date.now();
            const endTime = Date.now() + (60 * 60 * 1000);
            const res = jscron.parse(cron, startTime, endTime);
            return expect(res.length).toEqual(60 * 60);
        });

        it("gets all seconds for full hour overnight", function () {
            const cron = "* * * * * *";
            const startTime = new Date(new Date().getFullYear(), 6, 12, 23, 12).getTime();
            const endTime = startTime + (60 * 60 * 1000);
            // console.log(startTime, endTime);
            const res = jscron.parse(cron, startTime, endTime);
            return expect(res.length).toEqual(60 * 60);
        });

        it("gets all seconds for full hour morning", function () {
            const cron = "* * * * * *";
            const startTime = new Date(new Date().getFullYear(), 6, 13, 1, 1).getTime();
            const endTime = startTime + (60 * 60 * 1000);
            // console.log(startTime, endTime);
            const res = jscron.parse(cron, startTime, endTime);
            return expect(res.length).toEqual(60 * 60);
        });

        it("ignores a date range that is outside of allowed month", function () {
            const cron = "0 0 0 1 1 *";
            const startTime = Date.UTC(2012, 1, 1);
            const endTime = Date.UTC(2012, 2, 1);
            const res = jscron.parse(cron, startTime, endTime);
            return expect(res.length).toEqual(0);
        });


        it("returns date ranges per hour", function () {
            const cron = "0 0 * * * *";
            const startTime = Date.UTC(2012, 1, 1, 1);
            const endTime = Date.UTC(2012, 1, 2, 1);
            const res = jscron.parse(cron, startTime, endTime);
            return expect(res.length).toEqual(24);
        });


        it("handles the days correctly", function () {
            const cron = "0 0 0 1 * *";
            const startTime = Date.UTC(2000, 0, 1);
            const endTime = Date.UTC(2012, 0, 1);
            return expect(jscron.parse(cron, startTime, endTime).length).toEqual(12 * 12);
        });

        it("handles months correctly", function () {
            const cron = "0 0 0 1 1 *";
            const startTime = Date.UTC(2000, 0, 1);
            const endTime = Date.UTC(2012, 0, 1);
            return expect(jscron.parse(cron, startTime, endTime).length).toEqual(12);
        });

        it("handles days of week correctly", function () {
            const cron = "0 0 0 * * 0";
            const startTime = Date.UTC(2012, 9, 1);
            const endTime = Date.UTC(2012, 9, 31);
            return expect(jscron.parse(cron, startTime, endTime).length).toEqual(4);
        });

        return it("can generate cron formatted string for given time", function () {
            const givenTime = Date.UTC(2012, 9, 1, 12, 11, 10);
            const expectedCron = "10 11 12 1 10 *";
            return expect(jscron.timeToCron(givenTime)).toEqual(expectedCron);
        });
    });
});


function __range__(left: number, right: number, inclusive: boolean) {
    let range = [];
    let ascending = left < right;
    let end = !inclusive ? right : ascending ? right + 1 : right - 1;
    for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
        range.push(i);
    }
    return range;
}
