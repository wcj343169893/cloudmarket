'use strict';
const db = uniCloud.database();
/**
 * 每日定时自动创建默认数据
 */
exports.main = async (event, context) => {
	//查询最后一条的时间，然后每次增加5条
	let sales = await db.collection("goods_day_sales").field({
		day: 1
	}).orderBy("day", "desc").limit(1).get();
	let lastDay = sales.data[0].day;
	console.log(lastDay);
	let dayTime;
	for (let i = 1; i < 11; i++) {
		dayTime = getDateString(lastDay, i);
		console.log(dayTime);
		//商品销量
		let saleRes = await db.collection("goods_day_sales").add({
			day: dayTime,
			goods: {}
		});
		console.log("saleRes", saleRes);
		//店铺每日销量
		saleRes = await db.collection("goods_shop_day_sales").add({
			day: dayTime,
			shops: {}
		});
		console.log("saleRes", saleRes);
	}
	return "success"
};


/**
 * 获取日期字符串，例如：20200521
 * @param {string} date 原始日期，例如：20200521
 * @param {int} n  增加天数
 */
const getDateString = function(date, n) {
	let day = new Date(date.substr(0, 4) + "-" + date.substr(4, 2) + "-" + date.substr(-2, 2) + " 00:00:00");
	day.setDate(day.getDate() + n);
	let dayTime = day.getFullYear() + "";
	let month = day.getMonth() + 1;
	let dayNumber = day.getDate();

	if (month < 10) {
		dayTime += "0" + month;
	} else {
		dayTime += month;
	}
	if (dayNumber < 10) {
		dayTime += "0" + dayNumber;
	} else {
		dayTime += dayNumber;
	}
	return dayTime;
}
