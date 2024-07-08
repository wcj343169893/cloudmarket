/**
 * 中国时差
 */
let timeZone = 8;

/**
 * 获取当天时间戳，写入数据和取出数据，不需要增加时差
 */
function getTodayTime(day = 0, check = false) {
	let time = new Date();
	time.setMinutes(0);
	time.setSeconds(0);
	time.setMilliseconds(0)
	if (check) {
		//由于时差问题，我们的0点，是utc的前一天16点
		time.setHours(time.getHours() + timeZone);
		time.setHours(timeZone*-1);
	} else {
		time.setHours(0);
	}
	if (day != 0) {
		time.setDate(time.getDate() + day);
	}
	console.log("getTodayTime", day, check, time.getTime())
	return time.getTime();
}

/**
 * 根据时间戳，获得日期，存在8小时时差
 */
function getDateByTime(timestamp) {
	let time;
	if (timestamp) {
		time = new Date(timestamp);
	} else {
		time = new Date();
	}
	time.setHours(timeZone);
	return time.getDate();
}
/**
 * 获取当前的小时数，存在8小时时差
 */
function getNowHours() {
	let time = new Date();
	time.setHours(time.getHours() + timeZone);
	return time.getHours();
}
module.exports = {
	getTodayTime,
	getDateByTime,
	getNowHours
}
