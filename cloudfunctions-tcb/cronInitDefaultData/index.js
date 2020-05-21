'use strict';
const db = uniCloud.database();
/**
 * 每日定时自动创建默认数据
 */
exports.main = async (event, context) => {
	let dayTime = getDateString()
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
	return "success"
};


/**
 * 获取日期字符串，例如：20200521
 */
const getDateString = function() {
	let day = new Date();
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
