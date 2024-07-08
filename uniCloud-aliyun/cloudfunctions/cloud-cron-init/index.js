'use strict';
const db = uniCloud.database();
const cmd = db.command;
//商品日销量
const goodsDaySalesCollection = db.collection("cloud_goods_day_sales");
//店铺日销量
const goodsShopDaySalesCollection = db.collection("cloud_goods_shop_day_sales");
const {
	getDateFormat,
} = require('base-common');
/**
 * 每日定时自动创建默认数据
 */
exports.main = async (event, context) => {
	await genGoodsDaySalesCollection();
	await genGoodsShopDaySalesCollection();
	return "success"
};

const genGoodsDaySalesCollection = async (isReplace) => {
	if (isReplace) {
		await goodsDaySalesCollection.where({
			_id: cmd.exists(true)
		}).remove()
	}
	//查询最后一条的时间，然后每次增加5条
	let sales = await goodsDaySalesCollection.field({
		day: 1
	}).orderBy("day", "desc").limit(1).get();
	let lastDay;
	if (sales.data.length == 0) {
		lastDay = getDateFormat("yyyy-MM-dd");
	} else {
		lastDay = sales.data[0].day;
	}
	console.log(lastDay);
	let dayTime;
	for (let i = 1; i < 11; i++) {
		dayTime = getDateString(lastDay, i);
		console.log(dayTime);
		//商品销量
		let saleRes = await goodsDaySalesCollection.add({
			day: dayTime,
			total: 0,
			goods: {}
		});
		console.log("saleRes", saleRes);
	}
}
const genGoodsShopDaySalesCollection = async (isReplace) => {
	if (isReplace) {
		await goodsShopDaySalesCollection.where({
			_id: cmd.exists(true)
		}).remove()
	}
	//查询最后一条的时间，然后每次增加5条
	let sales = await goodsShopDaySalesCollection.field({
		day: 1
	}).orderBy("day", "desc").limit(1).get();
	let lastDay;
	if (sales.data.length == 0) {
		lastDay = getDateFormat("yyyy-MM-dd");
	} else {
		lastDay = sales.data[0].day;
	}
	console.log(lastDay);
	let dayTime;
	for (let i = 1; i < 11; i++) {
		dayTime = getDateString(lastDay, i);
		console.log(dayTime);
		//店铺每日销量
		let saleRes = await goodsShopDaySalesCollection.add({
			day: dayTime,
			total: 0,
			shops: {}
		});
		console.log("saleRes", saleRes);
	}
}


/**
 * 获取日期字符串，例如：20200521
 * @param {string} date 原始日期，例如：2020-05-21
 * @param {int} n  增加天数
 */
const getDateString = function(date, n) {
	let day = new Date(date + " 00:00:00");
	day.setDate(day.getDate() + n);
	return getDateFormat("yyyy-MM-dd",day.getTime());
}
